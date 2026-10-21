import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { EarTagVariant } from "@/data/earTagVariants";
import { createEarTag, type EarTagInstance } from "@/components/eartag3d/earTagModel";
import { createStage, damp, type Stage } from "@/components/eartag3d/stage";
import { createCow, type CoatId, type Cow, type CowPose } from "@/components/eartag3d/simulation/cow";
import type { FrameInput, Scenario } from "@/components/eartag3d/simulation/telemetry";

/**
 * The 3D pasture: a tagged cow that behaves according to the chosen health
 * scenario, a LoRaWAN gateway, a virtual geofence, the GPS trail and the
 * radio packets flying between tag and gateway. All units are metres.
 */

export type CameraMode = "overview" | "follow" | "ear";
export type BehaviourKind = "graze" | "walk" | "idle" | "lethargic" | "pant" | "shade";

export const FENCE_RADIUS = 9;
const GATEWAY_POSITION = new THREE.Vector3(-11, 0, -7);
const GATEWAY_ANTENNA = new THREE.Vector3(-11, 5.75, -7);
const SHADE_SPOT = new THREE.Vector2(-4.4, 4.0);

export interface OverlayPoint {
  x: number;
  y: number;
  visible: boolean;
}

export type OverlayPositions = Record<"tag" | "gateway" | "cow", OverlayPoint>;

interface Packet {
  curve: THREE.QuadraticBezierCurve3;
  arc: THREE.Line;
  dot: THREE.Mesh;
  glow: THREE.Mesh;
  t: number;
  duration: number;
  life: number;
}

interface Pulse {
  mesh: THREE.Mesh;
  t: number;
}

const SKY = {
  dayTop: new THREE.Color(0x4f9fd8),
  dayBottom: new THREE.Color(0xdcf0f6),
  duskTop: new THREE.Color(0x5b6aa6),
  duskBottom: new THREE.Color(0xf6c58e),
  nightTop: new THREE.Color(0x040914),
  nightBottom: new THREE.Color(0x152338),
};

function grassTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#6c9a43";
  context.fillRect(0, 0, size, size);
  for (let index = 0; index < 2600; index += 1) {
    const shade = 80 + Math.random() * 70;
    context.fillStyle = `rgba(${shade * 0.55},${shade + 30},${shade * 0.35},${0.25 + Math.random() * 0.35})`;
    context.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 2.5, 1 + Math.random() * 5);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(48, 48);
  texture.anisotropy = 4;
  return texture;
}

export class PastureScene {
  readonly stage: Stage;
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(42, 1, 0.02, 600);
  readonly controls: OrbitControls;

  onTick: ((dt: number, input: FrameInput) => void) | null = null;
  onOverlay: ((positions: OverlayPositions) => void) | null = null;
  onBehaviour: ((kind: BehaviourKind) => void) | null = null;

  private disposables: Array<{ dispose: () => void }> = [];
  private sun = new THREE.DirectionalLight(0xfff4e0, 2.4);
  private hemi = new THREE.HemisphereLight(0xcfe8ff, 0x5b7a3a, 1.1);
  private moon = new THREE.DirectionalLight(0x8fa8d8, 0);
  private skyMaterial: THREE.ShaderMaterial;
  private stars: THREE.Points;
  private fenceRing: THREE.Mesh;
  private fenceWall: THREE.Mesh;
  private gatewayLed: THREE.Mesh;
  private gatewayFlash = 0;

  private cow: Cow | null = null;
  private cowHolder = new THREE.Group();
  private tag: EarTagInstance | null = null;
  private tagPivot = new THREE.Group();
  private tagHolder = new THREE.Group();
  private tagLed: THREE.Mesh;
  private ledColor = new THREE.Color(0x3cff8f);
  private ledTimer = 0;
  private ledPattern: "uplink" | "locate" | "alert" = "uplink";
  private swing = 0;
  private swingVelocity = 0;
  private swingLimit = 0.2;

  private heading = Math.PI * 0.15;
  private position = new THREE.Vector2(1.5, -1.0);
  private speed = 0;
  private scenario: Scenario = "normal";
  private behaviour: { kind: BehaviourKind; timeLeft: number; target: THREE.Vector2 | null; yaw: number; yawTimer: number; stepTimer: number } = {
    kind: "graze",
    timeLeft: 6,
    target: null,
    yaw: 0,
    yawTimer: 2,
    stepTimer: 2,
  };

  private trail: THREE.Line;
  private trailPositions: Float32Array;
  private trailCount = 0;
  private trailTimer = 0;
  private readonly trailMax = 400;

  private packets: Packet[] = [];
  private pulses: Pulse[] = [];
  private packetGeometry = new THREE.SphereGeometry(1, 16, 12);
  private pulseGeometry = new THREE.RingGeometry(0.82, 1, 48);

