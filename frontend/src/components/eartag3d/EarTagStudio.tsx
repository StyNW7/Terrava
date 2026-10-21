import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  Box,
  Camera,
  Cpu,
  Layers,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCw,
  Ruler,
  ScanEye,
  X,
} from "lucide-react";
import { earTagComponents, earTagVariants, type EarTagVariantId } from "@/data/earTagVariants";
import { createEarTag, preloadEarTag, prettyNodeName, type EarTagInstance } from "@/components/eartag3d/earTagModel";
import { createStage, damp, type Stage } from "@/components/eartag3d/stage";
import VariantSwitch from "@/components/eartag3d/VariantSwitch";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

type ViewId = "iso" | "front" | "rear" | "side" | "top";

const VIEW_OFFSETS: Record<ViewId, [number, number, number]> = {
  iso: [-112, 64, 224],
  front: [0, 4, 262],
  rear: [0, 4, -262],
  side: [262, 6, 0],
  top: [0, 262, 2],
};

const GROUP_ORDER = ["enclosure", "sensing", "compute", "power"] as const;

/** Aim a little below the model centre so it sits above the control panel. */
const TARGET_SHIFT = new THREE.Vector3(0, -14, 0);

interface StudioProps {
  variantId: EarTagVariantId;
  onVariantChange: (id: EarTagVariantId) => void;
}

interface Runtime {
  stage: Stage;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  modelHolder: THREE.Group;
  dimsBox: THREE.LineSegments;
}

