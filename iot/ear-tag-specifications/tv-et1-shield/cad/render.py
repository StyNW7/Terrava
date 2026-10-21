"""Photoreal product renders of the Terrava ear tag (Mitsuba 3 path tracer).

Reads the meshes written by terrava_ear_tag.py (models/render-meshes) and
writes PNGs into ../images/renders.

    python render.py              # all shots, final quality
    python render.py --spp 32 hero rear   # quick preview of selected shots
"""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path

import mitsuba as mi
import numpy as np
import trimesh

mi.set_variant("scalar_rgb")
from mitsuba import ScalarTransform4f as Tf  # noqa: E402

HERE = Path(__file__).resolve().parent
MESHES = HERE.parent / "models" / "render-meshes"
OUT = HERE.parent / "images" / "renders"
CACHE = HERE / ".render-cache"

T = 14.0
PIN = (0.0, 55.4)
SPLIT = 6.0


def srgb(hex_or_rgb) -> list[float]:
    if isinstance(hex_or_rgb, str):
        h = hex_or_rgb.lstrip("#")
        c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    else:
        c = list(hex_or_rgb)
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]


# --- materials ----------------------------------------------------------------
def plastic(hex_color, rough=0.42, spec=0.5, clearcoat=0.0):
    return {"type": "principled", "base_color": {"type": "rgb", "value": srgb(hex_color)},
            "roughness": rough, "specular": spec, "clearcoat": clearcoat, "clearcoat_gloss": 0.6}


def metal(hex_color, rough=0.25):
    return {"type": "principled", "base_color": {"type": "rgb", "value": srgb(hex_color)},
            "metallic": 1.0, "roughness": rough}


IVORY = "#EEECE6"
GREEN = "#0B6B3E"
GRAPHITE = "#2C3133"
YELLOW = "#F2C230"

COLORWAYS = {
    "signature": {"cover": IVORY, "base": GREEN, "logo": GREEN, "cap": GREEN, "plug": IVORY},
    "field": {"cover": YELLOW, "base": GRAPHITE, "logo": GRAPHITE, "cap": GRAPHITE, "plug": GRAPHITE},
    "stealth": {"cover": GRAPHITE, "base": GRAPHITE, "logo": "#3FB27A", "cap": "#3FB27A", "plug": GRAPHITE},
    "white": {"cover": IVORY, "base": IVORY, "logo": GREEN, "cap": GREEN, "plug": IVORY},
}


def part_bsdfs(cw: dict) -> dict:
    return {
        "cover": plastic(cw["cover"], 0.40),
        "base": plastic(cw["base"], 0.45),
        "logo_inlay": plastic(cw["logo"], 0.40),
        "pin_cap": plastic(cw["cap"], 0.55, 0.4),
        "lock_ring": plastic("#1E2224", 0.6),
        "gasket": plastic("#1E2224", 0.6),
        "usb_plug": plastic(cw["plug"], 0.6, 0.4),
        "ppg_window": {"type": "principled", "base_color": {"type": "rgb", "value": srgb("#0B0E12")},
                       "roughness": 0.06, "specular": 0.8},
    }


# --- meshes ---------------------------------------------------------------------
def ply(stl: Path, crease_deg: float = 32.0) -> str:
    """STL -> smooth-shaded PLY (normals split at creases), cached."""
    CACHE.mkdir(exist_ok=True)
    out = CACHE / (stl.stem + ".ply")
    if not out.exists() or out.stat().st_mtime < stl.stat().st_mtime:
        m = trimesh.load(stl, force="mesh")
        m.merge_vertices()
        m = trimesh.graph.smooth_shade(m, angle=math.radians(crease_deg))
        m.export(out, file_type="ply", vertex_normal=True, encoding="binary")
    return str(out)