  private cameraMode: CameraMode = "follow";
  /** Ear close-up keeps its offset in the cow's own frame, so it turns with her head. */
  private earOffsetLocal = new THREE.Vector3();
  private offsetTween: { from: THREE.Vector3; to: THREE.Vector3; t: number } | null = null;
  private tmp = new THREE.Vector3();
  private tmp2 = new THREE.Vector3();
  private quat = new THREE.Quaternion();
  private tagWorld = new THREE.Vector3();

  constructor(container: HTMLElement) {
    this.stage = createStage(container, { shadows: true });
    const { renderer } = this.stage;
    renderer.toneMappingExposure = 1.0;

    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.maxDistance = 45;
    this.controls.addEventListener("start", () => {
      this.offsetTween = null;
    });

    this.scene.fog = new THREE.Fog(0xdcf0f6, 45, 160);

    // --- Sky ---------------------------------------------------------------------
    this.skyMaterial = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: { topColor: { value: SKY.dayTop.clone() }, bottomColor: { value: SKY.dayBottom.clone() } },
      vertexShader: `varying vec3 vWorld; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `uniform vec3 topColor; uniform vec3 bottomColor; varying vec3 vWorld; void main() { float h = normalize(vWorld).y; gl_FragColor = vec4(mix(bottomColor, topColor, pow(max(h, 0.0), 0.55)), 1.0); }`,
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(400, 32, 16), this.skyMaterial);
    this.scene.add(sky);
    this.track(sky.geometry, this.skyMaterial);

    const starPositions = new Float32Array(900 * 3);
    for (let index = 0; index < 900; index += 1) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.95);
      starPositions.set([Math.sin(phi) * Math.cos(theta) * 380, Math.cos(phi) * 380, Math.sin(phi) * Math.sin(theta) * 380], index * 3);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0, fog: false });
    this.stars = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.stars);
    this.track(starGeometry, starMaterial);

    // --- Lights ------------------------------------------------------------------
    this.scene.add(this.hemi, this.moon);
    this.sun.castShadow = true;
    const shadowSize = container.clientWidth < 640 ? 1024 : 2048;
    this.sun.shadow.mapSize.set(shadowSize, shadowSize);
    Object.assign(this.sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 80 });
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.02;
    this.scene.add(this.sun, this.sun.target);

    // --- Ground ------------------------------------------------------------------
    const grass = grassTexture();
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, map: grass, roughness: 1 });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(260, 96), groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.track(ground.geometry, groundMaterial, grass);

    this.addGrassTufts(container.clientWidth < 640 ? 1800 : 4200);
    this.addHills();
    this.addTrees();
    this.addBarn();
    this.gatewayLed = this.addGateway();

    // --- Virtual geofence -----------------------------------------------------------
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x3ecf8e, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
    this.fenceRing = new THREE.Mesh(new THREE.RingGeometry(FENCE_RADIUS - 0.06, FENCE_RADIUS + 0.06, 160), ringMaterial);
    this.fenceRing.rotation.x = -Math.PI / 2;
    this.fenceRing.position.y = 0.03;
    this.scene.add(this.fenceRing);
    const wallMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: { color: { value: new THREE.Color(0x3ecf8e) } },
      vertexShader: `varying float vY; void main() { vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform vec3 color; varying float vY; void main() { float a = (1.0 - smoothstep(0.0, 0.7, vY + 0.35)) * 0.32; gl_FragColor = vec4(color, a); }`,
    });
    this.fenceWall = new THREE.Mesh(new THREE.CylinderGeometry(FENCE_RADIUS, FENCE_RADIUS, 0.7, 160, 1, true), wallMaterial);
    this.fenceWall.position.y = 0.35;
    this.scene.add(this.fenceWall);
    this.track(this.fenceRing.geometry, ringMaterial, this.fenceWall.geometry, wallMaterial);
    const postGeometry = new THREE.CylinderGeometry(0.05, 0.06, 0.9, 8);
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0x7a5a3a, roughness: 0.9 });
    const capMaterial = new THREE.MeshStandardMaterial({ color: 0x3ecf8e, emissive: 0x1f8a55, emissiveIntensity: 0.6 });
    const capGeometry = new THREE.SphereGeometry(0.07, 12, 8);
    for (let index = 0; index < 10; index += 1) {
      const angle = (index / 10) * Math.PI * 2;
      const post = new THREE.Mesh(postGeometry, postMaterial);
      post.position.set(Math.cos(angle) * FENCE_RADIUS, 0.45, Math.sin(angle) * FENCE_RADIUS);
      post.castShadow = true;
      const cap = new THREE.Mesh(capGeometry, capMaterial);
      cap.position.set(post.position.x, 0.93, post.position.z);
      this.scene.add(post, cap);
    }
    this.track(postGeometry, postMaterial, capMaterial, capGeometry);

    // --- GPS trail ---------------------------------------------------------------------
    this.trailPositions = new Float32Array(this.trailMax * 3);
    const trailGeometry = new THREE.BufferGeometry();
    trailGeometry.setAttribute("position", new THREE.BufferAttribute(this.trailPositions, 3));
    trailGeometry.setDrawRange(0, 0);
    const trailMaterial = new THREE.LineBasicMaterial({ color: 0x1f7a4d, transparent: true, opacity: 0.85 });
    this.trail = new THREE.Line(trailGeometry, trailMaterial);
    this.trail.frustumCulled = false;
    this.scene.add(this.trail);
    this.track(trailGeometry, trailMaterial, this.packetGeometry, this.pulseGeometry);

    // --- Cow + tag ---------------------------------------------------------------------
    this.scene.add(this.cowHolder);
    this.tagPivot.add(this.tagHolder);
    const ledMaterial = new THREE.MeshBasicMaterial({ color: 0x3cff8f, transparent: true, opacity: 0, toneMapped: false });
    this.tagLed = new THREE.Mesh(new THREE.SphereGeometry(2.2, 12, 8), ledMaterial);
    this.track(this.tagLed.geometry, ledMaterial);

    this.stage.onResize((width, height) => {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    });
    this.stage.onFrame((dt) => this.frame(dt));
    this.setDaylight(9);
  }

  private track(...items: Array<{ dispose: () => void }>) {
    this.disposables.push(...items);
  }

  // --- Static scenery ---------------------------------------------------------------------
  private addGrassTufts(count: number) {
    const geometry = new THREE.ConeGeometry(0.035, 0.22, 3);
    geometry.translate(0, 0.11, 0);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1 });
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    for (let index = 0; index < count; index += 1) {
      const radius = Math.sqrt(Math.random()) * 34;
      const angle = Math.random() * Math.PI * 2;
      p.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      q.setFromEuler(new THREE.Euler((Math.random() - 0.5) * 0.5, Math.random() * Math.PI, (Math.random() - 0.5) * 0.5));
      const scale = 0.6 + Math.random() * 1.1;
      s.set(scale, scale * (0.7 + Math.random() * 0.8), scale);
      matrix.compose(p, q, s);
      mesh.setMatrixAt(index, matrix);
      color.setHSL(0.24 + Math.random() * 0.06, 0.45 + Math.random() * 0.2, 0.28 + Math.random() * 0.14);
      mesh.setColorAt(index, color);
    }
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    this.track(geometry, material);
  }

  private addHills() {
    const material = new THREE.MeshStandardMaterial({ color: 0x5f8a45, roughness: 1, flatShading: true });
    const geometry = new THREE.IcosahedronGeometry(1, 2);
    const hills: Array<[number, number, number, number, number]> = [
      [-90, -120, 60, 14, 40],
      [10, -150, 80, 20, 50],
      [120, -90, 55, 12, 45],
      [140, 40, 60, 10, 50],
      [-130, 60, 70, 16, 50],
      [-40, 150, 90, 18, 50],
      [80, 140, 60, 12, 40],
    ];
    for (const [x, z, sx, sy, sz] of hills) {
      const hill = new THREE.Mesh(geometry, material);
      hill.position.set(x, -2, z);
      hill.scale.set(sx, sy, sz);
      this.scene.add(hill);
    }
    this.track(geometry, material);
  }

  private addTrees() {
    const trunkGeometry = new THREE.CylinderGeometry(0.13, 0.2, 1.8, 8);
    trunkGeometry.translate(0, 0.9, 0);
    const canopyGeometry = new THREE.IcosahedronGeometry(1, 1);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x6b4a32, roughness: 0.95 });
    const canopyMaterials = [0x3f7a35, 0x4b8a3c, 0x356b2e].map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.95, flatShading: true }));
    const trees: Array<[number, number, number]> = [
      [-5.6, 5.2, 1.5],
      [-19, -15, 1.3],
      [21, 9, 1.2],
      [-24, 13, 1.6],
      [9, 23, 1.4],
      [27, -19, 1.5],
      [-31, -3, 1.2],
      [16, -27, 1.3],
      [33, 24, 1.6],
      [-12, 30, 1.3],
    ];
    for (const [x, z, scale] of trees) {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);
      tree.scale.setScalar(scale);
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.castShadow = true;
      tree.add(trunk);
      const blobs: Array<[number, number, number, number]> = [
        [0, 2.3, 0, 1.15],
        [0.65, 2.0, 0.3, 0.8],
        [-0.6, 2.05, -0.25, 0.85],
        [0.1, 2.85, -0.1, 0.75],
      ];
      blobs.forEach(([bx, by, bz, r], index) => {
        const canopy = new THREE.Mesh(canopyGeometry, canopyMaterials[index % canopyMaterials.length]);
        canopy.position.set(bx, by, bz);
        canopy.scale.setScalar(r);
        canopy.rotation.set(index, index * 2, 0);
        canopy.castShadow = true;
        tree.add(canopy);
      });
      this.scene.add(tree);
    }
    this.track(trunkGeometry, canopyGeometry, trunkMaterial, ...canopyMaterials);
  }

  private addBarn() {
    const barn = new THREE.Group();
    barn.position.set(15, 0, -15);
    barn.rotation.y = -0.7;
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xeadfca, roughness: 0.9 });
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x9a3b2a, roughness: 0.8 });
    const trimMaterial = new THREE.MeshStandardMaterial({ color: 0x1f6b45, roughness: 0.8 });
    const walls = new THREE.Mesh(new THREE.BoxGeometry(6, 2.6, 4.2), wallMaterial);
    walls.position.y = 1.3;
    const roofGeometry = new THREE.CylinderGeometry(0.01, 3.6, 1.6, 4, 1);
    roofGeometry.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.scale.set(1.25, 1, 0.9);
    roof.position.y = 3.4;
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2, 0.05), trimMaterial);
    door.position.set(0, 1, 2.12);
    for (const mesh of [walls, roof, door]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      barn.add(mesh);
    }
    this.scene.add(barn);
    this.track(walls.geometry, roofGeometry, door.geometry, wallMaterial, roofMaterial, trimMaterial);
  }

  private addGateway() {
    const group = new THREE.Group();
    group.position.copy(GATEWAY_POSITION);
    const metal = new THREE.MeshStandardMaterial({ color: 0xb9c2c6, roughness: 0.4, metalness: 0.7 });
    const white = new THREE.MeshStandardMaterial({ color: 0xf4f6f5, roughness: 0.5 });
    const green = new THREE.MeshStandardMaterial({ color: 0x1f7a4d, roughness: 0.6 });
    const panel = new THREE.MeshStandardMaterial({ color: 0x1b2a4a, roughness: 0.3, metalness: 0.5 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 5, 10), metal);
    pole.position.y = 2.5;
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.22), white);
    box.position.set(0, 3.3, 0.16);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.43, 0.08, 0.225), green);
    stripe.position.set(0, 3.45, 0.16);
    const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.9, 10), white);
    antenna.position.y = 5.3;
    const solar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.6), panel);
    solar.position.set(0, 4.3, 0);
    solar.rotation.x = -0.5;
    const ledMaterial = new THREE.MeshBasicMaterial({ color: 0x3cff8f, toneMapped: false, transparent: true, opacity: 0.25 });
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), ledMaterial);
    led.position.set(0.13, 3.15, 0.28);
    for (const mesh of [pole, box, stripe, antenna, solar]) {
      mesh.castShadow = true;
      group.add(mesh);
    }
    group.add(led);
    this.scene.add(group);
    this.track(pole.geometry, box.geometry, stripe.geometry, antenna.geometry, solar.geometry, led.geometry, metal, white, green, panel, ledMaterial);
    return led;
  }

  // --- Public API -----------------------------------------------------------------------------
  setCoat(coat: CoatId) {
    if (this.cow) {
      this.cow.tagMount.remove(this.tagPivot);
      this.cowHolder.remove(this.cow.root);
      this.cow.dispose();
    }
    this.cow = createCow(coat);
    this.cow.root.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) object.castShadow = true;
    });
    this.cowHolder.add(this.cow.root);
    this.cow.tagMount.add(this.tagPivot);
  }

  async setTag(variant: EarTagVariant) {
    const instance = await createEarTag(variant);
    this.tag?.dispose();
    this.tagHolder.clear();
    this.tag = instance;
    instance.setColourway(variant.colourways[0].parts);
    instance.setExplode(0);
    this.tagHolder.scale.setScalar(0.001);
    // Pin centre on the mount, rear face resting on the ear skin.
    this.tagHolder.position.set(-variant.pin[0] * 0.001, -variant.pin[1] * 0.001, (variant.id === "classic" ? 1 : 0) * 0.001);
    this.tagHolder.add(instance.root);
    this.tagLed.position.set(-11, 16, variant.envelope[2] - (variant.id === "classic" ? 1 : 0) + 0.4);
    this.tagHolder.add(this.tagLed);
    this.swingLimit = variant.swingLimit;
    return instance;
  }

  setScenario(scenario: Scenario) {
    if (scenario === this.scenario) return;
    this.scenario = scenario;
    this.chooseBehaviour(true);
  }

  setCameraMode(mode: CameraMode, immediate = false) {
    this.cameraMode = mode;
    this.controls.minDistance = mode === "ear" ? 0.12 : 1.2;
    const offset = this.presetOffset(mode);
    const target = this.desiredTarget();
    if (immediate) {
      this.controls.target.copy(target);
      this.camera.position.copy(target).add(offset);
      this.offsetTween = null;
    } else {
      this.offsetTween = { from: this.camera.position.clone().sub(this.controls.target), to: offset, t: 0 };
    }
  }

  /** Light the scene for a time of day (decimal hours). */
  setDaylight(hour: number) {
    const angle = ((hour - 6) / 12) * Math.PI;
    const elevation = Math.sin(angle);
    const day = THREE.MathUtils.clamp(elevation * 2.2, 0, 1);
    const dusk = THREE.MathUtils.clamp(1 - Math.abs(elevation) * 4, 0, 1);
    const night = THREE.MathUtils.clamp(-elevation * 3, 0, 1);

    const top = this.skyMaterial.uniforms.topColor.value as THREE.Color;
    const bottom = this.skyMaterial.uniforms.bottomColor.value as THREE.Color;
    top.copy(SKY.nightTop).lerp(SKY.dayTop, day).lerp(SKY.duskTop, dusk * 0.6);
    bottom.copy(SKY.nightBottom).lerp(SKY.dayBottom, day).lerp(SKY.duskBottom, dusk * 0.7);
    (this.scene.fog as THREE.Fog).color.copy(bottom);
    (this.stars.material as THREE.PointsMaterial).opacity = night * 0.9;

    const cow = this.cowHolder.position;
    this.sun.position.set(cow.x + Math.cos(angle) * 30, Math.max(elevation, 0.05) * 30, cow.z + 9);
    this.sun.target.position.copy(cow);
    this.sun.intensity = 2.6 * Math.pow(Math.max(elevation, 0), 0.6);
    this.sun.color.setHSL(0.09, 0.8, 0.6 + 0.35 * day);
    this.hemi.intensity = 0.25 + 0.95 * day + 0.2 * dusk;
    this.moon.intensity = 0.55 * night;
    this.moon.position.set(cow.x - 10, 25, cow.z - 12);
    this.stage.renderer.toneMappingExposure = 0.85 + 0.25 * day;
  }

  /** Animate a LoRa transmission between the tag and the gateway. */
  transmit(direction: "up" | "down", kind: "vitals" | "status" | "command") {
    const from = direction === "up" ? this.tagWorld.clone() : GATEWAY_ANTENNA.clone();
    const to = direction === "up" ? GATEWAY_ANTENNA.clone() : this.tagWorld.clone();
    const mid = from.clone().lerp(to, 0.5);
    mid.y += 2.5 + from.distanceTo(to) * 0.12;
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    const color = direction === "down" ? 0x5aa9ff : kind === "status" ? 0xf2c230 : 0x3ecf8e;
    const arcMaterial = new THREE.LineDashedMaterial({ color, dashSize: 0.25, gapSize: 0.18, transparent: true, opacity: 0.9 });
    const arcGeometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(60));
    const arc = new THREE.Line(arcGeometry, arcMaterial);
    arc.computeLineDistances();
    const dotMaterial = new THREE.MeshBasicMaterial({ color, toneMapped: false });
    const dot = new THREE.Mesh(this.packetGeometry, dotMaterial);
    dot.scale.setScalar(0.09);
    const glowMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.25, depthWrite: false, toneMapped: false });
    const glow = new THREE.Mesh(this.packetGeometry, glowMaterial);
    glow.scale.setScalar(0.26);
    this.scene.add(arc, dot, glow);
    this.packets.push({ curve, arc, dot, glow, t: 0, duration: 1.3, life: 2.3 });

    if (direction === "up") {
      this.flashLed(kind === "status" ? "alert" : "uplink");
      const pulseMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
      const mesh = new THREE.Mesh(this.pulseGeometry, pulseMaterial);
      mesh.position.copy(from);
      this.scene.add(mesh);
      this.pulses.push({ mesh, t: 0 });
    }
  }

  flashLed(pattern: "uplink" | "locate" | "alert") {
    this.ledPattern = pattern;
    this.ledTimer = pattern === "locate" ? 3.2 : 0.9;
    this.ledColor.setHex(pattern === "locate" ? 0x5aa9ff : pattern === "alert" ? 0xffb020 : 0x3cff8f);
    (this.tagLed.material as THREE.MeshBasicMaterial).color.copy(this.ledColor);
  }

  setFenceAlarm(alarm: boolean) {
    const color = alarm ? 0xff5a4f : 0x3ecf8e;
    (this.fenceRing.material as THREE.MeshBasicMaterial).color.setHex(color);
    ((this.fenceWall.material as THREE.ShaderMaterial).uniforms.color.value as THREE.Color).setHex(color);
  }

  clearTrail() {
    this.trailCount = 0;
    this.trail.geometry.setDrawRange(0, 0);
  }

  get behaviourKind() {
    return this.behaviour.kind;
  }

  // --- Behaviour -------------------------------------------------------------------------------
  private randomInside(radius: number) {
    const r = Math.sqrt(Math.random()) * radius;
    const a = Math.random() * Math.PI * 2;
    return new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r);
  }

  private chooseBehaviour(force = false) {
    const b = this.behaviour;
    const roll = Math.random();
    const outside = this.position.length() > FENCE_RADIUS;
    let kind: BehaviourKind;
    let target: THREE.Vector2 | null = null;
    switch (this.scenario) {
      case "fever":
        kind = roll < 0.78 ? "lethargic" : roll < 0.93 ? "graze" : "walk";
        break;
      case "heatStress": {
        const inShade = this.position.distanceTo(SHADE_SPOT) < 1.4;
        kind = !inShade ? "shade" : roll < 0.8 ? "pant" : "graze";
        if (kind === "shade") target = SHADE_SPOT.clone();
        break;
      }
      case "lameness":
        kind = roll < 0.45 ? "idle" : roll < 0.8 ? "graze" : "walk";
        break;
      case "geofence":
        if (!outside || force) {
          kind = "walk";
          const a = Math.atan2(this.position.y, this.position.x) + (Math.random() - 0.5) * 0.8;
          const r = FENCE_RADIUS + 3 + Math.random() * 3;
          target = new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r);
        } else {
          kind = roll < 0.55 ? "graze" : roll < 0.8 ? "walk" : "idle";
        }
        break;
      default:
        kind = outside ? "walk" : roll < 0.45 ? "graze" : roll < 0.75 ? "walk" : "idle";
    }
    if (kind === "walk" && !target) {
      if (this.scenario === "geofence") {
        const a = Math.atan2(this.position.y, this.position.x) + (Math.random() - 0.5) * 1.2;
        const r = FENCE_RADIUS + 2 + Math.random() * 4;
        target = new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r);
      } else {
        target = this.randomInside(FENCE_RADIUS - 2);
      }
    }
    b.kind = kind;
    b.target = target;
    b.timeLeft = kind === "walk" || kind === "shade" ? 30 : kind === "pant" ? 14 + Math.random() * 8 : 6 + Math.random() * 8;
    b.yawTimer = 0;
    b.stepTimer = 1 + Math.random() * 2;
    this.onBehaviour?.(kind);
  }

  private updateBehaviour(dt: number): CowPose {
    const b = this.behaviour;
    b.timeLeft -= dt;
    const lame = this.scenario === "lameness" ? 1 : 0;
    let speedTarget = 0;
    let desiredHeading = this.heading;

    if (b.target && (b.kind === "walk" || b.kind === "shade")) {
      const dx = b.target.x - this.position.x;
      const dz = b.target.y - this.position.y;
      if (Math.hypot(dx, dz) < 0.4) b.timeLeft = 0;
      else {
        desiredHeading = Math.atan2(-dz, dx);
        speedTarget = this.scenario === "fever" ? 0.42 : lame ? 0.38 : 0.82;
      }
    } else if (b.kind === "graze") {
      // Grazing cows take a slow step every few seconds.
      b.stepTimer -= dt;
      if (b.stepTimer < 0) {
        speedTarget = 0.22;
        desiredHeading += Math.sin(b.stepTimer * 0.8) * 0.4;
        if (b.stepTimer < -1.4) b.stepTimer = 2 + Math.random() * 3;
      }
    }
    if (b.timeLeft <= 0) this.chooseBehaviour();

    // Turn smoothly; slow down for sharp turns.
    let delta = desiredHeading - this.heading;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    this.heading += delta * damp(1.6, dt);
    speedTarget *= 1 - Math.min(0.7, Math.abs(delta) / 2);
    this.speed += (speedTarget - this.speed) * damp(2.5, dt);
    this.position.x += Math.cos(this.heading) * this.speed * dt;
    this.position.y += -Math.sin(this.heading) * this.speed * dt;

    b.yawTimer -= dt;
    if (b.yawTimer <= 0) {
      b.yaw = b.kind === "idle" || b.kind === "pant" ? (Math.random() - 0.5) * 1.0 : b.kind === "walk" ? delta * 0.6 : (Math.random() - 0.5) * 0.3;
      b.yawTimer = 1.8 + Math.random() * 2.5;
    }

    const fever = this.scenario === "fever";
    const neckPitch =
      b.kind === "graze" ? -1.4 : b.kind === "lethargic" ? -0.5 : b.kind === "pant" ? 0.05 : b.kind === "walk" || b.kind === "shade" ? (fever ? -0.35 : -0.12) : 0.08;
    return {
      speed: this.speed,
      neckPitch,
      neckYaw: b.yaw,
      breathRate: b.kind === "pant" ? 1.7 : fever ? 0.6 : this.speed > 0.3 ? 0.5 : 0.32,
      breathDepth: b.kind === "pant" ? 0.03 : fever ? 0.016 : 0.011,
      limp: lame,
      chewing: b.kind === "graze" || b.kind === "idle",
    };
  }

  /** Instant activity index (0-100) the IMU would read for the current behaviour. */
  private activityNow() {
    const kind = this.behaviour.kind;
    const moving = Math.min(1, this.speed / 0.8);
    const base = { graze: 46, walk: 52, shade: 52, idle: 22, lethargic: 8, pant: 14 }[kind];
    // Pain and malaise damp how much the IMU sees, whatever the cow is doing.
    const damping = this.scenario === "lameness" ? 0.6 : this.scenario === "fever" ? 0.55 : 1;
    return Math.min(100, (base + moving * 40) * damping);
  }

  // --- Camera ---------------------------------------------------------------------------------
  private presetOffset(mode: CameraMode) {
    if (mode === "overview") return new THREE.Vector3(10, 9, -14).multiplyScalar(this.camera.aspect < 1 ? 1.5 : 1);
    if (mode === "follow") {
      // Front-left three-quarter view relative to where the cow is heading.
      const forward = this.tmp2.set(Math.cos(this.heading), 0, -Math.sin(this.heading));
      const left = new THREE.Vector3(-forward.z, 0, forward.x).multiplyScalar(-1);
      // Portrait screens need more distance to fit the whole cow.
      const reach = this.camera.aspect < 1 ? 1.75 : 1;
      return forward.clone().multiplyScalar(2.4 * reach).add(left.multiplyScalar(3.4 * reach)).add(new THREE.Vector3(0, 1.3 * reach, 0));
    }
    // Close-up of the tag on the left ear: in front of and beside the head.
    return this.earLocalToWorld(new THREE.Vector3(0.4, 0.16, -0.52).multiplyScalar(this.camera.aspect < 1 ? 1.4 : 1));
  }

  private earLocalToWorld(local: THREE.Vector3) {
    return local.clone().applyAxisAngle(THREE.Object3D.DEFAULT_UP, this.heading);
  }

  private desiredTarget() {
    // Keep the paddock and the cow in frame, even when she has wandered off.
    if (this.cameraMode === "overview") return new THREE.Vector3(this.position.x * 0.45, 0.8, this.position.y * 0.45);
    if (this.cameraMode === "ear") return this.tagWorld.clone();
    return new THREE.Vector3(this.position.x, 1.0, this.position.y);
  }

  // --- Frame ----------------------------------------------------------------------------------
  private frame(dt: number) {
    const pose = this.updateBehaviour(dt);
    this.cowHolder.position.set(this.position.x, 0, this.position.y);
    this.cowHolder.rotation.y = this.heading;
    this.cow?.update(dt, pose);
    this.scene.updateMatrixWorld();

    // Hanging tag: swing towards gravity on its pin, damped like a pendulum.
    if (this.cow) {
      this.cow.leftEar.getWorldQuaternion(this.quat);
      const gravity = this.tmp.set(0, -1, 0).applyQuaternion(this.quat.invert());
      const target = THREE.MathUtils.clamp(Math.atan2(gravity.x, -gravity.y), -this.swingLimit, this.swingLimit);
      const stiffness = this.swingLimit > 0.2 ? 28 : 90;
      this.swingVelocity += ((target - this.swing) * stiffness - this.swingVelocity * 4.5) * dt;
      this.swing += this.swingVelocity * dt;
      this.tagPivot.rotation.z = this.swing;
      this.tagPivot.updateMatrixWorld(true);
      this.tagWorld.set(0, -0.022, 0.006);
      this.tagPivot.localToWorld(this.tagWorld);
    }

    // GPS trail sampled like the GNSS would.
    this.trailTimer -= dt;
    if (this.trailTimer <= 0) {
      this.trailTimer = 0.35;
      const last = this.trailCount > 0 ? this.trailCount - 1 : -1;
      const moved = last < 0 || Math.hypot(this.trailPositions[last * 3] - this.position.x, this.trailPositions[last * 3 + 2] - this.position.y) > 0.08;
      if (moved) {
        if (this.trailCount >= this.trailMax) {
          this.trailPositions.copyWithin(0, 3);
          this.trailCount = this.trailMax - 1;
        }
        this.trailPositions.set([this.position.x, 0.04, this.position.y], this.trailCount * 3);
        this.trailCount += 1;
        this.trail.geometry.setDrawRange(0, this.trailCount);
        (this.trail.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      }
    }

    const inside = this.position.length() <= FENCE_RADIUS;
    this.onTick?.(dt, {
      activityNow: this.activityNow(),
      x: this.position.x,
      z: this.position.y,
      insideFence: inside,
      gatewayDistance: this.tagWorld.distanceTo(GATEWAY_ANTENNA),
    });

    this.animateEffects(dt);
    this.updateCamera(dt);
    this.stage.renderer.render(this.scene, this.camera);
    this.emitOverlay();
  }

  private animateEffects(dt: number) {
    for (const packet of [...this.packets]) {
      packet.t += dt;
      const k = Math.min(1, packet.t / packet.duration);
      const eased = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      const point = packet.curve.getPoint(eased);
      packet.dot.position.copy(point);
      packet.glow.position.copy(point);
      packet.dot.visible = packet.glow.visible = k < 1;
      if (k >= 1 && packet.t - dt < packet.duration) this.gatewayFlash = 1;
      const fade = 1 - Math.max(0, (packet.t - packet.duration) / (packet.life - packet.duration));
      (packet.arc.material as THREE.LineDashedMaterial).opacity = 0.85 * fade;
      if (packet.t >= packet.life) {
        this.scene.remove(packet.arc, packet.dot, packet.glow);
        packet.arc.geometry.dispose();
        (packet.arc.material as THREE.Material).dispose();
        (packet.dot.material as THREE.Material).dispose();
        (packet.glow.material as THREE.Material).dispose();
        this.packets.splice(this.packets.indexOf(packet), 1);
      }
    }
    for (const pulse of [...this.pulses]) {
      pulse.t += dt;
      const k = pulse.t / 1.1;
      pulse.mesh.scale.setScalar(0.04 + k * 0.9);
      pulse.mesh.quaternion.copy(this.camera.quaternion);
      (pulse.mesh.material as THREE.MeshBasicMaterial).opacity = 0.8 * (1 - k);
      if (k >= 1) {
        this.scene.remove(pulse.mesh);
        (pulse.mesh.material as THREE.Material).dispose();
        this.pulses.splice(this.pulses.indexOf(pulse), 1);
      }
    }

    // Tag status light.
    const led = this.tagLed.material as THREE.MeshBasicMaterial;
    if (this.ledTimer > 0) {
      this.ledTimer -= dt;
      const rate = this.ledPattern === "locate" ? 4 : 3;
      led.opacity = Math.sin(this.ledTimer * Math.PI * 2 * rate) > 0 ? 1 : 0.15;
      this.tagLed.scale.setScalar(this.ledPattern === "locate" ? 1.6 : 1.2);
    } else {
      led.opacity = 0;
    }

    this.gatewayFlash = Math.max(0, this.gatewayFlash - dt * 2.5);
    (this.gatewayLed.material as THREE.MeshBasicMaterial).opacity = 0.25 + this.gatewayFlash * 0.75;
    this.gatewayLed.scale.setScalar(1 + this.gatewayFlash * 1.5);
  }

  private updateCamera(dt: number) {
    const target = this.desiredTarget();
    const follow = damp(this.cameraMode === "ear" ? 10 : 4, dt);
    this.tmp.copy(target).sub(this.controls.target).multiplyScalar(follow);
    this.controls.target.add(this.tmp);
    if (this.offsetTween) {
      this.offsetTween.t = Math.min(1, this.offsetTween.t + dt / 1.3);
      const k = 1 - Math.pow(1 - this.offsetTween.t, 3);
      if (this.cameraMode === "ear") this.offsetTween.to.copy(this.presetOffset("ear"));
      this.camera.position.copy(this.controls.target).add(this.tmp2.copy(this.offsetTween.from).lerp(this.offsetTween.to, k));
      if (this.offsetTween.t >= 1) {
        this.offsetTween = null;
        this.earOffsetLocal.copy(this.camera.position).sub(this.controls.target).applyAxisAngle(THREE.Object3D.DEFAULT_UP, -this.heading);
      }
    } else if (this.cameraMode === "ear") {
      this.camera.position.copy(this.controls.target).add(this.earLocalToWorld(this.earOffsetLocal));
    } else {
      this.camera.position.add(this.tmp);
    }
    this.controls.update(dt);
    if (this.cameraMode === "ear" && !this.offsetTween) {
      // Keep whatever orbit the visitor applied, expressed in the cow's frame.
      this.earOffsetLocal.copy(this.camera.position).sub(this.controls.target).applyAxisAngle(THREE.Object3D.DEFAULT_UP, -this.heading);
    }
  }

  private emitOverlay() {
    if (!this.onOverlay) return;
    const { width, height } = this.stage.size;
    const project = (point: THREE.Vector3): OverlayPoint => {
      this.tmp.copy(point).project(this.camera);
      return {
        x: (this.tmp.x * 0.5 + 0.5) * width,
        y: (-this.tmp.y * 0.5 + 0.5) * height,
        visible: this.tmp.z < 1 && Math.abs(this.tmp.x) < 1.1 && Math.abs(this.tmp.y) < 1.1,
      };
    };
    this.onOverlay({
      tag: project(this.tagWorld),
      gateway: project(this.tmp2.copy(GATEWAY_ANTENNA).add(new THREE.Vector3(0, 0.6, 0))),
      cow: project(new THREE.Vector3(this.position.x, 1.85, this.position.y)),
    });
  }

  dispose() {
    this.onTick = null;
    this.onOverlay = null;
    for (const packet of this.packets) {
      packet.arc.geometry.dispose();
      (packet.arc.material as THREE.Material).dispose();
      (packet.dot.material as THREE.Material).dispose();
      (packet.glow.material as THREE.Material).dispose();
    }
    for (const pulse of this.pulses) (pulse.mesh.material as THREE.Material).dispose();
    this.cow?.dispose();
    this.tag?.dispose();
    this.controls.dispose();
    for (const item of this.disposables) item.dispose();
    this.stage.dispose();
  }
}
