"""Photoreal product renders of the Terrava Classic TV-ET0 (Mitsuba 3 path tracer).

Reuses the Shield's studio, materials and camera (../../tv-et1-shield/cad/render.py),
reads the meshes written by terrava_classic.py and writes PNGs into ../images/renders.

    python render_classic.py                      # all shots, final quality
    python render_classic.py --spp 16 --scale 0.4 hero rear   # quick preview
    python render_classic.py lineup               # both designs side by side (../../images)
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import numpy as np
import trimesh

HERE = Path(__file__).resolve().parent
SHIELD = HERE.parents[1] / "tv-et1-shield"
sys.path.insert(0, str(SHIELD / "cad"))

import render as base  # noqa: E402  (the Shield's renderer)
from render import Tf, floor, metal, orbit, plastic, srgb  # noqa: E402

import terrava_classic as tag  # noqa: E402

base.MESHES = HERE.parent / "models" / "render-meshes"
base.OUT = HERE.parent / "images" / "renders"
base.CACHE = HERE / ".render-cache"
MESHES = base.MESHES
LINEUP_OUT = HERE.parents[1] / "images"

T, PIN = tag.T, tag.PIN
CENTRE = (0, 0, T / 2)

IVORY = "#EEECE6"
GREEN = "#0B6B3E"
GREY = "#8F9392"
GRAPHITE = "#2C3133"
MINT = "#9BDCC1"
YELLOW = base.YELLOW

COLORWAYS = {
    "signature": {"housing": IVORY, "cover": IVORY, "logo": GREEN, "cap": GREY, "yoke": GREY, "plug": IVORY},
    "mint": {"housing": MINT, "cover": MINT, "logo": GREEN, "cap": "#E9ECEA", "yoke": "#E9ECEA", "plug": MINT},
    "stealth": {"housing": GRAPHITE, "cover": GRAPHITE, "logo": "#3FB27A", "cap": "#4A5052", "yoke": "#4A5052",
                "plug": GRAPHITE},
}
PARTS = ("housing", "cover", "logo_inlay", "pin_cap", "usb_plug", "ppg_window", "yoke")


def part_bsdfs(cw: dict) -> dict:
    return {
        "housing": plastic(cw["housing"], 0.42),
        "cover": plastic(cw["cover"], 0.40),
        "logo_inlay": plastic(cw["logo"], 0.40),
        "pin_cap": plastic(cw["cap"], 0.62, 0.35),
        "yoke": plastic(cw["yoke"], 0.70, 0.30),
        "lock_ring": plastic("#1E2224", 0.6),
        "gasket": plastic("#1E2224", 0.6),
        "usb_plug": plastic(cw["plug"], 0.6, 0.4),
        "ppg_window": {"type": "principled", "base_color": {"type": "rgb", "value": srgb("#0B0E12")},
                       "roughness": 0.06, "specular": 0.8},
    }


def ply(stl: Path, crease: float = 32.0) -> str:
    return base.ply(stl, crease)


def solar_texture() -> str:
    """SM141K05L-like mono cell: near-black, fine fingers, two bus bars, five cell seams."""
    from PIL import Image, ImageDraw

    base.CACHE.mkdir(exist_ok=True)
    tex = base.CACHE / "solar_classic.png"
    if not tex.exists():
        w, h = 1400, 880
        img = Image.new("RGB", (w, h), (12, 15, 24))
        d = ImageDraw.Draw(img)
        for y in range(10, h, 22):
            d.line([(0, y), (w, y)], fill=(44, 50, 62), width=2)
        for i in range(1, 5):
            x = int(i * w / 5)
            d.line([(x, 0), (x, h)], fill=(5, 6, 10), width=8)
        for x in (int(w * 0.5) - 3,):
            d.line([(x, 0), (x, h)], fill=(120, 126, 136), width=7)
        img.save(tex)
    return str(tex)


def solar_quad(to_world=Tf(), off=(0, 0, 0)) -> dict:
    """Textured face of the cell seen through the rear window (normal -Z)."""
    base.CACHE.mkdir(exist_ok=True)
    obj = base.CACHE / "solar_classic.obj"
    w, h, cy, z = tag.CELL_W - 0.4, tag.CELL_H - 0.4, tag.CELL_CY, tag.REAR + 0.0
    obj.write_text("\n".join([
        f"v {w / 2} {cy - h / 2} {z}", f"v {-w / 2} {cy - h / 2} {z}",
        f"v {-w / 2} {cy + h / 2} {z}", f"v {w / 2} {cy + h / 2} {z}",
        "vt 0 0", "vt 1 0", "vt 1 1", "vt 0 1", "vn 0 0 -1",
        "f 1/1/1 2/2/1 3/3/1", "f 1/1/1 3/3/1 4/4/1",
    ]) + "\n")
    bsdf = {"type": "principled", "base_color": {"type": "bitmap", "filename": solar_texture()},
            "roughness": 0.10, "specular": 0.7, "clearcoat": 1.0, "clearcoat_gloss": 0.95}
    return {"type": "obj", "filename": str(obj), "to_world": to_world @ Tf().translate(list(off)),
            "bsdf": {"type": "twosided", "bsdf": bsdf}}


def rot_y(deg, about=CENTRE):
    return Tf().translate(list(about)) @ Tf().rotate([0, 1, 0], deg) @ Tf().translate([-a for a in about])


def tag_shapes(cw_name="signature", to_world=Tf(), explode=None, with_electronics=False, parts=PARTS,
               prefix="", solar=True) -> dict:
    bs = part_bsdfs(COLORWAYS[cw_name])
    explode = explode or {}
    shapes = {}
    for key in parts:
        off = explode.get(key, (0, 0, 0))
        shapes[f"{prefix}{key}"] = {"type": "ply", "filename": ply(MESHES / f"{key}.stl"),
                                    "to_world": to_world @ Tf().translate(list(off)), "bsdf": bs[key]}
    if solar:
        shapes[f"{prefix}solar"] = solar_quad(to_world, explode.get("electronics", (0, 0, 0)))
    if with_electronics:
        meta = json.loads((MESHES / "components.json").read_text())
        off = explode.get("electronics", (0, 0, 0))
        for i, comp in enumerate(meta):
            name, col = comp["name"], comp["color"]
            hexcol = "#{:02X}{:02X}{:02X}".format(*[int(c * 255) for c in col])
            o = off
            if "screw" in name:
                bsdf, o = metal("#C9CDD2", 0.18), explode.get("screws", off)
            elif "insert" in name:
                bsdf, o = metal("#C9A25A", 0.25), explode.get("inserts", off)
            elif name.startswith("Solar cell"):
                bsdf = {"type": "principled", "base_color": {"type": "rgb", "value": srgb("#11151F")},
                        "roughness": 0.12, "specular": 0.7}
            elif name.startswith("LiPo") or "shield" in name or "USB-C" in name or "MLX" in name:
                bsdf = metal(hexcol, 0.3)
            else:
                bsdf = plastic(hexcol, 0.35, 0.5)
            shapes[f"{prefix}comp{i}"] = {"type": "ply", "filename": ply(MESHES / comp["file"], 20),
                                          "to_world": to_world @ Tf().translate(list(o)), "bsdf": bsdf}
    return shapes


def male_button(to_world: Tf) -> dict:
    return {"type": "ply", "filename": ply(base.male_button_stl(), 40), "to_world": to_world,
            "bsdf": plastic(YELLOW, 0.5)}


camera = base.camera
render = base.render

# the male button head sits on the ear's far side: ear 4.5 mm behind the yoke face
EAR_T = 4.5
BUTTON_Z = -tag.YOKE_T - EAR_T


# --- shots --------------------------------------------------------------------------
def shot_hero(spp):
    tgt = [0, 32, 8.5]
    shapes = tag_shapes("signature", rot_y(24))
    shapes["floor"] = floor(0.0)
    render("01-hero-front", shapes, camera(orbit(-14, 13, 330, tgt), tgt, fov=22, w=2000, h=1500, spp=spp))


def shot_rear(spp):
    tgt = [0, 32, 8.5]
    shapes = tag_shapes("signature", rot_y(180 - 26))
    shapes["floor"] = floor(0.0)
    render("02-hero-rear-solar-sensors", shapes,
           camera(orbit(14, 14, 330, tgt), tgt, fov=22, w=2000, h=1500, spp=spp))


def shot_views(spp):
    """Orthographic catalogue views on transparent background (for the comparison sheet)."""
    # The tag turns to face a fixed front camera, so every side gets the same key light
    # (an orbiting camera left the back and one side in the studio's shadow).
    cy = tag.H / 2
    front_cam = ([0, cy, 300], [0, cy, 0], (0, 1, 0))
    views = {
        "front": (front_cam, Tf()),
        "rear": (front_cam, rot_y(180)),
        "left": (front_cam, rot_y(90)),  # the tag's -X side
        "right": (front_cam, rot_y(-90)),  # the tag's +X side
        "top": (([0, 300, 8], [0, 0, 8], (0, 0, -1)), Tf()),
        "bottom": (([0, -300, 8], [0, 0, 8], (0, 0, 1)), Tf()),
    }
    for k, ((o, t, up), tw) in views.items():
        cam = camera(o, t, w=1000, h=1200, spp=spp, ortho_scale=40, up=up)
        render(f"view-{k}", tag_shapes("signature", tw), cam, hide_env=True, bg=None, env_strength=1.4)


def shot_exploded(spp):
    z = {"yoke": -34, "ppg_window": -46, "screws": -60, "housing": -12, "electronics": 0, "lock_ring": 22,
         "gasket": 14, "inserts": 26, "cover": 40, "logo_inlay": 56, "pin_cap": 66}
    ex = {k: (0, 0.22 * v, v) for k, v in z.items()}
    ex["usb_plug"] = (0, -24, -12)
    shapes = tag_shapes("signature", Tf(), explode=ex, with_electronics=True,
                        parts=PARTS + ("lock_ring", "gasket"))
    shapes["button"] = male_button(Tf().translate([PIN[0], PIN[1] - 0.22 * 80, -80]))
    shapes["floor"] = floor(-34.0)
    tgt = [0, 30, 0]
    render("03-exploded-view", shapes, camera(orbit(-52, 16, 610, tgt), tgt, fov=22, w=2400, h=1500, spp=spp))


def shot_internal(spp):
    """Cover removed: the internal layout seen from the front."""
    shapes = tag_shapes("signature", rot_y(12), with_electronics=True,
                        parts=("housing", "ppg_window", "lock_ring", "pin_cap", "yoke", "usb_plug"), solar=False)
    shapes["floor"] = floor(0.0)
    tgt = [0, 31, 6]
    render("04-internal-layout", shapes, camera(orbit(-12, 32, 300, tgt), tgt, fov=22, w=2000, h=1500, spp=spp))


def shot_colorways(spp):
    shapes = {}
    for cw, x, a in (("mint", -62, 14), ("signature", 0, 0), ("stealth", 62, -14)):
        tw = Tf().translate([x, 0, -abs(x) * 0.25]) @ rot_y(a)
        shapes.update(tag_shapes(cw, tw, prefix=f"{cw}_"))
    shapes["floor"] = floor(0.0)
    tgt = [0, 31, -8]
    render("05-colorways", shapes, camera(orbit(0, 12, 420, tgt), tgt, fov=30, w=2400, h=1300, spp=spp))


def shot_profile(spp):
    """Low three-quarter rear view: the proud TPU yoke, the neck step and the solar window."""
    tgt = [-7, 34, 8]
    shapes = tag_shapes("signature", rot_y(180 - 58))
    shapes["floor"] = floor(0.0)
    render("06-profile-yoke-detail", shapes, camera(orbit(10, 16, 300, tgt), tgt, fov=22, w=2000, h=1500, spp=spp))


def ear_mesh(lower_edge_y: float, x_pin: float) -> Path:
    """Stylised cattle ear (~190 x 110 mm), its lower margin `lower_edge_y` below the pin."""
    from shapely.geometry import Polygon as SPoly

    t = np.linspace(0, 2 * np.pi, 200, endpoint=False)
    ex_ = 95 * (1 - np.cos(t))
    ey_ = 56 * np.sin(t) * (1 - 0.62 * (ex_ / 190) ** 2.2) * (0.75 + 0.25 * np.sin(t / 2))
    poly = SPoly(np.column_stack([ex_, ey_])).buffer(0)
    xs = 88.0  # the pin sits ~88 mm out from the head, in the middle third
    lo = min(y for x, y in poly.exterior.coords if abs(x - xs) < 3)
    ear = trimesh.creation.extrude_polygon(poly, EAR_T)
    ear.apply_translation((x_pin - xs, lower_edge_y - lo, -tag.YOKE_T - EAR_T))
    ear = ear.subdivide()
    base.CACHE.mkdir(exist_ok=True)
    path = base.CACHE / "ear_classic.stl"
    ear.export(path)
    return path


def shot_mounted(spp):
    """Hung like any dangle tag: pin ~22 mm above the lower ear margin, body below the ear."""
    shapes = tag_shapes("signature", Tf())
    ear = ear_mesh(PIN[1] - 22.0, PIN[0])
    shapes["ear"] = {"type": "ply", "filename": ply(ear, 40), "bsdf": plastic("#D7AE9C", 0.8, 0.3)}
    shapes["button"] = male_button(Tf().translate([PIN[0], PIN[1], BUTTON_Z]))
    shapes["floor"] = floor(-34.0)
    tgt = [16, 54, 0]
    render("07-mounted-on-ear", shapes, camera(orbit(-32, 16, 480, tgt), tgt, fov=30, w=2000, h=1500, spp=spp))


def shot_lineup(spp):
    """Both Terrava ear tags side by side (written to ../../images)."""
    shapes = {}
    tw = Tf().translate([29, 0, 0]) @ rot_y(-16)
    shapes.update(tag_shapes("signature", tw, prefix="classic_"))
    shield_meshes = SHIELD / "models" / "render-meshes"
    sh_bs = base.part_bsdfs(base.COLORWAYS["signature"])
    cache, base.CACHE = base.CACHE, base.CACHE / "shield"
    try:
        sw = Tf().translate([-29, 0, 0]) @ Tf().translate([0, 0, 7]) @ Tf().rotate([0, 1, 0], 16) @ Tf().translate(
            [0, 0, -7])
        for key in ("base", "cover", "logo_inlay", "pin_cap", "usb_plug", "ppg_window"):
            shapes[f"shield_{key}"] = {"type": "ply", "filename": base.ply(shield_meshes / f"{key}.stl"),
                                       "to_world": sw, "bsdf": sh_bs[key]}
    finally:
        base.CACHE = cache
    shapes["floor"] = floor(0.0)
    tgt = [0, 33, 4]
    out, base.OUT = base.OUT, LINEUP_OUT
    try:
        # wide banner framing: fills the family poster's card edge to edge
        render("terrava-ear-tag-lineup", shapes, camera(orbit(0, 10, 500, tgt), tgt, fov=40, w=3000, h=880, spp=spp))
    finally:
        base.OUT = out


SHOTS = {"hero": shot_hero, "rear": shot_rear, "views": shot_views, "exploded": shot_exploded,
         "internal": shot_internal, "colorways": shot_colorways, "profile": shot_profile, "mounted": shot_mounted,
         "lineup": shot_lineup}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("shots", nargs="*", default=[s for s in SHOTS if s != "lineup"])
    ap.add_argument("--spp", type=int, default=128)
    ap.add_argument("--scale", type=float, default=0.9, help="resolution multiplier for previews")
    args = ap.parse_args()
    base.SCALE = args.scale
    for s in args.shots:
        SHOTS[s](args.spp)


if __name__ == "__main__":
    main()
