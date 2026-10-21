"""Trace the Terrava logo (images/logo.png) into clean vector outlines.

The CAD model needs the logo as polygons (outer contours + holes) so it can be
cut into the front shell as a flush two-colour inlay. Run this once whenever the
logo changes; it writes `terrava_logo.json` (normalised, 1 unit = logo height)
and `terrava_logo.svg` next to this file.

    python trace_logo.py
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image
from shapely.geometry import Polygon, mapping
from shapely.ops import unary_union
from skimage import measure

HERE = Path(__file__).resolve().parent
LOGO_PNG = next(p for p in HERE.parents if (p / "images" / "logo.png").exists()) / "images" / "logo.png"

# Ignore specks smaller than this fraction of the logo area (anti-aliasing noise).
MIN_AREA_FRACTION = 2e-4
# Douglas-Peucker tolerance in source pixels; keeps edges crisp without jaggies.
SIMPLIFY_PX = 1.1


def load_mask(path: Path) -> np.ndarray:
    img = Image.open(path).convert("RGBA")
    rgba = np.asarray(img).astype(np.float32) / 255.0
    rgb, alpha = rgba[..., :3], rgba[..., 3]
    # The mark is a saturated green on white: "green-ness" separates it cleanly.
    greenness = rgb[..., 1] - 0.5 * (rgb[..., 0] + rgb[..., 2])
    return (greenness > 0.12) & (alpha > 0.5)


def trace(mask: np.ndarray) -> list[Polygon]:
    padded = np.pad(mask.astype(np.float32), 2)
    contours = measure.find_contours(padded, 0.5)
    rings = []
    for c in contours:
        if len(c) < 8:
            continue
        # (row, col) -> (x, y) with y up, undo padding
        pts = np.column_stack([c[:, 1] - 2, -(c[:, 0] - 2)])
        poly = Polygon(pts).buffer(0)
        if poly.is_empty:
            continue
        rings.append(poly.simplify(SIMPLIFY_PX, preserve_topology=True))

    total = float(mask.sum())
    rings = [r for r in rings if r.area > MIN_AREA_FRACTION * total]

    # Even-odd fill: a ring nested inside an odd number of rings is a hole.
    rings.sort(key=lambda p: p.area, reverse=True)
    depth = []
    for i, r in enumerate(rings):
        rp = r.representative_point()
        depth.append(sum(1 for j in range(i) if rings[j].contains(rp)))
    result = None
    for r, d in zip(rings, depth):
        if result is None:
            result = r
        elif d % 2 == 0:
            result = result.union(r)
        else:
            result = result.difference(r)
    merged = unary_union(result)
    geoms = list(merged.geoms) if hasattr(merged, "geoms") else [merged]
    return [g for g in geoms if g.area > MIN_AREA_FRACTION * total]


def normalise(polys: list[Polygon]) -> list[Polygon]:
    from shapely import affinity

    union = unary_union(polys)
    minx, miny, maxx, maxy = union.bounds
    h = maxy - miny
    cx, cy = (minx + maxx) / 2, (miny + maxy) / 2
    out = []
    for p in polys:
        q = affinity.translate(p, -cx, -cy)
        out.append(affinity.scale(q, 1 / h, 1 / h, origin=(0, 0)))
    return out


def main() -> None:
    mask = load_mask(LOGO_PNG)
    polys = normalise(trace(mask))
    bounds = unary_union(polys).bounds
    data = {
        "source": "images/logo.png",
        "units": "normalised: logo height = 1.0, centred on origin",
        "aspect": (bounds[2] - bounds[0]) / (bounds[3] - bounds[1]),
        "polygons": [mapping(p) for p in polys],
    }
    (HERE / "terrava_logo.json").write_text(json.dumps(data))

    # SVG preview (y flipped back for screen coordinates)
    paths = []
    for p in polys:
        for ring in [p.exterior, *p.interiors]:
            xs, ys = ring.xy
            d = "M" + " L".join(f"{x * 100 + 60:.2f},{-y * 100 + 55:.2f}" for x, y in zip(xs, ys)) + " Z"
            paths.append(d)
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 110">'
        f'<path fill="#06703F" fill-rule="evenodd" d="{" ".join(paths)}"/></svg>'
    )
    (HERE / "terrava_logo.svg").write_text(svg)
    n_pts = sum(len(p.exterior.coords) + sum(len(i.coords) for i in p.interiors) for p in polys)
    print(f"traced {len(polys)} polygons, {n_pts} points, aspect {data['aspect']:.3f}")


if __name__ == "__main__":
    main()
