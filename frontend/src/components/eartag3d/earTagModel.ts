import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import type { EarTagVariant } from "@/data/earTagVariants";

/**
 * Loads the ear tag assemblies exported from the CAD (meshopt-compressed GLB,
 * one mesh per part) and turns them into posable, recolourable instances.
 */

const cache = new Map<string, Promise<GLTF>>();

function loadGltf(url: string) {
  let pending = cache.get(url);
  if (!pending) {
    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    pending = loader.loadAsync(url);
    pending.catch(() => cache.delete(url));
    cache.set(url, pending);
  }
  return pending;
}

/** Start downloading a model ahead of time. */
export function preloadEarTag(variant: EarTagVariant) {
  void loadGltf(variant.model);
}

const METALLIC = /screw|insert|shield|USB-C|MLX|LiPo|Solar_cell/;

export interface EarTagInstance {
  variant: EarTagVariant;
  /** Root in CAD millimetres. */
  root: THREE.Group;
  /** Enclosure parts by node name. */
  parts: Record<string, THREE.Object3D>;
  electronics: THREE.Object3D | null;
  /** Every individual node with a mesh: enclosure parts and electronics. */
  nodes: THREE.Object3D[];
  meshes: THREE.Mesh[];
  setColourway: (parts: Record<string, number>) => void;
  setExplode: (t: number) => void;
  dispose: () => void;
}

export async function createEarTag(variant: EarTagVariant): Promise<EarTagInstance> {
  const gltf = await loadGltf(variant.model);
  const root = gltf.scene.clone(true);
  const assembly = root.children[0];
  assembly.quaternion.identity();

  const meshes: THREE.Mesh[] = [];
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const source = mesh.material as THREE.MeshStandardMaterial;
    const metallic = METALLIC.test(mesh.name) || METALLIC.test(mesh.parent?.name ?? "");
    mesh.material = new THREE.MeshStandardMaterial({
      color: source.color.clone(),
      roughness: metallic ? 0.32 : 0.55,
      metalness: metallic ? 0.75 : 0,
    });
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    meshes.push(mesh);
  });

  const parts: Record<string, THREE.Object3D> = {};
  let electronics: THREE.Object3D | null = null;
  const nodes: THREE.Object3D[] = [];
  for (const child of assembly.children) {
    child.userData.base = child.position.clone();
    if (child.name === "electronics") {
      electronics = child;
      for (const component of child.children) {
        component.userData.base = component.position.clone();
        nodes.push(component);
      }
    } else {
      parts[child.name] = child;
      nodes.push(child);
    }
  }

  const firstMesh = (node: THREE.Object3D) => {
    let found: THREE.Mesh | null = null;
    node.traverse((object) => {
      if (!found && (object as THREE.Mesh).isMesh) found = object as THREE.Mesh;
    });
    return found as THREE.Mesh | null;
  };

  const setColourway = (colours: Record<string, number>) => {
    for (const [name, hex] of Object.entries(colours)) {
      const mesh = parts[name] && firstMesh(parts[name]);
      if (mesh) (mesh.material as THREE.MeshStandardMaterial).color.setHex(hex);
    }
  };

  const offset = new THREE.Vector3();
  const setExplode = (t: number) => {
    for (const [name, node] of Object.entries(parts)) {
      const base = node.userData.base as THREE.Vector3;
      if (name === "usb_plug") {
        node.position.set(base.x, base.y + variant.usbExplode[0] * t, base.z + variant.usbExplode[1] * t);
        continue;
      }
      const z = (variant.explode[name] ?? 0) * t;
      node.position.copy(base).add(offset.set(0, 0.22 * z, z));
    }
    if (electronics) {
      for (const component of electronics.children) {
        const z = /screw/.test(component.name)
          ? variant.screwExplode
          : /insert/.test(component.name)
            ? variant.insertExplode
            : 0;
        component.position.copy(component.userData.base as THREE.Vector3).add(offset.set(0, 0.22 * z * t, z * t));
      }
    }
  };

  const dispose = () => {
    // Geometry is shared with the cached GLTF; only the per-instance materials are ours.
    for (const mesh of meshes) (mesh.material as THREE.Material).dispose();
  };

  return { variant, root, parts, electronics, nodes, meshes, setColourway, setExplode, dispose };
}

/** Human readable name for a GLB node, e.g. `11_MLX90614_IR_thermometer` -> `MLX90614 IR thermometer`. */
export function prettyNodeName(name: string) {
  return name.replace(/^\d+_/, "").replace(/_/g, " ");
}
