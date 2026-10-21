"""Technical drawing sheets for the Terrava Classic TV-ET0 (matplotlib, A3 landscape).

Same drawing kit as the Shield (../../tv-et1-shield/cad/drawings.py); geometry comes
from terrava_classic.py and its meshes, so the sheets stay true to the STL/STEP files.

    python drawings_classic.py      (after terrava_classic.py)
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parents[1] / "tv-et1-shield" / "cad"))

import drawings as dw  # noqa: E402  (the Shield's drawing kit; also sets fonts)
import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import trimesh  # noqa: E402
from drawings import (  # noqa: E402
    CH, CW, DIM, FILL, GREEN, GREEN_L, HID, INK, PAPER, centre_mark, dim_h, dim_v, draw_poly, leader, line,
    new_sheet, section_polys, title_block, view_title,
)
from matplotlib.patches import Circle, FancyBboxPatch, Polygon as MplPolygon, Rectangle  # noqa: E402
from shapely import affinity  # noqa: E402
from shapely.geometry import Polygon  # noqa: E402

import terrava_classic as tag  # noqa: E402

dw.MODEL = "TV-ET0 CLASSIC"
MESHES = HERE.parent / "models" / "render-meshes"
OUT = HERE.parent / "images" / "drawings"
GREY = "#A9AEAD"
CELL = "#232A38"


def outline(d=0.0) -> Polygon:
    return tag.outline_shapely(d)


def load(name):
    return trimesh.load(MESHES / name, force="mesh")


def rounded(ax, cx, cy, w, h, r, **kw):
    ax.add_patch(FancyBboxPatch((cx - w / 2, cy - h / 2), w, h, boxstyle=f"round,pad=0,rounding_size={r}", **kw))


PART_STYLE = {"housing": ("#F2F2EE", "////"), "cover": ("#E6EEE9", "\\\\\\\\"), "pin_cap": (GREY, None),
              "lock_ring": ("#555B5E", None), "usb_plug": ("#E2E2DC", None), "logo_inlay": (GREEN, None),
              "yoke": (GREY, None), "ppg_window": ("#2B3136", None)}


def male_pin(ax, ox, py, z_head):
    """Indicative standard male button in section (Z across, Y up)."""
    ax.add_patch(Rectangle((ox + z_head - 1.6, py - 14), 1.6, 28, fc="#F2C230", ec=INK, lw=CH, zorder=1))
    ax.add_patch(Rectangle((ox + z_head, py - 1.75), 8.0 - z_head, 3.5, fc="#F2C230", ec=INK, lw=CH, zorder=1))
    ax.add_patch(MplPolygon([(ox + 8.0, py - 3.2), (ox + 11.5, py), (ox + 8.0, py + 3.2)], fc="#F2C230", ec=INK,
                            lw=CH, zorder=1))
    ax.add_patch(Rectangle((ox + z_head, py - 26), 4.5, 52, fc="#E9C6B8", ec="none", alpha=0.65, zorder=0))


# ---------------------------------------------------------------------------
# sheet 1: general arrangement
# ---------------------------------------------------------------------------
def sheet_general():
    fig, ax = new_sheet((-40, 240), (-60, 86))
    T, H, W = tag.T, tag.H, tag.W
    px, py = tag.PIN
    yl = tag.Y_LID - tag.LID_GAP

    # ---------------- FRONT VIEW ----------------
    draw_poly(ax, outline(0), fc=PAPER, lw=0.9)
    draw_poly(ax, outline(tag.CH_FRONT).intersection(Polygon([(-30, -1), (30, -1), (30, yl - 1.0), (-30, yl - 1.0)])),
              lw=CH)
    draw_poly(ax, outline(tag.CH_NECK).intersection(Polygon([(-30, yl), (30, yl), (30, 90), (-30, 90)])), lw=CH)
    draw_poly(ax, outline(tag.WALL).intersection(Polygon([(-30, -1), (30, -1), (30, tag.Y_CAV), (-30, tag.Y_CAV)])),
              ec=HID, lw=CH, ls=(0, (4, 2)))
    seam = outline(0).intersection(Polygon([(-30, yl - 0.05), (30, yl - 0.05), (30, yl + 0.05), (-30, yl + 0.05)]))
    x0, _, x1, _ = seam.bounds
    line(ax, [(x0, yl), (x1, yl)], INK, CW)
    line(ax, [(x0 + 0.6, yl - 1.0), (x1 - 0.6, yl - 1.0)], INK, CH)
    for p in tag.front_graphics():
        draw_poly(ax, p, fc=GREEN, ec=GREEN, lw=0.2)
    ax.add_patch(Circle((px, py), tag.CAP_D / 2, fc="#D9DCDB", ec=INK, lw=CW, zorder=3))
    ax.add_patch(Circle((px, py), 2.3, fc="#7D8589", ec=INK, lw=CH, zorder=3))
    centre_mark(ax, px, py, 8)
    line(ax, [(0, -2), (0, 70)], HID, CH, (0, (8, 2, 1, 2)), z=1)
    dim_h(ax, -W / 2, W / 2, -8, "42.0", y_from=8)
    dim_v(ax, 0, H, -31, "66.0", x_from=-18)
    dim_v(ax, 0, py, 27, "57.4", x_from=6, left=False)
    nx = tag.outline_shapely(0).intersection(Polygon([(-30, py - 0.01), (30, py - 0.01), (30, py + 0.01),
                                                       (-30, py + 0.01)])).bounds[2]
    dim_h(ax, -nx, nx, H + 6, f"{2 * nx:.1f}", y_from=py + 2)
    leader(ax, (px + 3.9, py + 3.9), (14, 80), "Ø11.0 grey pin cap (TPU, flush)", fs=6.5)
    leader(ax, (-W / 2 + 1.9, 1.9), (-38, -3), "R6.5", ha="left")
    leader(ax, (-W / 2 + 0.9, 36.2), (-38, 30), "R8 shoulder", ha="left", fs=6.5)
    leader(ax, (-9.9, 47.6), (-38, 52), "R8 waist", ha="left", fs=6.5)
    leader(ax, (-6.1, 63.5), (-38, 74), "R8.6 (concentric\nwith the pin)", ha="left", fs=6.5)
    leader(ax, (x1 - 2, yl - 0.5), (30, 50), "cover ends at the neck base,\n1 mm step to the neck", fs=6.5)
    leader(ax, (-6.2, 26), (-38, 18), "logo inlay\n0.8 deep, 2-colour", fs=6.5)
    view_title(ax, 0, -14, "FRONT", "outward face")

    # ---------------- SIDE VIEW (from the right) ----------------
    sx0 = 52
    cf, cr, cn = tag.CH_FRONT, tag.CH_REAR, tag.CH_NECK
    prof = [(cr, 0), (T - cf, 0), (T, cf), (T, yl - 1.0), (T - 1.0, yl), (tag.T_NECK, yl), (tag.T_NECK, H - cn),
            (tag.T_NECK - cn, H), (cr, H), (0, H - cr), (0, cr)]
    draw_poly(ax, Polygon([(sx0 + z, y) for z, y in prof]), fc=PAPER, lw=0.9)
    yk = [p for p in tag.yoke_footprint()]
    ky0, ky1 = min(p.bounds[1] for p in yk), max(p.bounds[3] for p in yk)
    ax.add_patch(Rectangle((sx0 - tag.YOKE_T, ky0), tag.YOKE_T, ky1 - ky0, fc=GREY, ec=INK, lw=CW, zorder=3))
    line(ax, [(sx0 + tag.SPLIT, 0), (sx0 + tag.SPLIT, yl)], INK, CW)
    for z in (cr, T - cf):
        line(ax, [(sx0 + z, 0), (sx0 + z, yl - 1.0 if z > 5 else H)], INK, CH)
    dim_h(ax, sx0 - tag.YOKE_T, sx0 + T, -8, "18.0", y_from=-1)
    dim_h(ax, sx0, sx0 + tag.SPLIT, H + 6, f"{tag.SPLIT:g}", y_from=H + 1)
    dim_h(ax, sx0 + tag.SPLIT, sx0 + T, H + 6, f"{T - tag.SPLIT:g}", y_from=H + 1)
    dim_h(ax, sx0, sx0 + tag.T_NECK, H + 13, f"neck {tag.T_NECK:g}", y_from=H + 1)
    ax.text(sx0 - 2.5, 20, "EAR SIDE", rotation=90, fontsize=7, color=GREEN, fontweight="bold", ha="right", va="center")
    ax.text(sx0 + T + 1.5, 20, "FRONT", rotation=90, fontsize=7, color=GREEN, fontweight="bold", ha="left", va="center")
    leader(ax, (sx0 - 0.5, 50), (sx0 + 24, 58), "TPU sensor yoke\n1.0 proud", fs=6.5)
    leader(ax, (sx0 + tag.SPLIT, 24), (sx0 + 24, 30), "parting line\nlap joint + TPU gasket", fs=6.5)
    leader(ax, (sx0 + T - 0.5, yl - 0.5), (sx0 + 24, 44), "45° step to the neck", fs=6.5)
    leader(ax, (sx0 + 0.4, 0.4), (sx0 + 24, 8), "45° × 0.8 / × 1.2 chamfers", fs=6.5)
    view_title(ax, sx0 + T / 2, -14, "SIDE", f"housing {tag.SPLIT:g} | cover {T - tag.SPLIT:g}")

    # ---------------- REAR VIEW (mirrored) ----------------
    rx0 = 120

    def rp(poly):
        return affinity.translate(affinity.scale(poly, -1, 1, origin=(0, 0)), rx0, 0)

    draw_poly(ax, rp(outline(0)), fc=PAPER, lw=0.9)
    draw_poly(ax, rp(outline(tag.CH_REAR)), lw=CH)
    for p in tag.yoke_footprint():
        draw_poly(ax, rp(p), fc=GREY, ec=INK, lw=CW, z=2)
    for p in tag.rear_lettering():
        draw_poly(ax, rp(p), fc=DIM, ec=DIM, lw=0.1)
    cy = tag.CELL_CY
    rounded(ax, rx0, cy, tag.WIN_W + 2 * tag.WIN_STEP, tag.WIN_H + 2 * tag.WIN_STEP, tag.WIN_R + tag.WIN_STEP,
            fc="none", ec=INK, lw=CH, zorder=3)
    rounded(ax, rx0, cy, tag.WIN_W, tag.WIN_H, tag.WIN_R, fc=CELL, ec=INK, lw=CW, zorder=3)
    for k in range(1, 5):
        xx = rx0 - tag.WIN_W / 2 + k * tag.WIN_W / 5
        line(ax, [(xx, cy - tag.WIN_H / 2 + 0.4), (xx, cy + tag.WIN_H / 2 - 0.4)], "#4B5468", 0.3, z=4)
    mx, my = tag.MLX_AT
    ax.add_patch(Circle((rx0 - mx, my), 4.2, fc="#BFC4C6", ec=INK, lw=CW, zorder=3))
    ax.add_patch(Circle((rx0 - mx, my), 2.0, fc="#7D8589", ec="none", zorder=3))
    ax_, ay = tag.MAX_AT
    rounded(ax, rx0 - ax_, ay, 9.0, 7.0, 1.5, fc="#2B3136", ec=INK, lw=CW, zorder=3)
    ax.add_patch(Circle((rx0 - px, py), tag.PIN_BORE_D / 2 + 1.0, fc="none", ec=INK, lw=CH, zorder=3))
    ax.add_patch(Circle((rx0 - px, py), tag.PIN_BORE_D / 2, fc="#E9ECEA", ec=INK, lw=CW, zorder=3))
    for x, y in tag.SCREWS:
        ax.add_patch(Circle((rx0 - x, y), tag.CSK_D / 2, fc="none", ec=INK, lw=CW, zorder=3))
        ax.add_patch(Circle((rx0 - x, y), tag.SCREW_CLEAR_D / 2, fc="#E9ECEA", ec=INK, lw=CH, zorder=3))
    centre_mark(ax, rx0 - px, py, 7)
    dim_h(ax, rx0 - tag.WIN_W / 2, rx0 + tag.WIN_W / 2, -8, f"window {tag.WIN_W:g} × {tag.WIN_H:g}",
          y_from=cy - tag.WIN_H / 2)
    dim_h(ax, rx0 - 16, rx0 + 16, H + 6, "32.0 (screws)", y_from=8)
    dim_v(ax, 0, tag.SCREWS[0][1], rx0 + 29, f"{tag.SCREWS[0][1]:g}", x_from=rx0 + 18, left=False)
    leader(ax, (rx0 - mx + 3.0, my + 3.0), (rx0 + 25, 46), "MLX90614 IR window Ø8.4", fs=6.5)
    leader(ax, (rx0 - ax_ + 3.0, ay + 2.5), (rx0 + 25, 57), "PPG window 9.0 × 7.0\n(clear PC, flush with yoke)",
           fs=6.5)
    leader(ax, (rx0 - px - 2.4, py + 2.4), (rx0 - 40, 70), "Ø7.2 pin bore, 1×45° lead-in", fs=6.5, ha="left")
    leader(ax, (rx0 - 16 - 1.5, 4.4 - 1.5), (rx0 - 40, -2), "2× M2 × 14 csk\nØ4.2 × 90°", fs=6.5, ha="left")
    leader(ax, (rx0 + 8, cy - 4), (rx0 + 25, 22), "SM141K05L solar cell\nbonded behind the window", fs=6.5)
    leader(ax, (rx0 + 12, 37), (rx0 + 25, 34), "grey TPU yoke\n(ear contact)", fs=6.5)
    view_title(ax, rx0, -14, "REAR", "ear-side face")

    # ---------------- BOTTOM VIEW ----------------
    bx0, by0 = 0, -52
    bot = [(-W / 2 + cr, 0), (W / 2 - cr, 0), (W / 2, cr), (W / 2, T - cf), (W / 2 - cf, T), (-W / 2 + cf, T),
           (-W / 2, T - cf), (-W / 2, cr)]
    draw_poly(ax, Polygon([(bx0 + x, by0 + z) for x, z in bot]), fc=PAPER, lw=0.9)
    line(ax, [(bx0 - W / 2, by0 + tag.SPLIT), (bx0 + W / 2, by0 + tag.SPLIT)], INK, CW)
    rounded(ax, bx0, by0 + tag.USB_Z, tag.PORT_W, tag.PORT_H, tag.PORT_R, fc="#E9ECEA", ec=INK, lw=CW, zorder=3)
    rounded(ax, bx0, by0 + tag.USB_Z, 8.94, 3.26, 1.3, fc="#9AA2A6", ec=INK, lw=CH, zorder=4)
    dim_h(ax, bx0 - tag.PORT_W / 2, bx0 + tag.PORT_W / 2, by0 - 4, "12.6", y_from=by0 + tag.USB_Z - 3.5, above=False)
    dim_v(ax, by0 + tag.USB_Z - 3.5, by0 + tag.USB_Z + 3.5, bx0 + 12, "7.0", x_from=bx0 + 6.3, left=False)
    leader(ax, (bx0 + 3.5, by0 + tag.USB_Z), (bx0 + 30, by0 + 4), "USB-C service port\n(TPU plug, flush)", fs=6.5)
    ax.text(bx0 - W / 2 - 2, by0 + T - 2, "FRONT ↑", fontsize=6.5, color=GREEN, ha="right", va="center",
            fontweight="bold")
    view_title(ax, bx0 - 40, by0 + 10, "BOTTOM")

    # ---------------- SECTION A-A ----------------
    ax0 = 182
    for key, (fc, hatch) in PART_STYLE.items():
        for p in section_polys(load(f"{key}.stl"), [0.0, 0, 0], [1, 0, 0], [2, 1]):
            draw_poly(ax, p, ox=ax0, fc=fc, ec=INK, lw=CH, hatch=hatch, z=3)
    for c in json.loads((MESHES / "components.json").read_text()):
        col = "#{:02X}{:02X}{:02X}".format(*[int(v * 255) for v in c["color"]])
        for p in section_polys(load(c["file"]), [0.0, 0, 0], [1, 0, 0], [2, 1]):
            draw_poly(ax, p, ox=ax0, fc=col, ec=INK, lw=0.2, z=2)
    zh = -tag.YOKE_T - 4.5
    male_pin(ax, ax0, py, zh)
    ax.text(ax0 + zh + 2.2, py + 27, "ear", fontsize=6.5, color=DIM, ha="center")
    ax.text(ax0 + zh - 1, py - 16, "male\nbutton", fontsize=6.5, color=DIM, ha="center", va="top")
    view_title(ax, ax0 + 6, -14, "SECTION A–A", "centre line, X = 0")
    leader(ax, (ax0 + 11, 12), (ax0 + 24, 12), "XIAO ESP32S3 +\nWio-SX1262", fs=6.5)
    leader(ax, (ax0 + 5.3, 20), (ax0 + 24, 22), "LiPo 302535", fs=6.5)
    leader(ax, (ax0 + 2.6, 26), (ax0 + 24, 30), "solar cell", fs=6.5)
    leader(ax, (ax0 + 13.4, 36), (ax0 + 24, 38), "GNSS patch", fs=6.5)
    leader(ax, (ax0 + 2.0, 46.6), (ax0 + 24, 46), "MAX30102", fs=6.5)
    leader(ax, (ax0 + 6.2, py + 0.5), (ax0 + 24, py + 2), "TPU lock ring", fs=6.5)
    leader(ax, (ax0 + 15.2, py + 4), (ax0 + 24, py + 10), "grey pin cap", fs=6.5)
    leader(ax, (ax0 + 9, 1), (ax0 + 24, 2), "USB plug", fs=6.5)
    dim_h(ax, ax0 - tag.YOKE_T, ax0 + T, -8, "18.0", y_from=-1)
    for yy in (-3, 71):
        ax.text(0, yy, "A", ha="center", va="center", fontsize=8, fontweight="bold", color=GREEN)

    title_block(fig, "General arrangement", "1 / 3", "1.6 : 1 on A3",
                notes=("Third-angle layout, views not aligned", "Envelope 42 × 66 × 18 mm (17 + 1 mm yoke)",
                       "Material PETG/ASA + TPU 95A"))
    return fig


# ---------------------------------------------------------------------------
# sheet 2: internal layout and cross-sections
# ---------------------------------------------------------------------------
LAYER_COLORS = {"rear": "#0B6B3E", "full": "#5E7DB6", "middle": "#8E6CC8", "front": "#E39A2D", "wall": "#B5651D"}
LAYER = {
    "Solar cell SM141K05L": "rear", "LiPo 302535 250 mAh": "rear", "MLX90614 IR thermometer": "rear",
    "MAX30102 PPG sensor": "rear", "Wio-SX1262 LoRa board": "full", "XIAO ESP32S3": "full",
    "ESP32-S3 shield": "full", "USB-C receptacle": "full", "Solar harvester": "middle",
    "GNSS module (L76K / ATGM336H)": "middle", "6-axis IMU breakout": "middle", "GNSS ceramic patch 18x18": "front",
    "LoRa FPC antenna 923 MHz": "wall",
}
NUMBERED = ["XIAO ESP32S3", "Wio-SX1262 LoRa board", "LiPo 302535 250 mAh", "Solar cell SM141K05L", "Solar harvester",
            "GNSS ceramic patch 18x18", "GNSS module (L76K / ATGM336H)", "6-axis IMU breakout",
            "MLX90614 IR thermometer", "MAX30102 PPG sensor", "LoRa FPC antenna 923 MHz"]
BADGE = {"XIAO ESP32S3": (0, 4), "Wio-SX1262 LoRa board": (0, -4), "LiPo 302535 250 mAh": (-11, 7),
         "Solar cell SM141K05L": (-11, -7), "GNSS module (L76K / ATGM336H)": (5.5, -3.5),
         "6-axis IMU breakout": (-3, -4), "GNSS ceramic patch 18x18": (0, 6)}


def sheet_layout():
    fig, ax = new_sheet((-36, 250), (-72, 106))
    meta = json.loads((MESHES / "components.json").read_text())
    S = 1.45
    draw_poly(ax, affinity.scale(outline(0), S, S, origin=(0, 0)), fc=PAPER, lw=0.9)
    cav = outline(tag.WALL).intersection(Polygon([(-30, -1), (30, -1), (30, tag.Y_CAV), (-30, tag.Y_CAV)]))
    draw_poly(ax, affinity.scale(cav, S, S, origin=(0, 0)), fc=FILL, ec=HID, lw=CH)
    order = list(LAYER_COLORS)
    items = []
    for c in meta:
        if c["name"] in LAYER:
            items.append((order.index(LAYER[c["name"]]), c, load(c["file"])))
    for _, c, m in sorted(items, key=lambda t: t[0]):
        lay = LAYER[c["name"]]
        col = LAYER_COLORS[lay]
        b = m.bounds
        x0, y0, x1, y1 = b[0][0] * S, b[0][1] * S, b[1][0] * S, b[1][1] * S
        if "MLX" in c["name"]:
            ax.add_patch(Circle(((x0 + x1) / 2, (y0 + y1) / 2), (x1 - x0) / 2, fc=col, ec=INK, lw=CH, alpha=0.85,
                                zorder=3))
        elif "FPC" in c["name"]:
            fp = tag.outline_shapely(2.2).exterior.intersection(
                Polygon([(-30, 8.6), (-9.5, 8.6), (-9.5, 42), (-30, 42)]))
            for g in getattr(fp, "geoms", [fp]):
                cc = np.asarray(g.coords) * S
                ax.plot(cc[:, 0], cc[:, 1], color=col, lw=2.6, solid_capstyle="round", zorder=4)
        else:
            alpha = 0.28 if c["name"].startswith(("LiPo", "Solar cell")) else 0.45 if lay == "front" else 0.75
            ax.add_patch(Rectangle((x0, y0), x1 - x0, y1 - y0, fc=col, ec=INK, lw=CH, alpha=alpha, zorder=3))
        if c["name"] in NUMBERED:
            n = NUMBERED.index(c["name"]) + 1
            dx, dy = BADGE.get(c["name"], (0, 0))
            cx, cy = (x0 + x1) / 2 + dx * S, (y0 + y1) / 2 + dy * S
            if "FPC" in c["name"]:
                cx, cy = -19.5 * S, 22 * S
            ax.add_patch(Circle((cx, cy), 2.4, fc=PAPER, ec=INK, lw=CW, zorder=6))
            ax.text(cx, cy, str(n), ha="center", va="center", fontsize=7.5, fontweight="bold", zorder=7)
    px, py = tag.PIN
    ax.add_patch(Circle((px * S, py * S), (tag.LOCK_POCKET_D / 2 + 1.2) * S, fc="#CFD6D2", ec=INK, lw=CW, zorder=4))
    ax.add_patch(Circle((px * S, py * S), tag.PIN_BORE_D / 2 * S, fc=PAPER, ec=INK, lw=CH, zorder=4))
    for x, y in tag.SCREWS:
        ax.add_patch(Circle((x * S, y * S), tag.COVER_BOSS_R * S, fc="#CFD6D2", ec=INK, lw=CH, zorder=4))
    hw, reach, _, _ = tag.TONGUE
    ax.add_patch(Rectangle((-hw * S, (tag.Y_LID - 0.6) * S), 2 * hw * S, (reach + 0.6) * S, fc="#CFD6D2", ec=INK,
                           lw=CH, zorder=4))
    for yy, lab in SECTIONS_Y:
        line(ax, [(-tag.W / 2 * S - 2, yy * S), (tag.W / 2 * S + 2, yy * S)], GREEN, CH, (0, (8, 2, 1, 2)), z=8)
        ax.text(-tag.W / 2 * S - 4, yy * S, lab, fontsize=8, fontweight="bold", color=GREEN, ha="right", va="center")
    view_title(ax, 0, -6, "INTERNAL LAYOUT — FRONT VIEW, COVER REMOVED", "scale 2.3 : 1")

    lx, ly = -32, -20
    for i, (k, lab) in enumerate((("rear", "rear layer (ear / solar side)"), ("full", "MCU + radio stack"),
                                  ("middle", "middle layer"), ("front", "front layer (behind logo)"),
                                  ("wall", "side wall"))):
        gx, gy = lx + (i % 3) * 34, ly - (i // 3) * 4.5
        ax.add_patch(Rectangle((gx, gy), 3, 3, fc=LAYER_COLORS[k], ec=INK, lw=CH, alpha=0.8))
        ax.text(gx + 4.5, gy + 1.5, lab, fontsize=6.4, va="center", color=INK)

    rows = [
        ("1", "Seeed XIAO ESP32S3", "21.0 × 17.8 × 4.3", "MCU, Li-ion charger, USB-C"),
        ("2", "Seeed Wio-SX1262 (XIAO kit)", "21.0 × 17.8 × 4.0", "LoRa / LoRaWAN AS923, u.FL"),
        ("3", "LiPo 302535 + PCM", "35 × 25 × 3.0", "3.7 V ~250 mAh, JST-SH"),
        ("4", "Solar cell ANYSOLAR SM141K05L", "35 × 22 × 2.1", "154 mW, Voc 3.4 V"),
        ("5", "Solar harvester (BQ25570 class)", "≤ 14 × 9 × 3", "boost MPPT charger"),
        ("6", "GNSS ceramic patch", "18 × 18 × 4.0", "passive, u.FL, faces out"),
        ("7", "GNSS module L76K / ATGM336H", "≤ 16 × 13 × 2.4", "GPS + BeiDou, UART"),
        ("8", "6-axis IMU breakout", "≤ 12.7 × 12.7 × 2.0", "MPU-6050 class, I²C"),
        ("9", "MLX90614ESF (TO-39)", "Ø9.2 × 5.5", "IR skin temp, I²C"),
        ("10", "MAX30102 mini module", "≤ 10 × 10 × 3.2", "HR + SpO₂ (PPG), I²C"),
        ("11", "LoRa FPC antenna 915/923", "≤ 40 × 8 × 0.2", "bent along the left wall"),
    ]
    tx, ty = -32, -30
    colx = (0, 4, 40, 64)
    for j, h in enumerate(("#", "Component", "Envelope (mm)", "Function")):
        ax.text(tx + colx[j], ty, h, fontsize=6.8, fontweight="bold", color=DIM, va="top")
    for i, r in enumerate(rows):
        yy = ty - 3.3 * (i + 1)
        for j, v in enumerate(r):
            ax.text(tx + colx[j], yy, v, fontsize=6.3, color=INK, va="top", fontweight="bold" if j == 0 else None)
        line(ax, [(tx, yy + 0.7), (tx + 96, yy + 0.7)], "#D9DED9", 0.25)

    meshes = {k: load(f"{k}.stl") for k in PART_STYLE}
    comps = [(c, load(c["file"])) for c in meta]
    S2 = 2.5
    for i, (yy, lab) in enumerate(SECTIONS_Y):
        desc = SECTION_DESC[lab]
        ox, oy = 168, 59 - i * 55
        for k, (fc, hatch) in PART_STYLE.items():
            for p in section_polys(meshes[k], [0, yy, 0], [0, 1, 0], [0, 2]):
                draw_poly(ax, affinity.scale(p, S2, S2, origin=(0, 0)), ox=ox, oy=oy, fc=fc, ec=INK, lw=CH,
                          hatch=hatch, z=3)
        for c, m in comps:
            col = "#{:02X}{:02X}{:02X}".format(*[int(v * 255) for v in c["color"]])
            for p in section_polys(m, [0, yy, 0], [0, 1, 0], [0, 2]):
                draw_poly(ax, affinity.scale(p, S2, S2, origin=(0, 0)), ox=ox, oy=oy, fc=col, ec=INK, lw=0.2, z=2)
        ax.text(ox - tag.W / 2 * S2 - 3, oy + tag.T * S2 / 2, lab, fontsize=10, fontweight="bold", color=GREEN,
                ha="right", va="center")
        ax.text(ox, oy - 6, f"SECTION {lab}  ·  {desc}  ·  Y = {yy:g}", fontsize=7.5, color=INK, ha="center",
                va="top", fontweight="bold")
        ax.text(ox + tag.W / 2 * S2 + 2, oy + 0.5, "ear side", fontsize=6, color=DIM, va="bottom")
        ax.text(ox + tag.W / 2 * S2 + 2, oy + tag.T * S2 - 0.5, "front", fontsize=6, color=DIM, va="top")
    report = json.loads((HERE.parent / "models" / "build-report.json").read_text())
    title_block(fig, "Internal layout & cross-sections", "2 / 3", "2.3 : 1 / 2.5 : 1",
                notes=("Every part checked for zero interference in CAD",
                       f"Internal volume {report['internal_volume_cm3']:.0f} cm³"))
    return fig


SECTIONS_Y = ((15.0, "B–B"), (37.5, "C–C"), (46.6, "D–D"))
SECTION_DESC = {"B–B": "MCU, battery, solar", "C–C": "IR sensor + GNSS tower", "D–D": "PPG window + cover hook"}


# ---------------------------------------------------------------------------
# sheet 3: placement and installation guide
# ---------------------------------------------------------------------------
def sheet_install():
    fig, ax = new_sheet((-20, 300), (-95, 115))
    s = 0.55
    ox, oy = 0, 40
    ear = dw.ear_outline() * s + [ox, oy]
    ax.add_patch(MplPolygon(ear, fc="#F4DDD3", ec=INK, lw=0.8, zorder=1))
    ax.add_patch(Rectangle((ox - 14, oy - 22), 14, 44, fc="#E9D2C4", ec=INK, lw=0.6, zorder=0))
    ax.text(ox - 7, oy, "HEAD", rotation=90, ha="center", va="center", fontsize=8, color=DIM, fontweight="bold")
    xr = np.linspace(8, 188, 100)
    for k in (1, -1):
        ax.plot(ox + xr * s, oy + k * (22 * np.sin(np.pi * xr / 200) ** 0.9) * s, color="#C79A88", lw=1.4, zorder=2)
    for xx in (200 / 3, 400 / 3):
        line(ax, [(ox + xx * s, oy - 36), (ox + xx * s, oy + 36)], HID, CH, (0, (4, 2)), z=2)
    ax.text(ox + 100 / 3 * s, oy + 38, "inner third", ha="center", fontsize=6.5, color=DIM)
    ax.text(ox + 100 * s, oy + 38, "middle third", ha="center", fontsize=7, color=GREEN, fontweight="bold")
    ax.text(ox + 500 / 3 * s, oy + 38, "outer third", ha="center", fontsize=6.5, color=DIM)
    # pin 20-25 mm above the lower margin, between the lower rib and the edge
    zx = ox + 95 * s
    from shapely.geometry import LineString

    lower = Polygon(ear).intersection(LineString([(zx, oy - 80), (zx, oy)])).bounds[1]
    zy = lower + 22 * s
    ax.add_patch(Circle((zx, zy), 5.5, fc=GREEN, alpha=0.18, ec=GREEN, lw=0.8, zorder=3))
    ax.add_patch(Circle((zx, zy), 1.2, fc=GREEN, ec="none", zorder=5))
    tagp = np.asarray(outline(0).exterior.coords) * s - [0, tag.PIN[1] * s]
    ax.add_patch(MplPolygon(tagp + [zx, zy], fc=PAPER, ec=GREEN, lw=0.9, alpha=0.92, zorder=4))
    dim_v(ax, lower, zy, zx + 16, "20–25", x_from=zx + 3, left=False, fs=6.5)
    ax.text(ox + 100 * s, oy - 64, "Pin in the middle third, below the lower cartilage rib, 20–25 mm above the\n"
            "lower ear margin: the yoke rests on the ear, the solar half hangs free below it.",
            ha="center", va="top", fontsize=7.5, color=INK)
    ax.text(ox + 50, oy + 58, "1  ·  WHERE", fontsize=12, fontweight="bold", color=GREEN, ha="center")
    ax.text(ox + 50, oy + 51, "inside (front) face of the ear, scale 1 : 1.8", fontsize=7, color=DIM, ha="center")

    # --- sandwich diagram (side section through the pin, Z to the right) ---
    bx, by = 150, 40
    ax.text(bx + 20, by + 58, "2  ·  HOW IT HOLDS", fontsize=12, fontweight="bold", color=GREEN, ha="center")
    ax.text(bx + 20, by + 51, "side section through the pin, scale 2 : 1", fontsize=7, color=DIM, ha="center")
    k = 2.0
    ear_t = 4.5
    z_ear0 = bx - ear_t * k
    ax.add_patch(Rectangle((z_ear0, by - 30), ear_t * k, 60, fc="#F4DDD3", ec=INK, lw=0.6))
    ax.text(z_ear0 + ear_t * k / 2, by + 32, "ear\n3–8 mm", ha="center", fontsize=6.5, color=DIM)
    hb = z_ear0 - 0.2
    ax.add_patch(Rectangle((hb - 1.6 * k, by - 28), 1.6 * k, 56, fc="#F2C230", ec=INK, lw=0.6))
    ax.text(hb - 1.6 * k - 1, by - 31, "male button\n(standard)", ha="right", va="top", fontsize=6.5, color=DIM)
    t0 = bx + tag.YOKE_T * k  # housing rear face; yoke from bx to t0
    ax.add_patch(Rectangle((bx, by - 26), tag.YOKE_T * k, 52, fc=GREY, ec=INK, lw=0.6))
    ax.add_patch(Rectangle((t0, by - 18), tag.T_NECK * k, 36, fc="#F2F2EE", ec=INK, lw=0.6))
    ax.add_patch(Rectangle((t0, by - 18), tag.T_NECK * k, 36, fc="none", ec=INK, lw=0.6, hatch="////"))
    ax.add_patch(Rectangle((bx, by - 3.6 * k / 2), (tag.YOKE_T + tag.LOCK_Z0) * k, 3.6 * k, fc=PAPER, ec=INK, lw=0.4,
                           zorder=3))
    ax.add_patch(Rectangle((t0 + tag.LOCK_Z0 * k, by - 4.9 * k), tag.LOCK_H * k, 9.8 * k, fc="#555B5E", ec=INK,
                           lw=0.4, zorder=3))
    zc = t0 + (tag.LOCK_Z0 + tag.LOCK_H) * k
    ax.add_patch(Rectangle((zc, by - 4.9 * k), (tag.T_NECK - tag.CAP_H - tag.LOCK_Z0 - tag.LOCK_H) * k, 9.8 * k,
                           fc=PAPER, ec=INK, lw=0.4, zorder=3))
    ax.add_patch(Rectangle((t0 + (tag.T_NECK - tag.CAP_H) * k, by - 5.5 * k), tag.CAP_H * k, 11 * k, fc=GREY, ec=INK,
                           lw=0.4, zorder=3))
    ax.add_patch(Rectangle((hb, by - 1.75 * k / 2), (t0 + 8.0 * k) - hb, 1.75 * k, fc="#F2C230", ec=INK, lw=0.5,
                           zorder=4))
    ax.add_patch(MplPolygon([(t0 + 8.0 * k, by - 3.2 * k / 2), (t0 + 11.5 * k, by), (t0 + 8.0 * k, by + 3.2 * k / 2)],
                            fc="#F2C230", ec=INK, lw=0.5, zorder=4))
    leader(ax, (t0 + 6.2 * k, by + 5), (t0 + 50, by + 24), "TPU lock ring grips the arrow tip", fs=6.5)
    leader(ax, (t0 + 15 * k, by + 6), (t0 + 50, by + 14), "grey cap hides the tip", fs=6.5)
    leader(ax, (bx + 1, by - 14), (t0 + 50, by - 10), "soft TPU yoke against the skin:\nPPG + IR sensors look out here",
           fs=6.5)
    ax.text(t0 + tag.T_NECK * k / 2, by - 21, "Terrava Classic neck", ha="center", va="top", fontsize=7,
            fontweight="bold", color=GREEN)

    steps = [
        ("Charge", "USB-C on the bottom edge; full in ~1.5 h (250 mAh)."),
        ("Seal", "Press the TPU plug into the port until flush; check the gasket seam."),
        ("Register", "Terrava dashboard → Devices → add DevEUI, pair with the animal."),
        ("Load", "Cap off. Neck on the applicator's female spike, male button on the pin."),
        ("Apply", "Logo out, yoke to the ear, 20–25 mm above the lower margin; one stroke."),
        ("Cap & go", "Snap the grey cap in. Reports within 5 min; the sun tops it up."),
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