export default function EarTagStudio({ variantId, onVariantChange }: StudioProps) {
  const { t, tr } = useLanguage();
  const variant = earTagVariants[variantId];

  const frameRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const dimLabelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const runtimeRef = useRef<Runtime | null>(null);
  const instanceRef = useRef<EarTagInstance | null>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error" | "webgl">("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [explode, setExplode] = useState(0);
  const [cycling, setCycling] = useState(false);
  const [showFront, setShowFront] = useState(true);
  const [showElectronics, setShowElectronics] = useState(true);
  const [xray, setXray] = useState(false);
  const [dims, setDims] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [colourway, setColourway] = useState(variant.colourways[0].id);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<ViewId | null>("iso");
  const [fullscreen, setFullscreen] = useState(false);
  const [nodeNames, setNodeNames] = useState<string[]>([]);

  const explodeRef = useRef(explode);
  explodeRef.current = explode;

  // Everything the render loop reads lives in one ref so the loop never re-subscribes.
  const live = useRef({
    explodeTarget: 0,
    explodeNow: 0,
    cycling: false,
    cycleTime: 0,
    dims: false,
    hovered: null as THREE.Object3D | null,
    pointer: new THREE.Vector2(),
    pointerInside: false,
    pointerDirty: false,
    tween: null as null | { from: THREE.Vector3; to: THREE.Vector3; fromTarget: THREE.Vector3; toTarget: THREE.Vector3; t: number },
  });

  const availableComponents = useMemo(
    () => earTagComponents.filter((component) => nodeNames.some((name) => component.match.test(name))),
    [nodeNames]
  );

  const selectedInfo = availableComponents.find((component) => component.id === selected) ?? null;

  /** Push the current toggles, selection and hover into the materials. */
  const applyMaterials = useCallback(() => {
    const instance = instanceRef.current;
    if (!instance) return;
    const info = earTagComponents.find((component) => component.id === selected) ?? null;
    const hovered = live.current.hovered;
    for (const node of instance.nodes) {
      const isElectronic = node.parent === instance.electronics;
      const isFront = instance.variant.frontShell.includes(node.name);
      node.visible = isElectronic ? showElectronics : isFront ? showFront : true;
      const isSelected = info ? info.match.test(node.name) : false;
      const isShell = isFront || node.name === instance.variant.rearShell;
      const ghost = info ? !isSelected : xray && isShell;
      const isHovered = hovered === node;
      node.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (material.transparent !== ghost) {
          material.transparent = ghost;
          material.needsUpdate = true;
        }
        material.opacity = ghost ? (info ? 0.12 : 0.2) : 1;
        material.depthWrite = !ghost;
        material.emissive.setHex(isSelected ? 0x2fbf71 : isHovered ? 0x2a8a5a : 0x000000);
        material.emissiveIntensity = isSelected ? 0.5 : 0.28;
      });
    }
  }, [selected, showElectronics, showFront, xray]);

  const applyMaterialsRef = useRef(applyMaterials);
  applyMaterialsRef.current = applyMaterials;

  const flyTo = useCallback(
    (next: ViewId) => {
      const runtime = runtimeRef.current;
      if (!runtime) return;
      const focus = new THREE.Vector3(...earTagVariants[variantId].focus).add(TARGET_SHIFT);
      const offset = VIEW_OFFSETS[next];
      live.current.tween = {
        from: runtime.camera.position.clone(),
        to: focus.clone().add(new THREE.Vector3(...offset)),
        fromTarget: runtime.controls.target.clone(),
        toTarget: focus,
        t: 0,
      };
      setView(next);
    },
    [variantId]
  );

  // --- Scene setup (once) ------------------------------------------------
  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;
    let stage: Stage;
    try {
      stage = createStage(host, { shadows: true });
    } catch {
      setStatus("webgl");
      return;
    }
    const { renderer } = stage;
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment;

    const camera = new THREE.PerspectiveCamera(30, 1, 1, 5000);
    const focus = new THREE.Vector3(0, 34, 7).add(TARGET_SHIFT);
    camera.position.copy(focus).add(new THREE.Vector3(...VIEW_OFFSETS.iso));
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(focus);
    controls.enableDamping = true;
    controls.minDistance = 70;
    controls.maxDistance = 700;
    controls.autoRotateSpeed = 1.4;
    controls.addEventListener("start", () => {
      live.current.tween = null;
      setView(null);
    });

    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(-120, 220, 160);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -150, right: 150, top: 150, bottom: -150, near: 10, far: 800 });
    scene.add(sun);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(600, 64), new THREE.ShadowMaterial({ opacity: 0.14 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -30;
    ground.receiveShadow = true;
    scene.add(ground);

    const modelHolder = new THREE.Group();
    scene.add(modelHolder);

    const dimsBox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)),
      new THREE.LineDashedMaterial({ color: 0x277a4d, dashSize: 2.5, gapSize: 1.8, transparent: true, opacity: 0.85 })
    );
    dimsBox.computeLineDistances();
    dimsBox.visible = false;
    scene.add(dimsBox);

    stage.onResize((width, height) => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });

    const raycaster = new THREE.Raycaster();
    const projected = new THREE.Vector3();
    const dimAnchors = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

    stage.onFrame((dt) => {
      const state = live.current;
      const instance = instanceRef.current;

      if (state.tween) {
        state.tween.t = Math.min(1, state.tween.t + dt / 0.9);
        const k = 1 - Math.pow(1 - state.tween.t, 3);
        camera.position.lerpVectors(state.tween.from, state.tween.to, k);
        controls.target.lerpVectors(state.tween.fromTarget, state.tween.toTarget, k);
        if (state.tween.t >= 1) state.tween = null;
      }
      controls.update(dt);

      if (state.cycling) {
        state.cycleTime += dt;
        // Hold assembled, explode, hold exploded, re-assemble: a 6 s loop.
        const phase = (state.cycleTime % 6) / 6;
        const ease = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);
        state.explodeTarget = phase < 0.15 ? 0 : phase < 0.45 ? ease((phase - 0.15) / 0.3) : phase < 0.65 ? 1 : phase < 0.95 ? 1 - ease((phase - 0.65) / 0.3) : 0;
      }
      if (instance && Math.abs(state.explodeNow - state.explodeTarget) > 0.0005) {
        state.explodeNow += (state.explodeTarget - state.explodeNow) * damp(state.cycling ? 30 : 12, dt);
        instance.setExplode(state.explodeNow);
      }

      if (instance && state.pointerDirty) {
        state.pointerDirty = false;
        let hit: THREE.Object3D | null = null;
        if (state.pointerInside) {
          raycaster.setFromCamera(state.pointer, camera);
          const targets = instance.meshes.filter((mesh) => {
            let visible = true;
            mesh.traverseAncestors((ancestor) => {
              if (!ancestor.visible) visible = false;
            });
            return visible && mesh.visible && !(mesh.material as THREE.Material).transparent;
          });
          const first = raycaster.intersectObjects(targets, false)[0];
          if (first) {
            let node: THREE.Object3D | null = first.object;
            while (node && !instance.nodes.includes(node)) node = node.parent;
            hit = node;
          }
        }
        if (hit !== state.hovered) {
          state.hovered = hit;
          applyMaterialsRef.current();
          const tooltip = tooltipRef.current;
          if (tooltip) {
            const info = hit ? earTagComponents.find((component) => component.match.test(hit!.name)) : null;
            tooltip.textContent = hit ? (info?.name ?? prettyNodeName(hit.name)) : "";
            tooltip.style.opacity = hit ? "1" : "0";
          }
          renderer.domElement.style.cursor = hit ? "pointer" : "grab";
        }
      }

      dimsBox.visible = state.dims && !!instance;
      if (dimsBox.visible) {
        const box = dimsBox.userData.box as THREE.Box3 | undefined;
        if (box) {
          dimAnchors[0].set((box.min.x + box.max.x) / 2, box.min.y, box.max.z);
          dimAnchors[1].set(box.max.x, (box.min.y + box.max.y) / 2, box.max.z);
          dimAnchors[2].set(box.max.x, box.min.y, (box.min.z + box.max.z) / 2);
        }
      }
      dimLabelRefs.current.forEach((label, index) => {
        if (!label) return;
        if (!dimsBox.visible) {
          label.style.opacity = "0";
          return;
        }
        projected.copy(dimAnchors[index]).project(camera);
        const x = (projected.x * 0.5 + 0.5) * stage.size.width;
        const y = (-projected.y * 0.5 + 0.5) * stage.size.height;
        label.style.opacity = projected.z < 1 ? "1" : "0";
        label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      });

      renderer.render(scene, camera);
    });

    const onPointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      live.current.pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      live.current.pointerInside = true;
      live.current.pointerDirty = true;
      const tooltip = tooltipRef.current;
      if (tooltip) tooltip.style.transform = `translate(${event.clientX - rect.left + 14}px, ${event.clientY - rect.top + 14}px)`;
    };
    const onPointerLeave = () => {
      live.current.pointerInside = false;
      live.current.pointerDirty = true;
    };
    let downAt = { x: 0, y: 0 };
    const onPointerDown = (event: PointerEvent) => {
      downAt = { x: event.clientX, y: event.clientY };
    };
    const onPointerUp = (event: PointerEvent) => {
      // A click, not the end of an orbit drag.
      if (Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y) > 5) return;
      const hovered = live.current.hovered;
      const info = hovered ? earTagComponents.find((component) => component.match.test(hovered.name)) : null;
      setSelected((current) => (info ? (current === info.id ? null : info.id) : null));
    };
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.setAttribute("aria-label", "Terrava smart ear tag 3D model");
    renderer.domElement.setAttribute("role", "img");

    runtimeRef.current = { stage, scene, camera, controls, modelHolder, dimsBox };

    return () => {
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      environment.dispose();
      pmrem.dispose();
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      dimsBox.geometry.dispose();
      (dimsBox.material as THREE.Material).dispose();
      instanceRef.current?.dispose();
      instanceRef.current = null;
      stage.dispose();
      runtimeRef.current = null;
    };
  }, []);

  // --- Load the selected variant ------------------------------------------
  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    let cancelled = false;
    setStatus("loading");
    // Warm the other model so switching is instant.
    for (const other of Object.values(earTagVariants)) if (other.id !== variantId) preloadEarTag(other);

    createEarTag(earTagVariants[variantId])
      .then((instance) => {
        if (cancelled) {
          instance.dispose();
          return;
        }
        instanceRef.current?.dispose();
        runtime.modelHolder.clear();
        runtime.modelHolder.add(instance.root);
        instanceRef.current = instance;
        live.current.explodeNow = 0;
        instance.setExplode(0);

        const box = new THREE.Box3().setFromObject(instance.root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        runtime.dimsBox.scale.copy(size);
        runtime.dimsBox.position.copy(center);
        runtime.dimsBox.userData.box = box;

        live.current.explodeTarget = explodeRef.current;
        setColourway(instance.variant.colourways[0].id);
        instance.setColourway(instance.variant.colourways[0].parts);
        setSelected(null);
        setNodeNames(instance.nodes.map((node) => node.name));
        applyMaterialsRef.current();
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [variantId, reloadKey]);

  // --- React state -> scene -------------------------------------------------
  useEffect(() => {
    applyMaterials();
  }, [applyMaterials]);

  useEffect(() => {
    const instance = instanceRef.current;
    const option = variant.colourways.find((item) => item.id === colourway);
    if (instance && option && instance.variant.id === variant.id) instance.setColourway(option.parts);
  }, [colourway, variant]);

  useEffect(() => {
    if (runtimeRef.current) runtimeRef.current.controls.autoRotate = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    live.current.dims = dims;
  }, [dims]);

  useEffect(() => {
    live.current.cycling = cycling;
    if (cycling) live.current.cycleTime = 0;
  }, [cycling]);

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const onExplodeInput = (value: number) => {
    setCycling(false);
    setExplode(value);
    live.current.explodeTarget = value;
  };

  const takeScreenshot = () => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    runtime.stage.renderer.render(runtime.scene, runtime.camera);
    const link = document.createElement("a");
    link.download = `terrava-${variant.code.toLowerCase()}-${variant.id}.png`;
    link.href = runtime.stage.renderer.domElement.toDataURL("image/png");
    link.click();
  };

  const toggleFullscreen = () => {
    const frame = frameRef.current;
    if (!frame) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frame.requestFullscreen?.();
  };

  const toggles = [
    { id: "front", icon: Layers, label: t("eartag.studio.frontShell"), active: showFront, onClick: () => setShowFront((value) => !value) },
    { id: "electronics", icon: Cpu, label: t("eartag.studio.electronics"), active: showElectronics, onClick: () => setShowElectronics((value) => !value) },
    { id: "xray", icon: ScanEye, label: t("eartag.studio.xray"), active: xray, onClick: () => setXray((value) => !value) },
    { id: "dims", icon: Ruler, label: t("eartag.studio.dimensions"), active: dims, onClick: () => setDims((value) => !value) },
  ];

  const views: ViewId[] = ["iso", "front", "rear", "side", "top"];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div
        ref={frameRef}
        className={cn(
          "relative isolate overflow-hidden rounded-3xl border border-terrava-border bg-[radial-gradient(120%_90%_at_50%_0%,#ffffff_0%,#eef4f0_55%,#dfeae3_100%)] shadow-card dark:bg-[radial-gradient(120%_90%_at_50%_0%,#1c3328_0%,#12221a_60%,#0c1712_100%)]",
          fullscreen ? "h-screen rounded-none" : "sm:h-[540px]"
        )}
      >
        {/* On phones the canvas gets its own block and the controls sit underneath it. */}
        <div className={cn(fullscreen ? "absolute inset-0" : "relative h-[340px] sm:absolute sm:inset-0 sm:h-auto")}>
          <div ref={canvasHostRef} className="absolute inset-0" />
        </div>

        {/* Hover label */}
        <div
          ref={tooltipRef}
          className="pointer-events-none absolute left-0 top-0 z-20 rounded-lg bg-terrava-forest/90 px-2.5 py-1 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity"
        />

        {/* Dimension labels */}
        {variant.envelope.map((value, index) => (
          <div
            key={index}
            ref={(element) => {
              dimLabelRefs.current[index] = element;
            }}
            className="pointer-events-none absolute left-0 top-0 z-10 rounded-md bg-terrava-primary px-2 py-0.5 font-mono text-[11px] font-semibold text-white opacity-0 shadow"
          >
            {["W", "H", "D"][index]} {value} mm
          </div>
        ))}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-wrap items-start justify-between gap-3 p-3 sm:p-4">
          <div className="pointer-events-auto">
            <VariantSwitch value={variantId} onChange={onVariantChange} tone="glass" />
          </div>
          <div className="pointer-events-auto flex items-center gap-1.5">
            <IconButton label={t("eartag.studio.autoRotate")} active={autoRotate} onClick={() => setAutoRotate((value) => !value)}>
              <RotateCw className="h-4 w-4" />
            </IconButton>
            <IconButton label={t("eartag.studio.screenshot")} onClick={takeScreenshot}>
              <Camera className="h-4 w-4" />
            </IconButton>
            <IconButton label={t("eartag.studio.fullscreen")} onClick={toggleFullscreen}>
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </IconButton>
          </div>
        </div>

        <div className={cn("z-10 p-3 sm:pointer-events-none sm:absolute sm:inset-x-0 sm:bottom-0 sm:p-4", fullscreen && "pointer-events-none absolute inset-x-0 bottom-0")}>
          <div className="pointer-events-auto rounded-2xl border border-white/60 bg-white/85 p-3 shadow-lg backdrop-blur dark:border-white/10 dark:bg-terrava-forest/80">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <div className="flex min-w-[200px] flex-1 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCycling((value) => !value)}
                  aria-pressed={cycling}
                  aria-label={cycling ? t("eartag.studio.pause") : t("eartag.studio.assemble")}
                  title={cycling ? t("eartag.studio.pause") : t("eartag.studio.assemble")}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terrava-primary text-white shadow-sm transition-colors hover:bg-terrava-hover"
                >
                  {cycling ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
                </button>
                <label className="flex flex-1 flex-col gap-1">
                  <span className="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-terrava-muted">
                    {t("eartag.studio.explode")}
                    <output className="font-mono normal-case">{cycling ? "auto" : `${Math.round(explode * 100)}%`}</output>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={explode}
                    onChange={(event) => onExplodeInput(Number(event.target.value))}
                    className="w-full accent-terrava-primary"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {toggles.map((toggle) => (
                  <button
                    key={toggle.id}
                    type="button"
                    onClick={toggle.onClick}
                    aria-pressed={toggle.active}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                      toggle.active
                        ? "border-terrava-primary bg-terrava-primary text-white"
                        : "border-terrava-border bg-white text-terrava-muted hover:text-terrava-primary"
                    )}
                  >
                    <toggle.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {toggle.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-terrava-border pt-3">
              <Box className="mr-1 h-3.5 w-3.5 text-terrava-muted" aria-hidden="true" />
              {views.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => flyTo(id)}
                  aria-pressed={view === id}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                    view === id ? "bg-terrava-light text-terrava-primary" : "text-terrava-muted hover:text-terrava-primary"
                  )}
                >
                  {t(`eartag.studio.view.${id}`)}
                </button>
              ))}
              <span className="ml-auto hidden text-[11px] text-terrava-muted sm:inline">{t("eartag.studio.hint")}</span>
            </div>
          </div>
        </div>

        {status !== "ready" && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-terrava-bg/70 px-6 text-center backdrop-blur-sm">
            {status === "loading" && (
              <>
                <Loader2 className="h-7 w-7 animate-spin text-terrava-primary" aria-hidden="true" />
                <p className="text-sm font-medium text-terrava-text">{t("eartag.studio.loading", { model: `${variant.code} ${variant.name}` })}</p>
              </>
            )}
            {status === "error" && (
              <>
                <p className="text-sm font-medium text-terrava-text">{t("eartag.studio.error")}</p>
                <button
                  type="button"
                  onClick={() => setReloadKey((value) => value + 1)}
                  className="rounded-full bg-terrava-primary px-4 py-2 text-xs font-semibold text-white"
                >
                  {t("eartag.studio.retry")}
                </button>
              </>
            )}
            {status === "webgl" && (
              <>
                <img src={variant.heroImage} alt={`${variant.code} ${variant.name}`} className="max-h-[60%] rounded-2xl object-contain" />
                <p className="max-w-sm text-sm text-terrava-muted">{t("eartag.studio.noWebgl")}</p>
              </>
            )}
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-4">
        <div className="rounded-2xl border border-terrava-border bg-white p-5 shadow-card">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-lg font-bold text-terrava-text">
              <span className="mr-2 font-mono text-xs font-semibold text-terrava-primary">{variant.code}</span>
              {variant.name}
            </h3>
            <span className="text-xs font-medium text-terrava-muted">≈ {variant.weightGrams} g</span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-terrava-muted">{tr(variant.tagline)}</p>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-terrava-muted">{t("eartag.studio.colourway")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {variant.colourways.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setColourway(option.id)}
                aria-pressed={colourway === option.id}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  colourway === option.id ? "border-terrava-primary text-terrava-primary" : "border-terrava-border text-terrava-muted hover:text-terrava-text"
                )}
              >
                <span className="flex" aria-hidden="true">
                  <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: option.swatch[0] }} />
                  <span className="-ml-1 h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: option.swatch[1] }} />
                </span>
                {tr(option.label)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-terrava-border bg-white p-5 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-terrava-muted">{t("eartag.studio.components")}</p>
            {selectedInfo && (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-terrava-primary"
              >
                <X className="h-3 w-3" aria-hidden="true" />
                {t("eartag.studio.clear")}
              </button>
            )}
          </div>

          {selectedInfo ? (
            <div className="mt-3 rounded-xl border border-terrava-primary/20 bg-terrava-light p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-terrava-primary">{t(`eartag.studio.group.${selectedInfo.group}`)}</p>
              <h4 className="mt-1 text-sm font-bold text-terrava-text">{selectedInfo.name}</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-terrava-muted">{tr(selectedInfo.description)}</p>
            </div>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-terrava-muted">{t("eartag.studio.componentsHint")}</p>
          )}

          <div className="mt-3 space-y-3 overflow-y-auto pr-1 lg:max-h-[300px]">
            {GROUP_ORDER.map((group) => {
              const items = availableComponents.filter((component) => component.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group}>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-terrava-muted-2">{t(`eartag.studio.group.${group}`)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((component) => (
                      <button
                        key={component.id}
                        type="button"
                        onClick={() => setSelected((current) => (current === component.id ? null : component.id))}
                        aria-pressed={selected === component.id}
                        className={cn(
                          "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors",
                          selected === component.id
                            ? "border-terrava-primary bg-terrava-primary text-white"
                            : "border-terrava-border bg-terrava-bg text-terrava-text hover:border-terrava-primary/40"
                        )}
                      >
                        {component.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}

function IconButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur transition-colors",
        active
          ? "border-terrava-primary bg-terrava-primary text-white"
          : "border-white/60 bg-white/80 text-terrava-text hover:text-terrava-primary dark:border-white/10 dark:bg-terrava-forest/70"
      )}
    >
      {children}
    </button>
  );
}