def male_button_stl() -> Path:
    """Generic two-piece cattle tag male button (context only, not printed)."""
    out = CACHE / "male_button.stl"
    if not out.exists():
        CACHE.mkdir(exist_ok=True)
        head = trimesh.creation.cylinder(radius=14.0, height=1.6, sections=96)
        head.apply_translation((0, 0, -0.8))
        hub = trimesh.creation.cylinder(radius=4.0, height=3.0, sections=64)
        hub.apply_translation((0, 0, 1.5))
        stem = trimesh.creation.cylinder(radius=1.75, height=15.0, sections=48)
        stem.apply_translation((0, 0, 7.5))
        tip = trimesh.creation.cone(radius=3.2, height=5.0, sections=48)
        tip.apply_translation((0, 0, 14.5))
        m = trimesh.util.concatenate([head, hub, stem, tip])
        m.export(out)
    return out


def solar_cell_obj() -> str:
    """Textured quad for the solar edition PV cell (31.6 x 16.6 mm)."""
    from PIL import Image, ImageDraw

    CACHE.mkdir(exist_ok=True)
    tex = CACHE / "solar.png"
    if not tex.exists():
        w, h = 1264, 664
        img = Image.new("RGB", (w, h), (14, 20, 36))
        d = ImageDraw.Draw(img)
        for i in range(1, 6):  # cell segments
            x = int(i * w / 6)
            d.line([(x, 0), (x, h)], fill=(40, 48, 66), width=6)
        for y in range(18, h, 36):  # fingers
            d.line([(0, y), (w, y)], fill=(70, 78, 92), width=2)
        for x in (int(w * 0.33), int(w * 0.66)):  # bus bars
            d.line([(x, 0), (x, h)], fill=(150, 156, 166), width=10)
        img.save(tex)
    obj = CACHE / "solar.obj"
    w, h, cy, z = 31.6, 16.6, 15.0, T - 0.35
    obj.write_text(
        "\n".join([
            f"v {-w / 2} {cy - h / 2} {z}", f"v {w / 2} {cy - h / 2} {z}",
            f"v {w / 2} {cy + h / 2} {z}", f"v {-w / 2} {cy + h / 2} {z}",
            "vt 0 0", "vt 1 0", "vt 1 1", "vt 0 1", "vn 0 0 1",
            "f 1/1/1 2/2/1 3/3/1", "f 1/1/1 3/3/1 4/4/1",
        ]) + "\n")
    return str(obj), str(tex)


# --- environment ------------------------------------------------------------------
KEY_AZ = 215


def studio_env(path: Path, strength: float = 1.0) -> str:
    """Procedural studio HDRI: soft grey dome with three large softboxes."""
    if path.exists():
        return str(path)
    w, h = 1024, 512
    u = (np.arange(w) + 0.5) / w
    v = (np.arange(h) + 0.5) / h
    phi, theta = np.meshgrid(u * 2 * np.pi, v * np.pi)
    elev = np.pi / 2 - theta  # +90 top, -90 bottom
    base = 0.06 + 0.10 * np.clip(np.sin(elev), 0, 1)
    img = np.repeat(base[..., None], 3, axis=2).astype(np.float32)

    def softbox(az_deg, el_deg, w_deg, h_deg, power, tint=(1, 1, 1)):
        az, el = np.radians(az_deg), np.radians(el_deg)
        dphi = np.angle(np.exp(1j * (phi - az)))
        dx = np.abs(dphi) / np.radians(w_deg / 2)
        dy = np.abs(elev - el) / np.radians(h_deg / 2)
        m = np.clip(1.0 - np.maximum(dx, dy) ** 8, 0, 1)
        for k in range(3):
            img[..., k] += power * m * tint[k]

    # Mitsuba envmap: u = 0.5 is -Z direction... azimuths tuned by eye.
    softbox(KEY_AZ, 38, 40, 30, 14.0, (1.0, 0.97, 0.93))  # key, front-left high
    softbox(KEY_AZ - 95, 12, 26, 36, 3.0, (0.93, 0.97, 1.0))  # fill, front-right
    softbox(KEY_AZ + 170, 50, 80, 16, 6.0)  # rim / top-back strip
    softbox(KEY_AZ + 85, 8, 16, 46, 2.5)  # side kicker
    img *= strength
    mi.Bitmap(img).write(str(path))
    return str(path)


