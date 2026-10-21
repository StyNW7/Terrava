/**
 * Rebuild the web copies of the ear tag 3D models used on /smart-ear-tag.
 *
 * Source: the CAD assemblies in iot/ear-tag-specifications/<design>/models/*.glb
 * (OpenCASCADE export, one primitive per B-rep face, ~2.3 MB each).
 * Output: public/models/ear-tag/*.glb, one mesh per part with every part name
 * kept (the 3D studio explodes, recolours and selects parts by name),
 * meshopt-compressed to ~0.3 MB.
 *
 *   npm i --no-save @gltf-transform/core@4 @gltf-transform/functions@4 @gltf-transform/extensions@4 meshoptimizer@1
 *   node scripts/optimize-ear-tag-models.mjs
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, join, meshopt, prune, weld } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const specs = path.resolve(root, "../iot/ear-tag-specifications");
const models = [
  ["tv-et0-classic/models/terrava-classic-assembly.glb", "tv-et0-classic.glb"],
  ["tv-et1-shield/models/terrava-ear-tag-assembly.glb", "tv-et1-shield.glb"],
];

await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "meshopt.encoder": MeshoptEncoder,
  "meshopt.decoder": MeshoptDecoder,
});

for (const [source, target] of models) {
  const document = await io.read(path.join(specs, source));
  // The CAD is authored Y-up already; drop the exporter's Z-up correction.
  for (const scene of document.getRoot().listScenes()) for (const node of scene.listChildren()) node.setRotation([0, 0, 0, 1]);
  await document.transform(dedup(), weld(), join({ keepMeshes: true, keepNamed: true }), prune(), meshopt({ encoder: MeshoptEncoder, level: "medium" }));
  const output = path.join(root, "public/models/ear-tag", target);
  await io.write(output, document);
  console.log(`wrote ${path.relative(root, output)}`);
}
