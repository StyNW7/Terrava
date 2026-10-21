import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * A stylised but anatomically proportioned cow, in metres, facing +x with
 * the cow's left side towards -z. Torso, neck and head are single sculpted
 * meshes (deformed spheres) with the coat painted into vertex colours. It
 * exposes the joints the pasture controller animates and a mount on the
 * left ear where the Terrava ear tag is pinned (middle third, between the
 * cartilage ribs, on the inner face).
 */

export type CoatId = "bali" | "brahman" | "holstein";

interface CoatSpec {
  /** Coat colour at a point: u along the part (-1 rear .. 1 front), yn/zn on the unit cross-section. */
  paint: (part: "torso" | "neck" | "head", u: number, yn: number, zn: number, p: THREE.Vector3, out: THREE.Color) => void;
  legUpper: (p: THREE.Vector3, out: THREE.Color) => void;
  legLower: number;
  muzzle: number;
  tail: number;
  tailTip: number;
  horns: number | null;
  hornLength: number;
  earOuter: number;
  earInner: number;
  hoof: number;
  hump: number;
  dewlap: number;
  udder: boolean;
  earLength: number;
  earDroop: number;
}

const tmpColor = new THREE.Color();
const smooth = (edge0: number, edge1: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Cheap smooth 3D pattern for Holstein patches: a sum of sines. */
function patches(p: THREE.Vector3) {
  return (
    Math.sin(p.x * 5.1 + 1.3) * Math.sin(p.y * 6.3 + 0.4) * Math.sin(p.z * 4.7 + 2.1) +
    0.55 * Math.sin(p.x * 9.7 + p.z * 3.1 + 0.7) * Math.sin(p.y * 8.3 - p.x * 2.2) +
    0.35 * Math.sin(p.x * 3.3 - p.y * 4.1 + 1.9)
  );
}

const COATS: Record<CoatId, CoatSpec> = {
  // Bali cattle: red-brown with a dark dorsal line, white rump patch and white stockings.
  bali: {
    paint: (part, u, yn, zn, _p, out) => {
      out.setHex(0xa4532a);
      if (part === "torso") {
        const rump = smooth(-0.58, -0.74, u) * smooth(0.62, 0.25, yn);
        out.lerp(tmpColor.setHex(0xf3eee5), rump);
        const belly = smooth(-0.7, -0.92, yn) * 0.35;
        out.lerp(tmpColor.setHex(0xd8b59a), belly);
        const dorsal = smooth(0.86, 0.97, yn) * smooth(0.22, 0.05, Math.abs(zn)) * smooth(-0.75, -0.55, u);
        out.lerp(tmpColor.setHex(0x3b2417), dorsal * 0.85);
      }
      if (part === "head") out.lerp(tmpColor.setHex(0x6e3418), smooth(0.2, 0.6, u) * 0.5);
    },
    legUpper: (_p, out) => out.setHex(0xa4532a),
    legLower: 0xf2ece2,
    muzzle: 0x231d1a,
    tail: 0xa4532a,
    tailTip: 0x1f1a17,
    horns: 0xcfc0a2,
    hornLength: 0.13,
    earOuter: 0xa4532a,
    earInner: 0xe6c2b2,
    hoof: 0x2a2421,
    hump: 0,
    dewlap: 0.03,
    udder: false,
    earLength: 0.19,
    earDroop: 0.32,
  },
  // Brahman / Peranakan Ongole: pale grey, darker forehand, hump, long drooping ears.
  brahman: {
    paint: (part, u, _yn, _zn, _p, out) => {
      out.setHex(0xdcd7ce);
      if (part === "torso") out.lerp(tmpColor.setHex(0x9d978e), smooth(0.25, 0.85, u) * 0.6);
      if (part === "neck") out.lerp(tmpColor.setHex(0x9d978e), 0.6);
      if (part === "head") out.lerp(tmpColor.setHex(0xb8b2a8), 0.5);
    },
    legUpper: (_p, out) => out.setHex(0xcfc9bf),
    legLower: 0xcfc9bf,
    muzzle: 0x34302e,
    tail: 0xcfc9bf,
    tailTip: 0x2a2725,
    horns: 0x3a3532,
    hornLength: 0.07,
    earOuter: 0xd2ccc2,
    earInner: 0xd9b3a4,
    hoof: 0x2b2725,
    hump: 0.17,
    dewlap: 0.1,
    udder: false,
    earLength: 0.24,
    earDroop: 0.85,
  },
  // Friesian Holstein, common for dairy in Java.
  holstein: {
    paint: (part, u, _yn, _zn, p, out) => {
      // Soft-edged patches so the boundary does not show the mesh grid.
      out.setHex(0xf6f4f0).lerp(tmpColor.setHex(0x1e1c1b), smooth(0.08, 0.3, patches(p)));
      if (part === "head" && u > 0.55) out.setHex(0xf6f4f0);
    },
    legUpper: (p, out) => out.setHex(0xf6f4f0).lerp(tmpColor.setHex(0x1e1c1b), smooth(0.25, 0.45, patches(p))),
    legLower: 0xf3f0eb,
    muzzle: 0xd99c90,
    tail: 0xf3f0eb,
    tailTip: 0xf3f0eb,
    horns: null,
    hornLength: 0,
    earOuter: 0x1e1c1b,
    earInner: 0xe8bcb0,
    hoof: 0x37312d,
    hump: 0,
    dewlap: 0.02,
    udder: true,
    earLength: 0.19,
    earDroop: 0.3,
  },
};

export interface CowPose {
  /** Ground speed in m/s, drives the gait. */
  speed: number;
  /** Neck pitch: 0 = head up, -1.4 = grazing on the ground. */
  neckPitch: number;
  neckYaw: number;
  /** Breaths per second and depth. */
  breathRate: number;
  breathDepth: number;
  /** 0..1, shortens the stride of the right fore leg. */
  limp: number;
  chewing: boolean;
}

export interface Cow {
  root: THREE.Group;
  /** Group on the inner face of the left ear, at the pin position. */
  tagMount: THREE.Group;
  /** The left ear, for computing gravity on the hanging tag. */
  leftEar: THREE.Object3D;
  update: (dt: number, pose: CowPose) => void;
  dispose: () => void;
}

/** Catmull-Rom through (u, value) samples sorted by u. */
function curve(samples: Array<[number, number]>) {
  return (u: number) => {
    if (u <= samples[0][0]) return samples[0][1];
    const last = samples.length - 1;
    if (u >= samples[last][0]) return samples[last][1];
    let i = 0;
    while (u > samples[i + 1][0]) i += 1;
    const p0 = samples[Math.max(0, i - 1)][1];
    const p1 = samples[i][1];
    const p2 = samples[i + 1][1];
    const p3 = samples[Math.min(last, i + 2)][1];
    const t = (u - samples[i][0]) / (samples[i + 1][0] - samples[i][0]);
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
  };
}

interface SculptSpec {
  length: [number, number];
  top: (u: number) => number;
  bottom: (u: number) => number;
  width: (u: number) => number;
  /** Superellipse exponent of the cross-section; > 2 is boxier. */
  boxiness: number;
  /** How blunt the two ends are (0 = sphere, 1 = flat). */
  blunt: number;
  bump?: (u: number, yn: number, zn: number) => number;
  paint: (u: number, yn: number, zn: number, p: THREE.Vector3, out: THREE.Color) => void;
}

/** Deform a sphere lying along x into an organic body part with painted vertex colours. */
function sculpt(spec: SculptSpec, segments = 64, rings = 40) {
  const sphere = new THREE.SphereGeometry(1, rings, segments);
  sphere.rotateZ(-Math.PI / 2);
  sphere.deleteAttribute("normal");
  sphere.deleteAttribute("uv");
  const geometry = mergeVertices(sphere);
  sphere.dispose();
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(position.count * 3);
  const p = new THREE.Vector3();
  const color = new THREE.Color();
  const [x0, x1] = spec.length;
  const exponent = 2 / spec.boxiness;
  for (let index = 0; index < position.count; index += 1) {
    p.fromBufferAttribute(position, index);
    const u = THREE.MathUtils.clamp(p.x, -1, 1);
    const r0 = Math.sqrt(Math.max(0, 1 - u * u));
    const angle = Math.atan2(p.z, p.y);
    const cy = Math.cos(angle);
    const sz = Math.sin(angle);
    const yn = Math.sign(cy) * Math.pow(Math.abs(cy), exponent);
    const zn = Math.sign(sz) * Math.pow(Math.abs(sz), exponent);
    const cap = Math.pow(r0, 1 - spec.blunt);
    const top = spec.top(u);
    const bottom = spec.bottom(u);
    const mid = (top + bottom) / 2;
    const half = (top - bottom) / 2;
    const x = x0 + ((u + 1) / 2) * (x1 - x0);
    const y = mid + yn * half * cap + (spec.bump ? spec.bump(u, yn, zn) * cap : 0);
    const z = zn * spec.width(u) * cap;
    position.setXYZ(index, x, y, z);
    spec.paint(u, yn, zn, p.set(x, y, z), color);
    colors.set([color.r, color.g, color.b], index * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/** A lathe-turned limb segment hanging down from its pivot, with a colour per height. */
function limbGeometry(profile: Array<[number, number]>, colorAt: (y: number, p: THREE.Vector3, out: THREE.Color) => void) {
  const geometry = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 20);
  const position = geometry.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(position.count * 3);
  const p = new THREE.Vector3();
  const color = new THREE.Color();
  for (let index = 0; index < position.count; index += 1) {
    p.fromBufferAttribute(position, index);
    colorAt(p.y, p, color);
    colors.set([color.r, color.g, color.b], index * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

export function createCow(coatId: CoatId): Cow {
  const coat = COATS[coatId];
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];

  const skin = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0 });
  const solid = (color: number, roughness = 0.75) => {
    const material = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
    materials.push(material);
    return material;
  };
  materials.push(skin);

  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, parent: THREE.Object3D) => {
    geometries.push(geometry);
    const result = new THREE.Mesh(geometry, material);
    result.castShadow = true;
    result.receiveShadow = true;
    parent.add(result);
    return result;
  };

  const sphere = new THREE.SphereGeometry(1, 20, 14);
  geometries.push(sphere);
  const dot = (parent: THREE.Object3D, material: THREE.Material, position: [number, number, number], radii: [number, number, number]) => {
    const result = new THREE.Mesh(sphere, material);
    result.position.set(...position);
    result.scale.set(...radii);
    result.castShadow = true;
    parent.add(result);
    return result;
  };

  const root = new THREE.Group();
  root.name = "cow";
  const body = new THREE.Group();
  root.add(body);

  // --- Torso: one sculpted barrel from rump to brisket --------------------------------
  const TORSO_Y = 1.0;
  const torsoGeometry = sculpt({
    length: [-0.86, 0.84],
    top: curve([[-1, 1.17], [-0.8, 1.3], [-0.55, 1.31], [-0.1, 1.29], [0.35, 1.33], [0.6, 1.37], [0.85, 1.28], [1, 1.12]].map(([u, v]) => [u, v - TORSO_Y])),
    bottom: curve([[-1, 0.98], [-0.8, 0.86], [-0.45, 0.76], [0, 0.7], [0.45, 0.74], [0.78, 0.74], [1, 0.86]].map(([u, v]) => [u, v - TORSO_Y])),
    width: curve([[-1, 0.2], [-0.8, 0.26], [-0.45, 0.3], [0, 0.34], [0.45, 0.31], [0.8, 0.26], [1, 0.2]]),
    boxiness: 2.7,
    blunt: 0.55,
    bump: (u, yn, zn) =>
      // Hip bones, and the Brahman hump over the withers.
      0.035 * Math.exp(-(((u + 0.62) / 0.1) ** 2)) * Math.exp(-(((Math.abs(zn) - 0.62) / 0.22) ** 2)) * Math.max(0, yn) +
      coat.hump * Math.exp(-(((u - 0.55) / 0.13) ** 2)) * Math.pow(Math.max(0, yn), 3) * Math.exp(-((zn / 0.55) ** 2)),
    paint: (u, yn, zn, p, out) => coat.paint("torso", u, yn, zn, p.clone().setY(p.y + TORSO_Y), out),
  });
  const torso = mesh(torsoGeometry, skin, body);
  torso.position.y = TORSO_Y;

  if (coat.udder) {
    const udder = solid(0xe8b2a6, 0.6);
    dot(body, udder, [-0.38, 0.68, 0], [0.17, 0.11, 0.15]);
    for (const [x, z] of [[-0.31, 0.06], [-0.31, -0.06], [-0.44, 0.06], [-0.44, -0.06]]) dot(body, udder, [x, 0.58, z], [0.016, 0.045, 0.016]);
  }

  // --- Legs ---------------------------------------------------------------------------
  interface Leg { hip: THREE.Group; knee: THREE.Group; phase: number; front: boolean; right: boolean }
  const legs: Leg[] = [];
  const legSpecs: Array<[number, number, number, boolean, boolean]> = [
    // x, z, gait phase (lateral-sequence walk), front, right
    [0.52, -0.16, 0.25, true, false],
    [0.52, 0.16, 0.75, true, true],
    [-0.56, -0.17, 0.0, false, false],
    [-0.56, 0.17, 0.5, false, true],
  ];
  const hoofMat = solid(coat.hoof, 0.5);
  for (const [x, z, phase, front, right] of legSpecs) {
    const hip = new THREE.Group();
    hip.position.set(x, 0.89, z);
    body.add(hip);
    const thick = front ? 0.1 : 0.135;
    mesh(
      limbGeometry(
        [[0, 0.06], [thick * 0.9, 0.04], [thick, -0.06], [thick * 0.85, -0.2], [0.07, -0.36], [0.06, -0.46], [0.055, -0.5], [0, -0.51]],
        (y, p, out) => {
          coat.legUpper(p.clone().add(hip.position), out);
          if (y < -0.36) out.lerp(tmpColor.setHex(coat.legLower), smooth(-0.36, -0.46, y));
        }
      ),
      skin,
      hip
    );
    const knee = new THREE.Group();
    knee.position.y = -0.46;
    hip.add(knee);
    mesh(
      limbGeometry(
        [[0, 0.03], [0.062, 0.02], [0.058, -0.04], [0.044, -0.14], [0.041, -0.28], [0.05, -0.33], [0.047, -0.36], [0, -0.365]],
        (_y, _p, out) => out.setHex(coat.legLower)
      ),
      skin,
      knee
    );
    const hoof = mesh(new THREE.CylinderGeometry(0.047, 0.058, 0.07, 16), hoofMat, knee);
    hoof.position.y = -0.39;
    legs.push({ hip, knee, phase, front, right });
  }

  // --- Neck ---------------------------------------------------------------------------
  const neck = new THREE.Group();
  neck.position.set(0.62, 1.1, 0);
  body.add(neck);
  mesh(
    sculpt(
      {
        length: [-0.14, 0.62],
        top: curve([[-1, 0.12], [-0.3, 0.17], [0.4, 0.16], [1, 0.12]]),
        bottom: curve([[-1, -0.32], [-0.4, -0.3 - coat.dewlap], [0.3, -0.18 - coat.dewlap * 0.6], [1, -0.1]]),
        width: curve([[-1, 0.22], [0, 0.19], [1, 0.13]]),
        boxiness: 2.2,
        blunt: 0.4,
        paint: (u, yn, zn, p, out) => coat.paint("neck", u, yn, zn, p.clone().add(neck.position), out),
      },
      48,
      28
    ),
    skin,
    neck
  );

  // --- Head ---------------------------------------------------------------------------
  const head = new THREE.Group();
  head.position.set(0.58, 0.12, 0);
  neck.add(head);
  const face = new THREE.Group();
  face.rotation.z = -1.0;
  head.add(face);
  const muzzleBlend = new THREE.Color(coat.muzzle);
  mesh(
    sculpt(
      {
        length: [-0.15, 0.54],
        top: curve([[-1, 0.06], [-0.75, 0.14], [-0.35, 0.13], [0.3, 0.085], [0.8, 0.07], [1, 0.03]]),
        bottom: curve([[-1, -0.07], [-0.7, -0.14], [-0.3, -0.13], [0.3, -0.085], [0.8, -0.095], [1, -0.05]]),
        width: curve([[-1, 0.09], [-0.7, 0.15], [-0.3, 0.14], [0.3, 0.095], [0.8, 0.105], [1, 0.07]]),
        boxiness: 2.3,
        blunt: 0.5,
        paint: (u, yn, zn, p, out) => {
          coat.paint("head", u, yn, zn, p.clone().multiplyScalar(1.7).add(new THREE.Vector3(2, 0, 0)), out);
          out.lerp(muzzleBlend, smooth(0.68, 0.82, u));
        },
      },
      48,
      32
    ),
    skin,
    face
  );
  const eyeMat = solid(0x0d0c0c, 0.25);
  const shine = solid(0xffffff, 0.2);
  for (const side of [-1, 1]) {
    dot(face, eyeMat, [0.07, 0.055, side * 0.128], [0.024, 0.022, 0.016]);
    dot(face, shine, [0.078, 0.064, side * 0.14], [0.005, 0.005, 0.003]);
    dot(face, eyeMat, [0.535, 0.005, side * 0.04], [0.012, 0.02, 0.014]);
  }
  const muzzle = dot(face, solid(coat.muzzle, 0.55), [0.47, -0.06, 0], [0.07, 0.035, 0.085]);
  if (coat.horns !== null) {
    const hornMat = solid(coat.horns, 0.5);
    for (const side of [-1, 1]) {
      const horn = new THREE.Group();
      horn.position.set(-0.09, 0.12, side * 0.1);
      horn.rotation.set(side * -1.05, 0, 0.55);
      face.add(horn);
      const geometry = new THREE.ConeGeometry(0.024, coat.hornLength, 12);
      geometry.translate(0, coat.hornLength / 2, 0);
      mesh(geometry, hornMat, horn);
    }
  }

  // Ears hang off a mount that undoes the face pitch, so they stay roughly level.
  const earMount = new THREE.Group();
  earMount.position.set(-0.04, 0.07, 0);
  earMount.rotation.z = 1.0;
  face.add(earMount);

  const L = coat.earLength;
  const earShape = new THREE.Shape();
  earShape.moveTo(0, -0.026);
  earShape.bezierCurveTo(0.2 * L, -0.33 * L, 0.6 * L, -0.34 * L, L, -0.02 * L);
  earShape.bezierCurveTo(0.65 * L, 0.3 * L, 0.25 * L, 0.3 * L, 0, 0.026);
  earShape.lineTo(0, -0.026);
  const earThickness = 0.006;
  const earGeometry = new THREE.ExtrudeGeometry(earShape, {
    depth: earThickness,
    bevelEnabled: true,
    bevelThickness: 0.0015,
    bevelSize: 0.003,
    bevelSegments: 2,
    curveSegments: 24,
  });
  earGeometry.translate(0, 0, -earThickness / 2);
  const innerGeometry = new THREE.ShapeGeometry(earShape, 24);
  innerGeometry.translate(-0.5 * L, 0, 0);
  innerGeometry.scale(0.84, 0.78, 1);
  innerGeometry.translate(0.5 * L + 0.01, 0, earThickness / 2 + 0.0016);
  geometries.push(earGeometry, innerGeometry);
  const earOuterMat = solid(coat.earOuter, 0.8);
  const earInnerMat = solid(coat.earInner, 0.7);

  const ears: THREE.Group[] = [];
  const buildEar = () => {
    const ear = new THREE.Group();
    const outer = new THREE.Mesh(earGeometry, earOuterMat);
    outer.castShadow = true;
    const inner = new THREE.Mesh(innerGeometry, earInnerMat);
    ear.add(outer, inner);
    return ear;
  };
  const leftEarRoot = new THREE.Group();
  leftEarRoot.position.set(0, 0, -0.125);
  earMount.add(leftEarRoot);
  const leftEar = buildEar();
  leftEarRoot.add(leftEar);
  ears.push(leftEarRoot);

  // Mirror the left ear for the right side.
  const mirror = new THREE.Group();
  mirror.scale.z = -1;
  earMount.add(mirror);
  const rightEarRoot = new THREE.Group();
  rightEarRoot.position.set(0, 0, -0.125);
  mirror.add(rightEarRoot);
  rightEarRoot.add(buildEar());
  ears.push(rightEarRoot);

  // Tag mount: middle third of the ear, on the inner (front) face.
  const tagMount = new THREE.Group();
  tagMount.position.set(0.48 * L, -0.004, earThickness / 2 + 0.0018);
  leftEar.add(tagMount);
  // Male button on the back of the ear (standard ⌀28 mm, yellow).
  const buttonGeometry = new THREE.CylinderGeometry(0.014, 0.014, 0.003, 28);
  buttonGeometry.rotateX(Math.PI / 2);
  const pinGeometry = new THREE.CylinderGeometry(0.0022, 0.0022, earThickness + 0.01, 10);
  pinGeometry.rotateX(Math.PI / 2);
  const buttonMat = solid(0xf2c230, 0.5);
  const button = mesh(buttonGeometry, buttonMat, leftEar);
  button.position.set(0.48 * L, -0.004, -earThickness / 2 - 0.003);
  const pin = mesh(pinGeometry, buttonMat, leftEar);
  pin.position.set(0.48 * L, -0.004, 0);

  // --- Tail ---------------------------------------------------------------------------
  const tail = new THREE.Group();
  tail.position.set(-0.84, 1.24, 0);
  tail.rotation.z = -0.2;
  body.add(tail);
  const tailMat = solid(coat.tail, 0.8);
  const tail1 = mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.42, 10), tailMat, tail);
  tail1.position.y = -0.21;
  const tail2 = new THREE.Group();
  tail2.position.y = -0.42;
  tail.add(tail2);
  const tail2Mesh = mesh(new THREE.CylinderGeometry(0.02, 0.014, 0.36, 10), tailMat, tail2);
  tail2Mesh.position.y = -0.18;
  dot(tail2, solid(coat.tailTip, 0.9), [0, -0.42, 0], [0.045, 0.12, 0.045]);

  // --- Animation ----------------------------------------------------------------------
  let gait = 0;
  let time = 0;
  let neckPitch = 0;
  let neckYaw = 0;
  let speedSmooth = 0;
  const earFlick = [0, 0];
  const earFlickTimer = [1.5, 3.2];
  let tailSwish = 0;
  let tailTimer = 2;

  const update = (dt: number, pose: CowPose) => {
    time += dt;
    speedSmooth += (pose.speed - speedSmooth) * Math.min(1, dt * 4);
    const stride = 1.25;
    gait = (gait + (speedSmooth / stride) * dt) % 1;
    const walking = Math.min(1, speedSmooth / 0.35);

    for (const leg of legs) {
      const angle = (gait + leg.phase) * Math.PI * 2;
      const lame = leg.front && leg.right ? 1 - pose.limp * 0.6 : 1;
      leg.hip.rotation.z = Math.sin(angle) * 0.32 * walking * lame;
      // Lift and fold the lower leg in the swing phase.
      const swing = Math.max(0, Math.sin(angle + Math.PI / 2));
      leg.knee.rotation.z = -swing * 0.55 * walking * lame;
    }
    // Lameness adds a head nod and a hitch in the stride.
    const nod = pose.limp * walking * Math.max(0, Math.sin((gait + 0.75) * Math.PI * 4)) * 0.08;
    body.position.y = Math.abs(Math.sin(gait * Math.PI * 4)) * 0.018 * walking - nod * 0.2;

    const breath = Math.sin(time * Math.PI * 2 * pose.breathRate) * pose.breathDepth;
    torso.scale.set(1, 1 + breath, 1 + breath * 1.3);

    neckPitch += (pose.neckPitch - neckPitch) * Math.min(1, dt * 1.6);
    neckYaw += (pose.neckYaw - neckYaw) * Math.min(1, dt * 1.2);
    neck.rotation.z = neckPitch * 0.97 + nod;
    neck.rotation.y = neckYaw;
    // The face stays near vertical when grazing instead of tucking under.
    head.rotation.z = -neckPitch * 0.34;
    muzzle.position.y = -0.06 + (pose.chewing ? Math.sin(time * 9) * 0.006 : 0);
    head.rotation.x = pose.chewing ? Math.sin(time * 4.5) * 0.03 : 0;

    // Ear flicks: a quick twitch every few seconds.
    ears.forEach((ear, index) => {
      earFlickTimer[index] -= dt;
      if (earFlickTimer[index] <= 0) {
        earFlick[index] = 1;
        earFlickTimer[index] = 2.5 + Math.random() * 5;
      }
      earFlick[index] = Math.max(0, earFlick[index] - dt * 3.2);
      const flick = Math.sin(earFlick[index] * Math.PI) * 0.45;
      ear.rotation.set(-(coat.earDroop - flick * 0.6), Math.PI / 2 + 0.28 - flick * 0.4, 0, "XYZ");
    });

    tailTimer -= dt;
    if (tailTimer <= 0) {
      tailSwish = 1;
      tailTimer = 1.5 + Math.random() * 4;
    }
    tailSwish = Math.max(0, tailSwish - dt * 0.7);
    tail.rotation.x = Math.sin(time * 5) * 0.55 * tailSwish + Math.sin(time * 0.9) * 0.05;
    tail2.rotation.x = Math.sin(time * 5 - 0.8) * 0.6 * tailSwish;
  };
  update(0, { speed: 0, neckPitch: 0, neckYaw: 0, breathRate: 0.3, breathDepth: 0.01, limp: 0, chewing: false });

  const dispose = () => {
    for (const geometry of geometries) geometry.dispose();
    for (const material of materials) material.dispose();
  };

  return { root, tagMount, leftEar, update, dispose };
}