# --- scene assembly -----------------------------------------------------------------
def tag_shapes(cw_name: str = "signature", to_world: Tf = Tf(), explode: dict | None = None,
               solar: bool = False, with_electronics: bool = False, parts: tuple | None = None,
               prefix: str = "") -> dict:
    cw = COLORWAYS[cw_name]
    bs = part_bsdfs(cw)
    explode = explode or {}
    shapes = {}
    keys = parts or ("base", "cover", "logo_inlay", "pin_cap", "usb_plug", "ppg_window")
    for key in keys:
        fname = f"solar_{key}" if solar and key in ("cover", "logo_inlay") else key
        off = explode.get(key, (0, 0, 0))
        shapes[f"{prefix}{key}"] = {"type": "ply", "filename": ply(MESHES / f"{fname}.stl"),
                                    "to_world": to_world @ Tf().translate(list(off)), "bsdf": bs[key]}
    if solar and "cover" in keys:
        obj, tex = solar_cell_obj()
        off = explode.get("cover", (0, 0, 0))
        shapes[f"{prefix}solar"] = {
            "type": "obj", "filename": obj, "to_world": to_world @ Tf().translate(list(off)),
            "bsdf": {"type": "principled", "base_color": {"type": "bitmap", "filename": tex},
                     "roughness": 0.08, "specular": 0.7, "clearcoat": 1.0, "clearcoat_gloss": 0.95}}
    if with_electronics:
        meta = json.loads((MESHES / "components.json").read_text())
        off = explode.get("electronics", (0, 0, 0))
        for i, comp in enumerate(meta):
            name = comp["name"]
            col = comp["color"]
            if "screw" in name:
                bsdf, o = metal("#C9CDD2", 0.18), explode.get("screws", off)
            elif "insert" in name:
                bsdf, o = metal("#C9A25A", 0.25), explode.get("inserts", off)
            elif name.startswith("LiPo") or "shield" in name or "USB-C" in name or "MLX" in name:
                bsdf, o = metal("#{:02X}{:02X}{:02X}".format(*[int(c * 255) for c in col]), 0.3), off
            else:
                bsdf, o = plastic("#{:02X}{:02X}{:02X}".format(*[int(c * 255) for c in col]), 0.35, 0.5), off
            shapes[f"{prefix}comp{i}"] = {"type": "ply", "filename": ply(MESHES / comp["file"], 20),
                                          "to_world": to_world @ Tf().translate(list(o)), "bsdf": bsdf}
    return shapes


SCALE = 0.9


def camera(origin, target, fov=24.0, w=1600, h=1200, spp=256, ortho_scale=None, up=(0, 1, 0)):
    w, h = int(w * SCALE), int(h * SCALE)
    film = {"type": "hdrfilm", "width": w, "height": h, "rfilter": {"type": "gaussian"},
            "pixel_format": "rgba"}
    sampler = {"type": "independent", "sample_count": spp}
    if ortho_scale:
        # uniform scale: Mitsuba already widens the orthographic view by the film aspect
        return {"type": "orthographic",
                "to_world": Tf().look_at(origin=origin, target=target, up=up) @ Tf().scale(
                    [ortho_scale, ortho_scale, 1]),
                "film": film, "sampler": sampler}
    return {"type": "perspective", "fov": fov, "fov_axis": "x",
            "to_world": Tf().look_at(origin=origin, target=target, up=up), "film": film, "sampler": sampler}


def floor(y=0.0, color="#E7E8E6", rough=0.9):
    return {"type": "rectangle", "to_world": Tf().translate([0, y, 0]) @ Tf().rotate([1, 0, 0], -90) @ Tf().scale(
        [3000, 3000, 1]), "bsdf": plastic(color, rough, 0.2)}


