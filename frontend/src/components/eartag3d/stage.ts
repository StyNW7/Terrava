import * as THREE from "three";

export interface Stage {
  renderer: THREE.WebGLRenderer;
  /** Current drawing-buffer size in CSS pixels. */
  size: { width: number; height: number };
  /** Called every frame while the stage is on screen, with the elapsed seconds. */
  onFrame: (callback: (dt: number, elapsed: number) => void) => void;
  onResize: (callback: (width: number, height: number) => void) => void;
  dispose: () => void;
}

/**
 * A WebGL canvas that fills `container`, follows its size and only renders
 * while it is visible, so several 3D scenes can share one page cheaply.
 */
export function createStage(container: HTMLElement, options: { shadows?: boolean } = {}): Stage {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  if (options.shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
  }
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.touchAction = "none";
  container.appendChild(renderer.domElement);

  const size = { width: 1, height: 1 };
  const frameCallbacks: Array<(dt: number, elapsed: number) => void> = [];
  const resizeCallbacks: Array<(width: number, height: number) => void> = [];

  const resize = () => {
    size.width = Math.max(1, container.clientWidth);
    size.height = Math.max(1, container.clientHeight);
    renderer.setSize(size.width, size.height, false);
    for (const callback of resizeCallbacks) callback(size.width, size.height);
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  let onScreen = false;
  const intersection = new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    },
    { rootMargin: "120px" }
  );
  intersection.observe(container);

  let running = false;
  let last = 0;
  let elapsed = 0;
  const tick = (time: number) => {
    // Clamp long gaps (tab switch, debugger) so animations never jump.
    const dt = Math.min(Math.max((time - last) / 1000, 0), 1 / 20);
    last = time;
    elapsed += dt;
    for (const callback of frameCallbacks) callback(dt, elapsed);
  };
  const update = () => {
    const active = onScreen && document.visibilityState === "visible";
    if (active && !running) {
      running = true;
      last = performance.now();
      renderer.setAnimationLoop(tick);
    } else if (!active && running) {
      running = false;
      renderer.setAnimationLoop(null);
    }
  };
  document.addEventListener("visibilitychange", update);

  return {
    renderer,
    size,
    onFrame: (callback) => frameCallbacks.push(callback),
    onResize: (callback) => {
      resizeCallbacks.push(callback);
      callback(size.width, size.height);
    },
    dispose: () => {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", update);
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

/** Frame-rate independent exponential smoothing factor. */
export function damp(lambda: number, dt: number) {
  return 1 - Math.exp(-lambda * dt);
}
