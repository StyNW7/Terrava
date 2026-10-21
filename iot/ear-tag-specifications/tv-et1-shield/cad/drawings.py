"""Technical drawing sheets for the Terrava ear tag (matplotlib, A3 landscape).

Geometry comes from the same parameters and meshes as the CAD model, so the
drawings stay true to the STL/STEP files. Run after terrava_ear_tag.py.

    python drawings.py
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import trimesh  # noqa: E402
from matplotlib import font_manager  # noqa: E402
from matplotlib.patches import Circle, FancyBboxPatch, Polygon as MplPolygon, Rectangle  # noqa: E402
from shapely.geometry import Polygon  # noqa: E402
from shapely.ops import unary_union  # noqa: E402

import terrava_ear_tag as tag  # noqa: E402

HERE = Path(__file__).resolve().parent
MESHES = HERE.parent / "models" / "render-meshes"
OUT = HERE.parent / "images" / "drawings"
LOGO_PNG = next(p for p in HERE.parents if (p / "images" / "logo.png").exists()) / "images" / "logo.png"

for f in (tag.FONT_BOLD, tag.FONT_XBOLD, HERE / "fonts" / "PlusJakartaSans-Medium.ttf"):
    if f.exists():
        font_manager.fontManager.addfont(str(f))
plt.rcParams["font.family"] = "Plus Jakarta Sans"

INK = "#1D2822"
DIM = "#47584E"
HID = "#8A978F"
GREEN = "#0B6B3E"
GREEN_L = "#DCEBE2"
PAPER = "#FFFFFF"
FILL = "#F3F5F2"
CW, CH = 0.55, 0.35  # line weights (pt): visible, thin

A3 = (16.54, 11.69)
MODEL = "TV-ET1"  # shown in the title block; the Classic's drawings reuse this module


# ---------------------------------------------------------------------------
# geometry helpers
# ---------------------------------------------------------------------------
def outline_pts(d=0.0, n=40):
    """Tag outline inset by d as an (N, 2) array (same construction as the CAD)."""
    rb, rt = tag.R_BOT - d, tag.R_TOP - d
    xb, yb = tag.W / 2 - tag.R_BOT, tag.R_BOT
    xt, yt = tag.W / 2 - tag.R_TOP, tag.H - tag.R_TOP
    pts = []

    def arc(cx, cy, r, a0, a1):
        for a in np.linspace(math.radians(a0), math.radians(a1), n):
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))

    arc(xb, yb, rb, -90, 0)
    arc(xt, yt, rt, 0, 90)
    arc(-xt, yt, rt, 90, 180)
    arc(-xb, yb, rb, 180, 270)
    return np.array(pts)


def load(name):
    return trimesh.load(MESHES / name, force="mesh")


def section_polys(mesh, origin, normal, axes):
    """Planar section of a mesh -> shapely polygons in the chosen 2 world axes."""
    sec = mesh.section(plane_origin=origin, plane_normal=normal)
    if sec is None:
        return []
    rings = []
    for loop in sec.discrete:
        if len(loop) < 3:
            continue
        p = Polygon(loop[:, axes]).buffer(0)
        if p.area > 1e-4:
            rings.append(p)
    rings.sort(key=lambda p: p.area, reverse=True)
    geom = None
    for i, r in enumerate(rings):
        depth = sum(1 for j in range(i) if rings[j].contains(r.representative_point()))
        geom = r if geom is None else (geom.union(r) if depth % 2 == 0 else geom.difference(r))
    return tag.explode(geom) if geom is not None else []


def draw_poly(ax, p: Polygon, ox=0, oy=0, sx=1, s=1.0, fc="none", ec=INK, lw=CW, hatch=None, z=2, ls="-"):
    def tr(c):
        c = np.asarray(c)
        return np.column_stack([ox + sx * c[:, 0] * s, oy + c[:, 1] * s])

    if fc != "none" or hatch:
        # draw holes by even-odd path
        from matplotlib.path import Path as MPath
        from matplotlib.patches import PathPatch

        verts, codes = [], []
        for ring in [p.exterior, *p.interiors]:
            c = tr(ring.coords)
            verts.extend(c.tolist())
            codes.extend([MPath.MOVETO] + [MPath.LINETO] * (len(c) - 2) + [MPath.CLOSEPOLY])
        patch = PathPatch(MPath(verts, codes), fc=fc, ec=ec, lw=lw, hatch=hatch, zorder=z, ls=ls)
        ax.add_patch(patch)
    else:
        for ring in [p.exterior, *p.interiors]:
            c = tr(ring.coords)
            ax.plot(c[:, 0], c[:, 1], color=ec, lw=lw, zorder=z, ls=ls, solid_joinstyle="round")


def line(ax, pts, color=INK, lw=CW, ls="-", z=3):
    pts = np.asarray(pts)
    ax.plot(pts[:, 0], pts[:, 1], color=color, lw=lw, ls=ls, zorder=z, solid_capstyle="round")


# ---------------------------------------------------------------------------
# dimensioning
# ---------------------------------------------------------------------------
ARROW = dict(arrowstyle="<|-|>,head_length=0.35,head_width=0.12", color=DIM, lw=CH, shrinkA=0, shrinkB=0)


def dim_h(ax, x1, x2, y, text, y_from=None, fs=7.2, above=True):
    if y_from is not None:
        for x in (x1, x2):
            line(ax, [(x, y_from), (x, y + (1.2 if y > y_from else -1.2))], DIM, CH)
    ax.annotate("", (x1, y), (x2, y), arrowprops=ARROW, zorder=4)
    ax.text((x1 + x2) / 2, y + (0.9 if above else -0.9), text, ha="center", va="bottom" if above else "top",
            fontsize=fs, color=INK, zorder=5)


def dim_v(ax, y1, y2, x, text, x_from=None, fs=7.2, left=True):
    if x_from is not None:
        for y in (y1, y2):
            line(ax, [(x_from, y), (x + (-1.2 if x < x_from else 1.2), y)], DIM, CH)
    ax.annotate("", (x, y1), (x, y2), arrowprops=ARROW, zorder=4)
    ax.text(x + (-0.9 if left else 0.9), (y1 + y2) / 2, text, ha="right" if left else "left", va="center",
            fontsize=fs, color=INK, rotation=90, zorder=5)


def leader(ax, xy, xytext, text, fs=7.0, ha="left"):
    ax.annotate(text, xy=xy, xytext=xytext, fontsize=fs, color=INK, ha=ha, va="center",
                arrowprops=dict(arrowstyle="-|>,head_length=0.35,head_width=0.12", color=DIM, lw=CH,
                                shrinkA=1, shrinkB=0), zorder=6)


def centre_mark(ax, x, y, r):
    line(ax, [(x - r, y), (x + r, y)], HID, CH, (0, (6, 2, 1, 2)))
    line(ax, [(x, y - r), (x, y + r)], HID, CH, (0, (6, 2, 1, 2)))


def view_title(ax, x, y, title, sub=None):
    ax.text(x, y, title, ha="center", va="top", fontsize=9.5, fontweight="bold", color=INK)
    if sub:
        ax.text(x, y - 3.6, sub, ha="center", va="top", fontsize=7, color=DIM)


# ---------------------------------------------------------------------------
# sheet frame
# ---------------------------------------------------------------------------
def new_sheet(xlim, ylim):
    fig = plt.figure(figsize=A3, dpi=200, facecolor=PAPER)
    ax = fig.add_axes([0.035, 0.12, 0.93, 0.83])
    ax.set_xlim(*xlim)
    ax.set_ylim(*ylim)
    ax.set_aspect("equal")
    ax.axis("off")
    # border
    fig.add_artist(Rectangle((0.012, 0.015), 0.976, 0.97, transform=fig.transFigure, fill=False, ec=INK, lw=1.0))
    return fig, ax


def title_block(fig, title, sheet, scale_note, notes=()):
    from PIL import Image

    y0 = 0.025
    fig.add_artist(Rectangle((0.012, 0.015), 0.976, 0.085, transform=fig.transFigure, fill=True, fc=FILL,
                             ec=INK, lw=1.0, zorder=0))
    try:
        logo = Image.open(LOGO_PNG).convert("RGBA")
        lax = fig.add_axes([0.02, y0 - 0.002, 0.05, 0.07])
        lax.imshow(logo)
        lax.axis("off")
    except Exception:
        pass
    fig.text(0.072, y0 + 0.046, "Terrava", fontsize=20, fontweight="bold", color=GREEN, va="center")
    fig.text(0.072, y0 + 0.016, f"SMART EAR TAG  ·  {MODEL}", fontsize=9, color=INK, va="center", fontweight="bold")
    fig.text(0.24, y0 + 0.046, title, fontsize=15, fontweight="bold", color=INK, va="center")
    fig.text(0.24, y0 + 0.016, "  ·  ".join(notes) if notes else "", fontsize=8, color=DIM, va="center")
    cells = [("UNITS", "mm"), ("SCALE", scale_note), ("TOLERANCE", "±0.2 unless noted"), ("REV", "A"),
             ("DATE", "2026-10-21"), ("SHEET", sheet)]
    x = 0.655
    for k, v in cells:
        fig.text(x, y0 + 0.052, k, fontsize=6.5, color=DIM, fontweight="bold")
        fig.text(x, y0 + 0.022, v, fontsize=9, color=INK, fontweight="bold")
        x += 0.055 if k not in ("TOLERANCE",) else 0.085


# ---------------------------------------------------------------------------
# sheet 1: general arrangement
# ---------------------------------------------------------------------------
def sheet_general():
    fig, ax = new_sheet((-40, 240), (-60, 86))
    outer = outline_pts(0)
    T, H, W = tag.T, tag.H, tag.W
    px, py = tag.PIN

    # ---------------- FRONT VIEW (origin) ----------------
    draw_poly(ax, Polygon(outer), fc=PAPER, lw=0.9)
    draw_poly(ax, Polygon(outline_pts(tag.CH_FRONT)), lw=CH)
    draw_poly(ax, Polygon(outline_pts(tag.WALL)), ec=HID, lw=CH, ls=(0, (4, 2)))
    for p in tag.front_graphics(False):
        draw_poly(ax, p, fc=GREEN, ec=GREEN, lw=0.2)
    ax.add_patch(Circle((px, py), tag.CAP_D / 2, fc=GREEN_L, ec=INK, lw=CW, zorder=3))
    ax.add_patch(Circle((px, py), 3.0, fc="none", ec=DIM, lw=CH, zorder=3))
    ax.add_patch(Circle(tag.LED_AT, 1.6, fc="none", ec=HID, lw=CH, ls=(0, (3, 1.5)), zorder=3))
    centre_mark(ax, px, py, 8)
    line(ax, [(0, -2), (0, 70)], HID, CH, (0, (8, 2, 1, 2)), z=1)
    dim_h(ax, -W / 2, W / 2, -8, "46.0", y_from=8)
    dim_v(ax, 0, H, -31, "68.0", x_from=-18)
    dim_v(ax, 0, py, 30, "55.4", x_from=6, left=False)
    leader(ax, (px + 3.9, py + 3.9), (14, 76), "Ø11.0 pin cap (TPU, flush)")
    leader(ax, (-tag.W / 2 + 2.9, 2.9), (-38, -3), "R10", ha="left")
    leader(ax, (-5 - 18 * 0.707, 50 + 18 * 0.707), (-36, 78), "R18", ha="left")
    leader(ax, tag.LED_AT, (32, -3), "status light\n(0.6 mm wall)", fs=6.5)
    leader(ax, (-6.2, 36), (-38, 44), "logo inlay\n0.8 deep, 2-colour", fs=6.5)
    view_title(ax, 0, -14, "FRONT", "outward face")

    # ---------------- RIGHT SIDE VIEW ----------------
    sx0 = 52
    prof = [(0, tag.CH_REAR), (tag.CH_REAR, 0), (T - tag.CH_FRONT, 0), (T, tag.CH_FRONT), (T, H - tag.CH_FRONT),
            (T - tag.CH_FRONT, H), (tag.CH_REAR, H), (0, H - tag.CH_REAR)]
    draw_poly(ax, Polygon([(sx0 + z, y) for z, y in prof]), fc=PAPER, lw=0.9)
    for z in (tag.CH_REAR, T - tag.CH_FRONT):
        line(ax, [(sx0 + z, 0), (sx0 + z, H)], INK, CH)
    line(ax, [(sx0 + tag.SPLIT, 0), (sx0 + tag.SPLIT, H)], INK, CW)
    # USB port + plug (hidden)
    ax.add_patch(FancyBboxPatch((sx0 + tag.USB_Z - 3.5 + 2, 0 + 0.0), 3.0, 2.0, boxstyle="round,pad=0,rounding_size=0.3",
                                fc="none", ec=HID, lw=CH, ls=(0, (3, 1.5))))
    dim_h(ax, sx0, sx0 + T, -8, "14.0", y_from=-1)
    dim_h(ax, sx0, sx0 + tag.SPLIT, H + 6, "6.0", y_from=H + 1)
    dim_h(ax, sx0 + tag.SPLIT, sx0 + T, H + 6, "8.0", y_from=H + 1)
    ax.text(sx0 - 1.5, 40, "EAR SIDE", rotation=90, fontsize=7, color=GREEN, fontweight="bold", ha="right", va="center")
    ax.text(sx0 + T + 1.5, 40, "FRONT", rotation=90, fontsize=7, color=GREEN, fontweight="bold", ha="left", va="center")
    leader(ax, (sx0 + tag.SPLIT, 30), (sx0 + 22, 24), "parting line\nlap joint + TPU gasket", fs=6.5)
    leader(ax, (sx0 + T - 0.6, H - 0.6), (sx0 + 22, 80), "45° × 1.2 chamfer", fs=6.5)
    leader(ax, (sx0 + 0.4, 0.4), (sx0 + 22, 8), "45° × 0.8 chamfer", fs=6.5)
    view_title(ax, sx0 + T / 2, -14, "SIDE", "rear shell 6.0 | front shell 8.0")

    # ---------------- REAR VIEW (mirrored) ----------------
    rx0 = 118

    def rp(poly):
        from shapely import affinity
        return affinity.translate(affinity.scale(poly, -1, 1, origin=(0, 0)), rx0, 0)

    draw_poly(ax, rp(Polygon(outer)), fc=PAPER, lw=0.9)
    draw_poly(ax, rp(Polygon(outline_pts(tag.CH_REAR))), lw=CH)
    for p in tag.rear_lettering():
        draw_poly(ax, rp(p), fc=DIM, ec=DIM, lw=0.1)
    mx, my = tag.MLX_AT
    ax.add_patch(Circle((rx0 - mx, my), 4.2, fc="#BFC4C6", ec=INK, lw=CW, zorder=3))
    ax.add_patch(Circle((rx0 - mx, my), 2.0, fc="#7D8589", ec="none", zorder=3))
    ax.add_patch(FancyBboxPatch((rx0 - tag.SENSOR_X - 4.5, my - 3.5), 9.0, 7.0,
                                boxstyle="round,pad=0,rounding_size=1.5", fc="#2B3136", ec=INK, lw=CW, zorder=3))
    ax.add_patch(Circle((rx0 - px, py), tag.PIN_BORE_D / 2 + 1.0, fc="none", ec=INK, lw=CH, zorder=3))
    ax.add_patch(Circle((rx0 - px, py), tag.PIN_BORE_D / 2, fc="#E9ECEA", ec=INK, lw=CW, zorder=3))
    for x, y in tag.SCREWS:
        ax.add_patch(Circle((rx0 - x, y), tag.CSK_D / 2, fc="none", ec=INK, lw=CW, zorder=3))
        ax.add_patch(Circle((rx0 - x, y), tag.SCREW_CLEAR_D / 2, fc="#E9ECEA", ec=INK, lw=CH, zorder=3))
    centre_mark(ax, rx0 - px, py, 7)
    dim_h(ax, rx0 - tag.SENSOR_X, rx0 + tag.SENSOR_X, H + 6, "23.6", y_from=py + 5)
    dim_h(ax, rx0 - 16.5, rx0 + 16.5, -8, "33.0", y_from=4)
    dim_h(ax, rx0 - 6, rx0 + 6, H + 13, "12.0", y_from=66)
    dim_v(ax, 0, 6.5, rx0 + 29, "6.5", x_from=rx0 + 19, left=False)
    dim_v(ax, 0, 63.5, rx0 + 36, "63.5", x_from=rx0 + 8, left=False)
    leader(ax, (rx0 - mx + 3.0, my - 3.0), (rx0 + 26, 44), "MLX90614 IR window Ø8.4", fs=6.5)
    leader(ax, (rx0 - tag.SENSOR_X - 3.0, my - 3.0), (rx0 - 38, 44), "PPG window 9.0 × 7.0\n(clear PC, flush)",
           fs=6.5, ha="left")
    leader(ax, (rx0 - px + 2.4, py - 2.4), (rx0 + 6, 36), "Ø7.2 pin bore, 1×45° lead-in", fs=6.5)
    leader(ax, (rx0 + 16.5 - 1.5, 6.5 + 1.5), (rx0 + 27, 14), "4× M2 csk\nØ4.2 × 90°", fs=6.5)
    view_title(ax, rx0, -14, "REAR", "ear-contact face")

    # ---------------- BOTTOM VIEW ----------------
    bx0, by0 = 0, -52
    bot = [(-W / 2 + tag.CH_REAR, 0), (W / 2 - tag.CH_REAR, 0), (W / 2, tag.CH_REAR), (W / 2, T - tag.CH_FRONT),
           (W / 2 - tag.CH_FRONT, T), (-W / 2 + tag.CH_FRONT, T), (-W / 2, T - tag.CH_FRONT), (-W / 2, tag.CH_REAR)]
    draw_poly(ax, Polygon([(bx0 + x, by0 + z) for x, z in bot]), fc=PAPER, lw=0.9)
    line(ax, [(bx0 - W / 2, by0 + tag.SPLIT), (bx0 + W / 2, by0 + tag.SPLIT)], INK, CW)
    ax.add_patch(FancyBboxPatch((bx0 - tag.PORT_W / 2, by0 + tag.USB_Z - tag.PORT_H / 2), tag.PORT_W, tag.PORT_H,
                                boxstyle=f"round,pad=0,rounding_size={tag.PORT_R}", fc="#E9ECEA", ec=INK, lw=CW))
    ax.add_patch(FancyBboxPatch((bx0 - 4.47, by0 + tag.USB_Z - 1.63), 8.94, 3.26,
                                boxstyle="round,pad=0,rounding_size=1.3", fc="#9AA2A6", ec=INK, lw=CH))
    dim_h(ax, bx0 - tag.PORT_W / 2, bx0 + tag.PORT_W / 2, by0 - 4, "12.6", y_from=by0 + tag.USB_Z - 3.5, above=False)
    dim_v(ax, by0 + tag.USB_Z - 3.5, by0 + tag.USB_Z + 3.5, bx0 + 12, "7.0", x_from=bx0 + 6.3, left=False)
    leader(ax, (bx0 + 3.5, by0 + tag.USB_Z), (bx0 + 30, by0 + 4), "USB-C service port\n(TPU plug, flush)", fs=6.5)
    ax.text(bx0 - W / 2 - 2, by0 + T - 2, "FRONT ↑", fontsize=6.5, color=GREEN, ha="right", va="center",
            fontweight="bold")
    view_title(ax, bx0 - 40, by0 + 10, "BOTTOM")

    # ---------------- SECTION A-A + DETAIL ----------------
    ax0 = 178
    parts = {"base": ("#DCEBE2", "////"), "cover": ("#F2F2EE", "\\\\\\\\"), "pin_cap": ("#9CCBB0", None),
             "lock_ring": ("#555B5E", None), "usb_plug": ("#E2E2DC", None), "logo_inlay": (GREEN, None)}
    comp_meta = json.loads((MESHES / "components.json").read_text())
    for key, (fc, hatch) in parts.items():
        m = load(f"{key}.stl")
        for p in section_polys(m, [0.0, 0, 0], [1, 0, 0], [2, 1]):
            draw_poly(ax, p, ox=ax0, fc=fc, ec=INK, lw=CH, hatch=hatch, z=3)
    for c in comp_meta:
        m = load(c["file"])
        col = "#{:02X}{:02X}{:02X}".format(*[int(v * 255) for v in c["color"]])
        for p in section_polys(m, [0.0, 0, 0], [1, 0, 0], [2, 1]):
            draw_poly(ax, p, ox=ax0, fc=col, ec=INK, lw=0.2, z=2)
    # male pin (indicative)
    ax.add_patch(Rectangle((ax0 - 6.8, py - 14), 1.6, 28, fc="#F2C230", ec=INK, lw=CH, zorder=1))
    ax.add_patch(Rectangle((ax0 - 6.0, py - 1.75), 15.0, 3.5, fc="#F2C230", ec=INK, lw=CH, zorder=1))
    ax.add_patch(MplPolygon([(ax0 + 9.0, py - 3.2), (ax0 + 13.0, py), (ax0 + 9.0, py + 3.2)], fc="#F2C230", ec=INK,
                            lw=CH, zorder=1))
    ax.add_patch(Rectangle((ax0 - 5.2, py - 26), 5.0, 52, fc="#E9C6B8", ec="none", alpha=0.65, zorder=0))
    ax.text(ax0 - 2.7, py + 27, "ear", fontsize=6.5, color=DIM, ha="center")
    ax.text(ax0 - 6.0, py - 16, "male\nbutton", fontsize=6.5, color=DIM, ha="center", va="top")
    view_title(ax, ax0 + 7, -14, "SECTION A–A", "centre line, X = 0")
    leader(ax, (ax0 + 9, 15), (ax0 + 26, 15), "XIAO ESP32S3 +\nWio-SX1262", fs=6.5)
    leader(ax, (ax0 + 4.5, 36), (ax0 + 26, 36), "LiPo 602535", fs=6.5)
    leader(ax, (ax0 + 7.4, py + 0.5), (ax0 + 26, py + 8), "TPU lock ring", fs=6.5)
    leader(ax, (ax0 + 13.2, py + 3), (ax0 + 26, py + 16), "pin cap", fs=6.5)
    leader(ax, (ax0 + 9, 1), (ax0 + 26, 2), "USB plug", fs=6.5)
    dim_h(ax, ax0, ax0 + 13.0, H + 6, "max. tip depth 13.0", y_from=py + 6, fs=6.5)
    dim_h(ax, ax0, ax0 + T, -8, "14.0", y_from=-1)

    # cutting plane marks on the front view
    for yy in (-3, 71):
        ax.text(0, yy, "A", ha="center", va="center", fontsize=8, fontweight="bold", color=GREEN)

    title_block(fig, "General arrangement", "1 / 3", "1.6 : 1 on A3",
                notes=("Third-angle layout, views not aligned", "Envelope 46 × 68 × 14 mm",
                       "Material PETG + TPU 95A"))
    return fig


# ---------------------------------------------------------------------------
# sheet 2: internal layout and cross-sections
# ---------------------------------------------------------------------------
LAYER_COLORS = {"full": "#5E7DB6", "rear": "#0B6B3E", "front": "#E39A2D", "wall": "#B5651D"}


def sheet_layout():
    fig, ax = new_sheet((-36, 250), (-72, 106))
    comp_meta = json.loads((MESHES / "components.json").read_text())
    layer = {
        "Wio-SX1262 LoRa board": "full", "XIAO ESP32S3": "full", "ESP32-S3 shield": "full",
        "USB-C receptacle": "full", "LiPo 602535 500 mAh": "rear", "Battery PCM": "rear",
        "GNSS ceramic patch 18x18": "front", "GNSS module (L76K / ATGM336H)": "front",
        "6-axis IMU breakout": "front", "LoRa FPC antenna 923 MHz": "wall",
        "MLX90614 IR thermometer": "rear", "MAX30102 PPG sensor": "rear",
    }
    numbered = ["XIAO ESP32S3", "Wio-SX1262 LoRa board", "LiPo 602535 500 mAh", "GNSS ceramic patch 18x18",
                "GNSS module (L76K / ATGM336H)", "6-axis IMU breakout", "MLX90614 IR thermometer",
                "MAX30102 PPG sensor", "LoRa FPC antenna 923 MHz"]
    # front view footprint at 1:1 in data units (scaled by S)
    S = 1.45
    draw_poly(ax, Polygon(outline_pts(0) * S), fc=PAPER, lw=0.9)
    draw_poly(ax, Polygon(outline_pts(tag.WALL) * S), fc=FILL, ec=HID, lw=CH)
    order = ["rear", "full", "front", "wall"]
    shapes_by = []
    for c in comp_meta:
        if c["name"] not in layer:
            continue
        m = load(c["file"])
        b = m.bounds
        shapes_by.append((order.index(layer[c["name"]]), c, b))
    for _, c, b in sorted(shapes_by, key=lambda t: t[0]):
        lay = layer[c["name"]]
        col = LAYER_COLORS[lay]
        x0, y0, x1, y1 = b[0][0] * S, b[0][1] * S, b[1][0] * S, b[1][1] * S
        if "MLX" in c["name"]:
            ax.add_patch(Circle(((x0 + x1) / 2, (y0 + y1) / 2), (x1 - x0) / 2, fc=col, ec=INK, lw=CH, alpha=0.85,
                                zorder=3))
        else:
            ax.add_patch(Rectangle((x0, y0), x1 - x0, y1 - y0, fc=col, ec=INK, lw=CH,
                                   alpha=0.30 if lay == "rear" and "LiPo" in c["name"] else 0.75, zorder=3))
        if c["name"] in numbered:
            n = numbered.index(c["name"]) + 1
            cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
            if c["name"] == "Wio-SX1262 LoRa board":
                cx, cy = cx, y0 + 4
            if c["name"] == "LiPo 602535 500 mAh":
                cx, cy = cx - 6, y0 + 5
            if "FPC" in c["name"]:
                cx = x0 - 4
            ax.add_patch(Circle((cx, cy), 2.4, fc=PAPER, ec=INK, lw=CW, zorder=6))
            ax.text(cx, cy, str(n), ha="center", va="center", fontsize=7.5, fontweight="bold", zorder=7)
    px, py = tag.PIN
    ax.add_patch(Circle((px * S, py * S), tag.PIN_BOSS_R * S, fc="#CFD6D2", ec=INK, lw=CW, zorder=4))
    ax.add_patch(Circle((px * S, py * S), tag.PIN_BORE_D / 2 * S, fc=PAPER, ec=INK, lw=CH, zorder=4))
    for x, y in tag.SCREWS:
        ax.add_patch(Circle((x * S, y * S), tag.COVER_BOSS_R * S, fc="#CFD6D2", ec=INK, lw=CH, zorder=4))
    for yy, lab in ((12.0, "B"), (36.0, "C"), (55.4, "D")):
        line(ax, [(-tag.W / 2 * S - 2, yy * S), (tag.W / 2 * S + 2, yy * S)], GREEN, CH, (0, (8, 2, 1, 2)), z=8)
        ax.text(-tag.W / 2 * S - 4, yy * S, lab, fontsize=8, fontweight="bold", color=GREEN, ha="right", va="center")
    view_title(ax, 0, -6, "INTERNAL LAYOUT — FRONT VIEW, COVER REMOVED", "scale 2.3 : 1")

    # legend
    lx, ly = -32, -20
    for i, (k, lab) in enumerate((("full", "full depth (10 mm)"), ("rear", "ear-side layer"),
                                  ("front", "front layer (behind logo)"), ("wall", "side wall"))):
        gx, gy = lx + (i % 2) * 40, ly - (i // 2) * 4.5
        ax.add_patch(Rectangle((gx, gy), 3, 3, fc=LAYER_COLORS[k], ec=INK, lw=CH, alpha=0.8))
        ax.text(gx + 4.5, gy + 1.5, lab, fontsize=6.8, va="center", color=INK)

    # BOM table
    rows = [
        ("1", "Seeed XIAO ESP32S3", "21.0 × 17.8 × 4.3", "MCU, Li-ion charger, USB-C"),
        ("2", "Seeed Wio-SX1262 (XIAO kit)", "21.0 × 17.8 × 4.0", "LoRa / LoRaWAN AS923, u.FL"),
        ("3", "LiPo 602535 + PCM", "35 × 25 × 6.0", "3.7 V ~500 mAh, JST-SH"),
        ("4", "GNSS ceramic patch", "18 × 18 × 4.0", "passive, u.FL, faces out"),
        ("5", "GNSS module L76K / ATGM336H", "≤ 16 × 13 × 2.4", "GPS + BeiDou, UART"),
        ("6", "6-axis IMU breakout", "≤ 12.7 × 12.7 × 2.2", "MPU-6050 class, I²C"),
        ("7", "MLX90614ESF (TO-39)", "Ø9.2 × 5.5", "IR skin temp, I²C"),
        ("8", "MAX30102 mini module", "≤ 10 × 10 × 3.2", "HR + SpO₂ (PPG), I²C"),
        ("9", "LoRa FPC antenna 915/923", "≤ 40 × 10 × 0.2", "adhesive flex, u.FL"),
    ]
    tx, ty = -32, -32
    heads = ("#", "Component", "Envelope (mm)", "Function")
    colx = (0, 4, 40, 64)
    for j, h in enumerate(heads):
        ax.text(tx + colx[j], ty, h, fontsize=6.8, fontweight="bold", color=DIM, va="top")
    for i, r in enumerate(rows):
        yy = ty - 3.6 * (i + 1)
        for j, v in enumerate(r):
            ax.text(tx + colx[j], yy, v, fontsize=6.6, color=INK, va="top", fontweight="bold" if j == 0 else None)
        line(ax, [(tx, yy + 0.8), (tx + 96, yy + 0.8)], "#D9DED9", 0.25)

    # cross-sections B-B, C-C, D-D (X across, Z up) at 3:1
    parts = {"base": ("#DCEBE2", "////"), "cover": ("#F2F2EE", "\\\\\\\\"), "pin_cap": ("#9CCBB0", None),
             "lock_ring": ("#555B5E", None), "usb_plug": ("#E2E2DC", None), "logo_inlay": (GREEN, None),
             "ppg_window": ("#2B3136", None)}
    meshes = {k: load(f"{k}.stl") for k in parts}
    comps = [(c, load(c["file"])) for c in comp_meta]
    S2 = 2.5
    for i, (yy, lab, desc) in enumerate(((12.0, "B–B", "MCU / radio zone"), (36.0, "C–C", "battery + GNSS zone"),
                                         (55.4, "D–D", "pin + body-sensor zone"))):
        ox, oy = 165, 72 - i * 56
        for k, (fc, hatch) in parts.items():
            for p in section_polys(meshes[k], [0, yy, 0], [0, 1, 0], [0, 2]):
                from shapely import affinity
                draw_poly(ax, affinity.scale(p, S2, S2, origin=(0, 0)), ox=ox, oy=oy, fc=fc, ec=INK, lw=CH,
                          hatch=hatch, z=3)
        for c, m in comps:
            col = "#{:02X}{:02X}{:02X}".format(*[int(v * 255) for v in c["color"]])
            for p in section_polys(m, [0, yy, 0], [0, 1, 0], [0, 2]):
                from shapely import affinity
                draw_poly(ax, affinity.scale(p, S2, S2, origin=(0, 0)), ox=ox, oy=oy, fc=col, ec=INK, lw=0.2, z=2)
        ax.text(ox - tag.W / 2 * S2 - 3, oy + tag.T * S2 / 2, lab, fontsize=10, fontweight="bold", color=GREEN,
                ha="right", va="center")
        ax.text(ox, oy - 4, f"SECTION {lab}  ·  {desc}  ·  Y = {yy:g}", fontsize=7.5, color=INK, ha="center",
                va="top", fontweight="bold")
        ax.text(ox + tag.W / 2 * S2 + 2, oy + 0.5, "ear side", fontsize=6, color=DIM, va="bottom")
        ax.text(ox + tag.W / 2 * S2 + 2, oy + tag.T * S2 - 0.5, "front", fontsize=6, color=DIM, va="top")
    title_block(fig, "Internal layout & cross-sections", "2 / 3", "2.3 : 1 / 2.5 : 1",
                notes=("Every part checked for zero interference in CAD", "Internal volume 27 cm³"))
    return fig


# ---------------------------------------------------------------------------
# sheet 3: placement and installation guide
# ---------------------------------------------------------------------------
def ear_outline():
    t = np.linspace(0, 2 * np.pi, 200)
    # leaf-like cattle ear, ~200 x 120 mm, base (head) on the left
    x = 100 * (1 - np.cos(t)) - 0
    y = 60 * np.sin(t) * (1 - 0.62 * (x / 200) ** 2.2) * (0.75 + 0.25 * np.sin(t / 2))
    return np.column_stack([x, y])


def sheet_install():
    fig, ax = new_sheet((-20, 300), (-95, 115))
    # --- ear diagram at 1:1 scale relative to the tag (scaled by 0.55) ---
    s = 0.55
    ox, oy = 0, 40
    ear = ear_outline() * s + [ox, oy]
    ax.add_patch(MplPolygon(ear, fc="#F4DDD3", ec=INK, lw=0.8, zorder=1))
    ax.add_patch(Rectangle((ox - 14, oy - 22), 14, 44, fc="#E9D2C4", ec=INK, lw=0.6, zorder=0))
    ax.text(ox - 7, oy, "HEAD", rotation=90, ha="center", va="center", fontsize=8, color=DIM, fontweight="bold")
    # cartilage ribs
    xr = np.linspace(8, 188, 100)
    for k in (1, -1):
        ax.plot(ox + xr * s, oy + k * (22 * np.sin(np.pi * xr / 200) ** 0.9) * s, color="#C79A88", lw=1.4, zorder=2)
    # thirds
    for xx in (200 / 3, 400 / 3):
        line(ax, [(ox + xx * s, oy - 36), (ox + xx * s, oy + 36)], HID, CH, (0, (4, 2)), z=2)
    ax.text(ox + 100 / 3 * s, oy + 38, "inner third", ha="center", fontsize=6.5, color=DIM)
    ax.text(ox + 100 * s, oy + 38, "middle third", ha="center", fontsize=7, color=GREEN, fontweight="bold")
    ax.text(ox + 500 / 3 * s, oy + 38, "outer third", ha="center", fontsize=6.5, color=DIM)
    # target zone
    zx = ox + 95 * s
    ax.add_patch(Circle((zx, oy), 7.5, fc=GREEN, alpha=0.18, ec=GREEN, lw=0.8, zorder=3))
    ax.add_patch(Circle((zx, oy), 1.2, fc=GREEN, ec="none", zorder=4))
    # tag silhouette hanging from the pin at true scale
    tagp = outline_pts(0) * s
    tagp = tagp - [0, tag.PIN[1] * s]
    ax.add_patch(MplPolygon(tagp + [zx, oy], fc=PAPER, ec=GREEN, lw=0.9, alpha=0.9, zorder=3))
    ax.text(ox + 100 * s, oy - 60, "Pin between the two cartilage ribs, in the middle third of the ear.\n"
            "Avoid the large veins (hold the ear to the light) and the ear edge.",
            ha="center", va="top", fontsize=7.5, color=INK)
    ax.text(ox + 50, oy + 58, "1  ·  WHERE", fontsize=12, fontweight="bold", color=GREEN, ha="center")
    ax.text(ox + 50, oy + 51, "inside (front) face of the ear, scale 1 : 1.8", fontsize=7, color=DIM, ha="center")

    # --- sandwich diagram ---
    bx, by = 150, 40
    ax.text(bx + 15, by + 58, "2  ·  HOW IT HOLDS", fontsize=12, fontweight="bold", color=GREEN, ha="center")
    ax.text(bx + 15, by + 51, "side section through the pin, scale 2 : 1", fontsize=7, color=DIM, ha="center")
    k = 2.0
    ax.add_patch(Rectangle((bx - 10 * k / 2, by - 30), 5 * k, 60, fc="#F4DDD3", ec=INK, lw=0.6))  # ear 5 mm
    ax.text(bx - 2.5 * k + 2.5 * k, by + 32, "ear\n3–8 mm", ha="center", fontsize=6.5, color=DIM)
    hb = bx - 5 * k - 0.2
    ax.add_patch(Rectangle((hb - 1.6 * k, by - 28), 1.6 * k, 56, fc="#F2C230", ec=INK, lw=0.6))
    ax.text(hb - 1.6 * k - 1, by - 31, "male button\n(standard, Ø28)", ha="right", va="top", fontsize=6.5, color=DIM)
    tx0 = bx + 5 * k + 2.5 * k  # 2.5 mm free play
    ax.add_patch(Rectangle((tx0, by - 25), tag.T * k, 50, fc="#F2F2EE", ec=INK, lw=0.6))
    ax.add_patch(Rectangle((tx0, by - 25), tag.SPLIT * k, 50, fc="#DCEBE2", ec=INK, lw=0.6))
    # bore, lock, chamber, cap
    ax.add_patch(Rectangle((tx0, by - 3.6 * k / 2 * 1), tag.SPLIT * k, 3.6 * k, fc=PAPER, ec=INK, lw=0.4))
    ax.add_patch(Rectangle((tx0 + tag.SPLIT * k, by - 4.9 * k / 2 * 1), 2.4 * k, 4.9 * k, fc="#555B5E", ec=INK,
                           lw=0.4))
    ax.add_patch(Rectangle((tx0 + 8.4 * k, by - 4 * k / 2), 3.6 * k, 4 * k, fc=PAPER, ec=INK, lw=0.4))
    ax.add_patch(Rectangle((tx0 + 12 * k, by - 5.5 * k / 2 * 1), 2 * k, 5.5 * k, fc="#9CCBB0", ec=INK, lw=0.4))
    # pin
    ax.add_patch(Rectangle((hb, by - 1.75 * k / 2), (tx0 + 9 * k) - hb, 1.75 * k, fc="#F2C230", ec=INK, lw=0.5,
                           zorder=4))
    ax.add_patch(MplPolygon([(tx0 + 8.8 * k, by - 3.2 * k / 2), (tx0 + 12.5 * k, by), (tx0 + 8.8 * k, by + 3.2 * k / 2)],
                            fc="#F2C230", ec=INK, lw=0.5, zorder=4))
    dim_h(ax, bx + 5 * k / 2 * 1 - 0, tx0, by - 33, "2–4 mm play", y_from=by - 26, fs=6.5, above=False)
    leader(ax, (tx0 + 7 * k, by + 4), (tx0 + 40, by + 22), "TPU lock ring grips the tip", fs=6.5)
    leader(ax, (tx0 + 13 * k, by + 4), (tx0 + 40, by + 12), "snap cap hides the tip", fs=6.5)
    leader(ax, (tx0 + 2, by + 18), (tx0 + 40, by - 8), "sensors face the ear here", fs=6.5)
    ax.text(tx0 + tag.T * k / 2, by - 28, "Terrava tag", ha="center", va="top", fontsize=7, fontweight="bold",
            color=GREEN)

    # --- steps ---
    steps = [
        ("Charge", "Plug USB-C, the status light glows through the shell. Full in ~2 h."),
        ("Seal", "Press the TPU plug into the port until flush; check the gasket seam."),
        ("Register", "Terrava dashboard → Devices → add DevEUI, pair with the animal."),
        ("Load", "Cap off. Tag on the applicator's female jaw, male button on the pin."),
        ("Apply", "Disinfect, squeeze in one firm stroke at the marked zone."),
        ("Cap & go", "Snap the cap in. The tag joins LoRaWAN and reports within 5 min."),
    ]
    sx, sy = -14, -62
    ax.text(sx, sy + 14, "3  ·  PLUG & USE IN SIX STEPS", fontsize=12, fontweight="bold", color=GREEN)
    for i, (h, d) in enumerate(steps):
        cx = sx + (i % 3) * 104
        cy = sy - (i // 3) * 16
        ax.add_patch(Circle((cx + 4, cy), 4, fc=GREEN, ec="none"))
        ax.text(cx + 4, cy, str(i + 1), ha="center", va="center", fontsize=10, fontweight="bold", color="white")
        ax.text(cx + 11, cy + 2.2, h, fontsize=9.5, fontweight="bold", color=INK, va="center")
        ax.text(cx + 11, cy - 3.0, d, fontsize=7.2, color=DIM, va="center")
    title_block(fig, "Placement & installation", "3 / 3", "as noted",
                notes=("Use with standard two-piece male buttons (pin ≈ 19 mm)",
                       "Re-tagging: cut the pin, replace the lock ring"))
    return fig


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in (("sheet-1-general-arrangement", sheet_general), ("sheet-2-internal-layout", sheet_layout),
                     ("sheet-3-placement-installation", sheet_install)):
        fig = fn()
        fig.savefig(OUT / f"{name}.png", dpi=200, facecolor=PAPER)
        fig.savefig(OUT / f"{name}.pdf", facecolor=PAPER)
        plt.close(fig)
        print("wrote", OUT / f"{name}.png")


if __name__ == "__main__":
    main()