def render(name: str, shapes: dict, sensor: dict, env_strength=1.0, hide_env=False, bg=(255, 255, 255, 255),
           exposure=1.0) -> None:
    scene = {"type": "scene",
             "integrator": {"type": "path", "max_depth": 10, "hide_emitters": hide_env},
             "sensor": sensor,
             "env": {"type": "envmap", "filename": studio_env(CACHE / "studio.exr"), "scale": env_strength}}
    scene.update(shapes)
    # accumulate in 32-spp passes with different seeds (same estimate, far less film overhead)
    total = sensor["sampler"]["sample_count"]
    loaded = mi.load_dict(scene)
    passes = max(1, math.ceil(total / 32))
    arr = None
    for i in range(passes):
        img = np.array(mi.render(loaded, seed=i, spp=min(32, total)))
        arr = img if arr is None else arr + img
    arr /= passes
    rgb = np.clip(arr[..., :3] * exposure, 0, None)
    # gentle filmic shoulder, then sRGB
    rgb = rgb / (1 + 0.12 * rgb)
    rgb = np.where(rgb <= 0.0031308, 12.92 * rgb, 1.055 * np.power(rgb, 1 / 2.4) - 0.055)
    alpha = arr[..., 3:4] if arr.shape[-1] == 4 else np.ones_like(rgb[..., :1])
    from PIL import Image

    out = np.concatenate([np.clip(rgb, 0, 1), np.clip(alpha, 0, 1)], axis=-1)
    im = Image.fromarray((out * 255 + 0.5).astype(np.uint8), "RGBA")
    OUT.mkdir(parents=True, exist_ok=True)
    if bg is None:  # keep transparency (catalogue views)
        im.save(OUT / f"{name}.png", optimize=True)
    else:
        canvas = Image.new("RGBA", im.size, bg)
        canvas.alpha_composite(im)
        canvas.convert("RGB").save(OUT / f"{name}.png", optimize=True)
    print("wrote", OUT / f"{name}.png")


# --- shots --------------------------------------------------------------------------
def orbit(az, el, dist, target):
    """Camera position: az from +Z (front) towards +X, el above the horizon (degrees)."""
    a, e = math.radians(az), math.radians(el)
    return [target[0] + dist * math.sin(a) * math.cos(e), target[1] + dist * math.sin(e),
            target[2] + dist * math.cos(a) * math.cos(e)]


def rot_y(deg, about=(0, 0, T / 2)):
    return Tf().translate(list(about)) @ Tf().rotate([0, 1, 0], deg) @ Tf().translate([-a for a in about])


def shot_hero(spp):
    tgt = [0, 33, 7]
    shapes = tag_shapes("signature", rot_y(24))
    shapes["floor"] = floor(0.0)
    render("01-hero-front", shapes, camera(orbit(-14, 13, 330, tgt), tgt, fov=22, w=2000, h=1500, spp=spp))


def shot_rear(spp):
    tgt = [0, 33, 7]
    shapes = tag_shapes("signature", rot_y(180 - 26))
    shapes["floor"] = floor(0.0)
    render("02-hero-rear-sensors", shapes, camera(orbit(14, 14, 330, tgt), tgt, fov=22, w=2000, h=1500, spp=spp))


def shot_views(spp):
    """Orthographic catalogue views on transparent background.

    The tag turns to face a fixed front camera, so every side gets the same key light.
    """
    front_cam = ([0, 34, 300], [0, 34, 0], (0, 1, 0))
    views = {
        "front": (front_cam, Tf()),
        "rear": (front_cam, rot_y(180)),
        "left": (front_cam, rot_y(90)),  # the tag's -X side
        "right": (front_cam, rot_y(-90)),  # the tag's +X side
        "top": (([0, 300, 7], [0, 0, 7], (0, 0, -1)), Tf()),
        "bottom": (([0, -300, 7], [0, 0, 7], (0, 0, 1)), Tf()),
    }
    for k, ((o, t, up), tw) in views.items():
        cam = camera(o, t, w=1000, h=1200, spp=spp, ortho_scale=40, up=up)
        render(f"view-{k}", tag_shapes("signature", tw), cam, hide_env=True, bg=None, env_strength=1.4)


def shot_exploded(spp):
    z = {"base": -26, "screws": -52, "ppg_window": -38, "electronics": 0, "inserts": 22, "lock_ring": 26,
         "gasket": 15, "cover": 44, "logo_inlay": 62, "pin_cap": 72}
    ex = {k: (0, 0.22 * v, v) for k, v in z.items()}  # cascade: each layer also steps up a little
    ex["usb_plug"] = (0, -22, 0)
    shapes = tag_shapes("signature", Tf(), explode=ex, with_electronics=True,
                        parts=("base", "cover", "logo_inlay", "pin_cap", "usb_plug", "ppg_window", "lock_ring",
                               "gasket"))
    shapes["button"] = {"type": "ply", "filename": ply(male_button_stl(), 40),
                        "to_world": Tf().translate([PIN[0], PIN[1] - 0.22 * 74, -74]), "bsdf": plastic(YELLOW, 0.5)}
    shapes["floor"] = floor(-34.0)
    tgt = [0, 32, 0]
    render("03-exploded-view", shapes, camera(orbit(-52, 16, 600, tgt), tgt, fov=22, w=2400, h=1500, spp=spp))


def shot_internal(spp):
    """Cover removed: the internal layout seen from the front."""
    shapes = tag_shapes("signature", rot_y(12), with_electronics=True, parts=("base", "ppg_window", "lock_ring"))
    shapes["floor"] = floor(0.0)
    tgt = [0, 32, 5]
    render("04-internal-layout", shapes, camera(orbit(-12, 32, 300, tgt), tgt, fov=22, w=2000, h=1500, spp=spp))


def shot_colorways(spp):
    shapes = {}
    for cw, x, a in (("field", -64, 14), ("signature", 0, 0), ("stealth", 64, -14)):
        tw = Tf().translate([x, 0, -abs(x) * 0.25]) @ rot_y(a)
        shapes.update(tag_shapes(cw, tw, prefix=f"{cw}_"))
    shapes["floor"] = floor(0.0)
    tgt = [0, 32, -8]
    render("05-colorways", shapes, camera(orbit(0, 12, 420, tgt), tgt, fov=30, w=2400, h=1300, spp=spp))


def shot_solar(spp):
    tgt = [0, 33, 7]
    shapes = tag_shapes("signature", rot_y(-24), solar=True)
    shapes["floor"] = floor(0.0)
    render("06-solar-edition", shapes, camera(orbit(14, 13, 330, tgt), tgt, fov=22, w=2000, h=1500, spp=spp))


def shot_mounted(spp):
    """The tag clamped by a standard male button through a (stylised) ear."""
    shapes = tag_shapes("signature", Tf())
    # cattle ear (~190 x 110 mm, 4.5 mm thick) seen from the inside, pin in the middle third
    from shapely.geometry import Polygon as SPoly

    t = np.linspace(0, 2 * np.pi, 160, endpoint=False)
    ex_ = 95 * (1 - np.cos(t))
    ey_ = 56 * np.sin(t) * (1 - 0.62 * (ex_ / 190) ** 2.2) * (0.75 + 0.25 * np.sin(t / 2))
    ear = trimesh.creation.extrude_polygon(SPoly(np.column_stack([ex_, ey_])).buffer(0), 4.5)
    ear.apply_translation((PIN[0] - 88, PIN[1] - 4, -4.7))
    ear = ear.subdivide()
    CACHE.mkdir(exist_ok=True)
    ear_path = CACHE / "ear.stl"
    ear.export(ear_path)
    shapes["ear"] = {"type": "ply", "filename": ply(ear_path, 40), "bsdf": plastic("#D7AE9C", 0.8, 0.3)}
    shapes["button"] = {"type": "ply", "filename": ply(male_button_stl(), 40),
                        "to_world": Tf().translate([PIN[0], PIN[1], -6.0]), "bsdf": plastic(YELLOW, 0.5)}
    shapes["floor"] = floor(-30.0)
    tgt = [10, 42, 0]
    render("07-mounted-on-ear", shapes, camera(orbit(-38, 22, 420, tgt), tgt, fov=30, w=2000, h=1500, spp=spp))


SHOTS = {"hero": shot_hero, "rear": shot_rear, "views": shot_views, "exploded": shot_exploded,
         "internal": shot_internal, "colorways": shot_colorways, "solar": shot_solar, "mounted": shot_mounted}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("shots", nargs="*", default=list(SHOTS))
    ap.add_argument("--spp", type=int, default=128)
    ap.add_argument("--scale", type=float, default=0.9, help="resolution multiplier for previews")
    args = ap.parse_args()
    global SCALE
    SCALE = args.scale
    for s in args.shots:
        SHOTS[s](args.spp)


if __name__ == "__main__":
    main()
