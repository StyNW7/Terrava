"""Terrava Smart Ear Tag TV-ET1: parametric enclosure (CadQuery).

Builds every printable part, the reference electronics as keep-out bodies,
checks that nothing collides, and exports STEP / STL / GLB into ../models.

    pip install -r requirements.txt
    python terrava_ear_tag.py            # build + checks + exports
    python terrava_ear_tag.py --check    # build + checks only

Coordinate system (all mm)
    X  across the tag (as seen from the front), 0 = centre line
    Y  up the tag, 0 = bottom edge
    Z  through the tag, 0 = ear-side (rear) face, +Z = outward (front)
"""

from __future__ import annotations

import argparse
import json
import math
from dataclasses import dataclass
from pathlib import Path

import cadquery as cq
from shapely import affinity
from shapely.geometry import Polygon, shape
from shapely.ops import unary_union

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "models"
FONT_BOLD = HERE / "fonts" / "PlusJakartaSans-Bold.ttf"
FONT_XBOLD = HERE / "fonts" / "PlusJakartaSans-ExtraBold.ttf"

# ---------------------------------------------------------------------------
# Envelope
# ---------------------------------------------------------------------------
W = 46.0  # overall width
H = 68.0  # overall height
T = 14.0  # overall thickness
R_BOT = 10.0  # bottom corner radius
R_TOP = 18.0  # shoulder radius (gives the soft "shield" top)
WALL = 2.0  # side walls
REAR = 1.6  # ear-side wall
FRONT = 1.8  # front wall (1.0 mm left behind the 0.8 mm logo inlay)
CH_FRONT = 1.2  # 45 deg chamfers: print-friendly on the bed, crisp to the eye
CH_REAR = 0.8
SPLIT = 6.0  # parting plane between rear shell (base) and front shell (cover)

# Lap joint + gasket at the parting plane
LIP_IN, LIP_OUT = 2.0, 1.1  # base lip spans these insets from the outer skin
LIP_H = 1.5
GROOVE_OUT = 0.95  # cover keeps a 0.95 mm outer skin over the lip
GASKET_T = 0.8  # printed TPU gasket, compressed to 0.6 mm
GROOVE_H = LIP_H + GASKET_T - 0.2

# Ear pin (standard two-piece cattle tag male button) and lock
PIN = (0.0, 55.4)
PIN_BOSS_R = 6.5
PIN_BORE_D = 7.2  # male tip passes; rear entry chamfered
LOCK_POCKET_D, LOCK_POCKET_H = 9.8, 2.4  # TPU lock ring seat (in the cover)
TIP_CHAMBER_D = 8.0
CAP_D, CAP_H = 11.0, 2.0  # flush snap-in pin cap on the front face

# Screws: 4x M2x10 countersunk A2 stainless from the ear side into M2 heat-set inserts
SCREWS = [(-16.5, 6.5), (16.5, 6.5), (-6.0, 63.5), (6.0, 63.5)]
SCREW_CLEAR_D = 2.3
CSK_D = 4.2
INSERT_D, INSERT_DEPTH = 3.2, 4.5
COVER_BOSS_R = 2.6
BASE_STUB_R = 2.0

# Rear-facing body sensors, either side of the pin where the ear is clamped flat
SENSOR_X = 11.8
MLX_AT = (-SENSOR_X, PIN[1])  # MLX90614 IR thermometer, TO-39 can
MAX_AT = (SENSOR_X, PIN[1])  # MAX30102 PPG (heart rate / SpO2)

# USB-C service port (XIAO ESP32S3) on the bottom edge, sealed by a TPU plug
USB_Z = 8.63  # centre of the USB-C receptacle above the ear face
PORT_W, PORT_H, PORT_R = 12.6, 7.0, 2.0

# Front graphics
LOGO_H = 17.0  # cube mark height on the front
LOGO_CY = 35.0
WORD_CY = 19.2
WORD_CAP = 4.6  # cap height of "Terrava"
INLAY_DEPTH = 0.8
MIN_FEATURE = 0.45  # smallest printable gap/land with a 0.4 mm nozzle
LED_AT = (0.0, 5.6)  # status light: front wall thinned to 0.6 mm (white PETG glows)

# Solar edition front panel window
SOLAR_W, SOLAR_H, SOLAR_DEPTH, SOLAR_CY = 32.0, 17.0, 1.0, 15.0


# ---------------------------------------------------------------------------
# 2D helpers
# ---------------------------------------------------------------------------
def outline(d: float = 0.0, z0: float = 0.0) -> cq.Workplane:
    """Closed tag outline inset by d (exact arcs, so offsets stay concentric)."""
    rb, rt = R_BOT - d, R_TOP - d
    xb, yb = W / 2 - R_BOT, R_BOT  # bottom arc centres (+-xb, yb)
    xt, yt = W / 2 - R_TOP, H - R_TOP  # top arc centres (+-xt, yt)
    c45 = math.cos(math.radians(45))
    wp = cq.Workplane("XY", origin=(0, 0, z0)).moveTo(-xb, d).lineTo(xb, d)
    wp = wp.threePointArc((xb + rb * c45, yb - rb * c45), (xb + rb, yb))
    wp = wp.lineTo(xt + rt, yt)
    wp = wp.threePointArc((xt + rt * c45, yt + rt * c45), (xt, yt + rt))
    if xt > 0:
        wp = wp.lineTo(-xt, yt + rt)
    wp = wp.threePointArc((-xt - rt * c45, yt + rt * c45), (-xt - rt, yt))
    wp = wp.lineTo(-xb - rb, yb)
    wp = wp.threePointArc((-xb - rb * c45, yb - rb * c45), (-xb, d))
    return wp.close()


def prism(d: float, z0: float, z1: float) -> cq.Workplane:
    return outline(d, z0).extrude(z1 - z0)


def ring(d_out: float, d_in: float, z0: float, z1: float) -> cq.Workplane:
    return prism(d_out, z0, z1).cut(prism(d_in, z0 - 1, z1 + 1))


def cyl(x: float, y: float, r: float, z0: float, z1: float) -> cq.Workplane:
    return cq.Workplane("XY", origin=(x, y, z0)).circle(r).extrude(z1 - z0)


def box(x0, y0, z0, x1, y1, z1) -> cq.Workplane:
    return cq.Workplane("XY").box(x1 - x0, y1 - y0, z1 - z0, centered=False).translate((x0, y0, z0))


def rbox(cx, cy, w, h, r, z0, z1) -> cq.Workplane:
    """Rounded rectangle prism centred on (cx, cy)."""
    wp = cq.Workplane("XY", origin=(cx, cy, z0)).sketch().rect(w, h).vertices().fillet(r).finalize()
    return wp.extrude(z1 - z0)


def cone(x, y, r0, r1, z0, z1) -> cq.Workplane:
    solid = cq.Solid.makeCone(r0, r1, z1 - z0, pnt=cq.Vector(x, y, z0), dir=cq.Vector(0, 0, 1))
    return cq.Workplane("XY").add(solid)


def polys_to_solid(polys: list[Polygon], z0: float, z1: float) -> cq.Workplane | None:
    """Extrude shapely polygons (with holes) between z0 and z1."""
    solid = None
    for p in polys:
        if p.is_empty or p.area < 1e-3:
            continue
        ext = [tuple(c) for c in p.exterior.coords[:-1]]
        body = cq.Workplane("XY", origin=(0, 0, z0)).polyline(ext).close().extrude(z1 - z0)
        for hole in p.interiors:
            pts = [tuple(c) for c in hole.coords[:-1]]
            if Polygon(pts).area < 1e-3:
                continue
            body = body.cut(cq.Workplane("XY", origin=(0, 0, z0 - 0.1)).polyline(pts).close().extrude(z1 - z0 + 0.2))
        solid = body if solid is None else solid.union(body)
    return solid


def explode(geom) -> list[Polygon]:
    if geom.is_empty:
        return []
    return [g for g in getattr(geom, "geoms", [geom]) if isinstance(g, Polygon)]


# ---------------------------------------------------------------------------
# Graphics: logo mark and lettering as print-safe polygons
# ---------------------------------------------------------------------------
def logo_polys(height: float, cx: float, cy: float, min_feature: float = MIN_FEATURE) -> list[Polygon]:
    data = json.loads((HERE / "terrava_logo.json").read_text())
    polys = [affinity.scale(shape(g), height, height, origin=(0, 0)) for g in data["polygons"]]
    green = unary_union(polys)
    # Open up hairline white gaps (circuit traces) to at least min_feature so they
    # survive FDM, then drop any green slivers thinner than min_feature.
    inner_white = green.convex_hull.difference(green)
    widen = max(0.0, (min_feature - 0.012 * height) / 2)
    green = green.difference(inner_white.buffer(widen, join_style=2))
    green = green.buffer(-min_feature / 2.2, join_style=2).buffer(min_feature / 2.2, join_style=2)
    green = affinity.translate(green, cx, cy)
    return explode(green.simplify(0.02))


def text_polys(text: str, font: Path, cap_height: float, cx: float, cy: float,
               mirror: bool = False) -> list[Polygon]:
    from matplotlib.font_manager import FontProperties
    from matplotlib.textpath import TextPath

    prop = FontProperties(fname=str(font))
    rings = [Polygon(r).buffer(0) for r in TextPath((0, 0), text, size=100, prop=prop).to_polygons()
             if len(r) >= 3]
    rings = [r for r in rings if r.area > 1e-6]
    rings.sort(key=lambda p: p.area, reverse=True)
    geom = None
    for i, r in enumerate(rings):  # even-odd: counters inside letters become holes
        depth = sum(1 for j in range(i) if rings[j].contains(r.representative_point()))
        if geom is None:
            geom = r
        elif depth % 2 == 0:
            geom = geom.union(r)
        else:
            geom = geom.difference(r)
    cap = TextPath((0, 0), "H", size=100, prop=prop).get_extents().height
    s = cap_height / cap
    geom = affinity.scale(geom, s, s, origin=(0, 0))
    minx, _, maxx, _ = geom.bounds
    geom = affinity.translate(geom, cx - (minx + maxx) / 2, cy - cap_height / 2)
    if mirror:
        geom = affinity.scale(geom, -1, 1, origin=(cx, cy))
    return explode(geom.simplify(0.01))


def front_graphics(solar: bool) -> list[Polygon]:
    if solar:
        mark = logo_polys(13.0, 0.0, 39.0)
        word = text_polys("Terrava", FONT_BOLD, 3.9, 0.0, 28.6)
    else:
        mark = logo_polys(LOGO_H, 0.0, LOGO_CY)
        word = text_polys("Terrava", FONT_BOLD, WORD_CAP, 0.0, WORD_CY)
    return mark + word


def rear_lettering() -> list[Polygon]:
    # Read from behind (looking at the ear-side face), hence mirrored in model X.
    l1 = text_polys("TERRAVA", FONT_XBOLD, 2.4, 0.0, 22.5, mirror=True)
    l2 = text_polys("SMART EAR TAG  TV-ET1", FONT_XBOLD, 1.8, 0.0, 18.0, mirror=True)
    l3 = text_polys("LoRaWAN AS923  IP67", FONT_XBOLD, 1.8, 0.0, 14.4, mirror=True)
    return l1 + l2 + l3


# ---------------------------------------------------------------------------
# Reference electronics (keep-out bodies used for fit checks and renders)
# ---------------------------------------------------------------------------
@dataclass
class Component:
    name: str
    solid: cq.Workplane
    color: tuple[float, float, float]
    note: str


def electronics() -> list[Component]:
    c = []
    # Seeed XIAO ESP32S3 + Wio-SX1262 stack (21 x 17.8), USB-C on the bottom edge
    xw, y0 = 17.8, WALL + 0.05
    wio = box(-xw / 2, y0, 2.0, xw / 2, y0 + 21.0, 3.0)
    wio_parts = box(-6.0, y0 + 4.0, 3.0, 6.0, y0 + 17.0, 5.4)  # SX1262 module, B2B, u.FL
    xiao = box(-xw / 2, y0, 6.0, xw / 2, y0 + 21.0, 7.0)
    shield = box(-6.5, y0 + 7.2, 7.0, 6.5, y0 + 19.0, 9.4)  # ESP32-S3 can
    usb = box(-4.47, y0 - 0.6, 7.0, 4.47, y0 + 6.75, 7.0 + 3.26)
    posts = box(-xw / 2, y0 + 1.0, 3.0, -xw / 2 + 2.5, y0 + 20.0, 6.0).union(
        box(xw / 2 - 2.5, y0 + 1.0, 3.0, xw / 2, y0 + 20.0, 6.0))
    c.append(Component("Wio-SX1262 LoRa board", wio.union(wio_parts).union(posts), (0.08, 0.33, 0.20),
                       "SX1262, 923 MHz, u.FL"))
    c.append(Component("XIAO ESP32S3", xiao, (0.10, 0.22, 0.40), "MCU, USB-C charger, BLE/Wi-Fi"))
    c.append(Component("ESP32-S3 shield", shield, (0.78, 0.78, 0.80), "RF can"))
    c.append(Component("USB-C receptacle", usb, (0.82, 0.82, 0.84), "charge + firmware"))

    # LiPo 602535 (6 x 25 x 35 mm, ~500 mAh) + protection board, ear-side layer
    bat_y0 = y0 + 21.0 + 0.5
    c.append(Component("LiPo 602535 500 mAh", rbox(-1.5, bat_y0 + 12.5, 35.0, 25.0, 1.0, REAR + 0.2, REAR + 6.2),
                       (0.70, 0.71, 0.74), "3.7 V pouch cell"))
    c.append(Component("Battery PCM", box(16.0, bat_y0 + 3.0, REAR + 1.5, 19.2, bat_y0 + 22.0, REAR + 5.0),
                       (0.95, 0.70, 0.10), "protection board + JST-SH lead"))

    # Front layer (behind the logo): GNSS patch, GNSS module, IMU
    zf = T - FRONT  # inside face of the front wall
    patch_c = (11.2, 37.0)
    c.append(Component("GNSS ceramic patch 18x18", box(patch_c[0] - 9, patch_c[1] - 9, zf - 4.0,
                                                        patch_c[0] + 9, patch_c[1] + 9, zf - 0.05),
                       (0.86, 0.83, 0.74), "passive, u.FL, faces out"))
    c.append(Component("GNSS module (L76K / ATGM336H)", box(-20.4, 36.2, zf - 2.4, -4.4, 49.2, zf - 0.05),
                       (0.10, 0.36, 0.22), "16 x 13 mm"))
    c.append(Component("6-axis IMU breakout", box(-20.4, 23.4, zf - 2.2, -7.7, 36.1, zf - 0.05),
                       (0.40, 0.18, 0.55), "<= 12.7 x 12.7 mm (MPU-6050 class)"))

    # LoRa FPC antenna on the inside of the left wall
    c.append(Component("LoRa FPC antenna 923 MHz", box(-W / 2 + WALL + 0.02, 11.0, REAR + 0.6,
                                                       -W / 2 + WALL + 0.22, 49.0, zf - 0.6),
                       (0.80, 0.50, 0.12), "<= 40 x 10 mm flex, u.FL"))

    # MLX90614 in TO-39: cap 8.1 x 3.7 (front recessed 0.3 mm from the ear face), flange 9.2
    mx, my = MLX_AT
    mlx = cyl(mx, my, 8.1 / 2, 0.3, 4.0).union(cyl(mx, my, 9.2 / 2, 4.0, 4.5)).union(
        cyl(mx, my, 4.4, 4.5, 5.8))
    c.append(Component("MLX90614 IR thermometer", mlx, (0.80, 0.80, 0.82), "TO-39, 90 deg FOV"))
    # MAX30102 on a <= 10 x 10 mm carrier, sensor face against the window
    ax, ay = MAX_AT
    maxm = box(ax - 2.8, ay - 1.65, REAR + 0.02, ax + 2.8, ay + 1.65, REAR + 1.55).union(
        box(ax - 5.0, ay - 5.0, REAR + 1.55, ax + 5.0, ay + 5.0, REAR + 3.15))
    c.append(Component("MAX30102 PPG sensor", maxm, (0.12, 0.12, 0.14), "HR + SpO2, reflective"))
    return c


# ---------------------------------------------------------------------------
# Enclosure
# ---------------------------------------------------------------------------
def outer_body() -> cq.Workplane:
    body = prism(0, 0, T)
    body = body.faces(">Z").edges().chamfer(CH_FRONT)
    body = body.faces("<Z").edges().chamfer(CH_REAR)
    return body


def shell(solar: bool) -> cq.Workplane:
    s = outer_body().cut(prism(WALL, REAR, T - FRONT))
    zf = T - FRONT

    # --- solid features that grow from the walls ---------------------------
    s = s.union(cyl(*PIN, PIN_BOSS_R, REAR - 0.1, zf + 0.1))
    for x, y in SCREWS:
        s = s.union(cyl(x, y, BASE_STUB_R, REAR - 0.1, SPLIT))
        s = s.union(cyl(x, y, COVER_BOSS_R, SPLIT, zf + 0.1))
    # MLX tube and MAX pocket walls (base side)
    s = s.union(cyl(*MLX_AT, 5.7, REAR - 0.1, SPLIT))
    s = s.union(rbox(*MAX_AT, 12.3, 12.3, 1.5, REAR - 0.1, SPLIT))
    # battery corner guides (base) and XIAO cradle guides
    bat_y0, bat_y1 = WALL + 0.05 + 21.5, WALL + 0.05 + 46.5
    for sx in (-1, 1):
        x_edge = -19.25 if sx < 0 else 19.45
        for y_edge, dy in ((bat_y0, 1), (bat_y1, -1)):
            s = s.union(box(min(x_edge, x_edge + sx * 1.0), y_edge + (0 if dy > 0 else -4),
                            REAR - 0.1, max(x_edge, x_edge + sx * 1.0), y_edge + (4 if dy > 0 else 0), REAR + 3.0))
    xw = 17.8 / 2 + 0.2
    for sx in (-1, 1):
        s = s.union(box(sx * xw if sx > 0 else -xw - 1.0, WALL + 6.0, REAR - 0.1,
                        sx * xw + 1.0 if sx > 0 else -xw, WALL + 17.0, REAR + 4.2))
    # front-layer locating ribs (cover side): GNSS patch frame
    px, py = 11.2, 37.0
    frame = rbox(px, py, 20.0, 20.0, 1.5, zf - 1.6, zf + 0.1).cut(box(px - 9.2, py - 9.2, zf - 2, px + 9.2, py + 9.2, zf + 1))
    frame = frame.cut(box(px - 3, py - 11, zf - 2, px + 3, py + 11, zf + 1))  # cable / feed gaps
    frame = frame.cut(box(px - 11, py - 3, zf - 2, px + 11, py + 3, zf + 1))
    s = s.union(frame.intersect(prism(WALL, 0, T)))

    # --- cuts ----------------------------------------------------------------
    x, y = PIN
    s = s.cut(cyl(x, y, PIN_BORE_D / 2, -1, SPLIT + 0.01))
    s = s.cut(cone(x, y, PIN_BORE_D / 2 + 1.0, PIN_BORE_D / 2, -0.001, 1.0))
    s = s.cut(cyl(x, y, LOCK_POCKET_D / 2, SPLIT, SPLIT + LOCK_POCKET_H))
    s = s.cut(cyl(x, y, TIP_CHAMBER_D / 2, SPLIT, T - CAP_H + 0.01))
    s = s.cut(cyl(x, y, CAP_D / 2, T - CAP_H, T + 1))
    s = s.cut(cyl(x, y, CAP_D / 2 + 0.3, T - 1.4, T - 1.0))  # snap groove for the cap bead

    for sx, sy in SCREWS:
        s = s.cut(cyl(sx, sy, SCREW_CLEAR_D / 2, -1, SPLIT + 0.01))
        s = s.cut(cone(sx, sy, CSK_D / 2, SCREW_CLEAR_D / 2, -0.001, (CSK_D - SCREW_CLEAR_D) / 2))
        s = s.cut(cyl(sx, sy, INSERT_D / 2, SPLIT, SPLIT + INSERT_DEPTH))

    # MLX: aperture for the can (8.4) with a ledge for the flange at z = 4.0
    s = s.cut(cyl(*MLX_AT, 8.4 / 2, -1, 4.0))
    s = s.cut(cyl(*MLX_AT, 9.5 / 2, 4.0, SPLIT + 0.01))
    # MAX: clear window recess on the ear face, aperture, module pocket
    s = s.cut(rbox(*MAX_AT, 9.0, 7.0, 1.5, -1, 1.0))
    s = s.cut(rbox(*MAX_AT, 6.4, 4.4, 1.0, -1, REAR + 0.01))
    s = s.cut(rbox(*MAX_AT, 10.3, 10.3, 0.5, REAR, SPLIT + 0.01))

    # USB-C service port
    port = cq.Workplane("XZ", origin=(0, WALL + 1.0, USB_Z)).sketch().rect(PORT_W, PORT_H).vertices() \
        .fillet(PORT_R).finalize().extrude(WALL + 2.0)
    s = s.cut(port)
    # status light: thin the front wall to 0.6 mm from inside
    s = s.cut(cyl(*LED_AT, 1.6, zf - 0.5, T - 0.6))

    # front graphics: flush inlay pocket
    g = polys_to_solid(front_graphics(solar), T - INLAY_DEPTH, T + 0.5)
    s = s.cut(g)
    if solar:
        s = s.cut(rbox(0, SOLAR_CY, SOLAR_W, SOLAR_H, 1.6, T - SOLAR_DEPTH, T + 1))
        s = s.cut(cyl(13.0, SOLAR_CY + 5.5, 0.9, zf - 0.5, T))  # solar lead feed-through
    # rear lettering, 0.4 mm deep
    s = s.cut(polys_to_solid(rear_lettering(), -0.5, 0.4))
    return s


def split_parts(s: cq.Workplane) -> tuple[cq.Workplane, cq.Workplane]:
    big = 200
    lower = box(-big, -big, -big, big, big, SPLIT)
    upper = box(-big, -big, SPLIT, big, big, big)
    lip = ring(LIP_OUT, LIP_IN, SPLIT - 0.1, SPLIT + LIP_H)
    port_keepout = box(-PORT_W / 2 - 0.4, -1, 0, PORT_W / 2 + 0.4, WALL + 0.5, T)
    lip = lip.cut(port_keepout)
    base = s.intersect(lower).union(lip)
    groove = ring(GROOVE_OUT, LIP_IN + 0.4, SPLIT - 0.01, SPLIT + GROOVE_H)
    cover = s.intersect(upper).cut(groove)
    return base, cover


# ---------------------------------------------------------------------------
# Small parts
# ---------------------------------------------------------------------------
def pin_cap() -> cq.Workplane:
    """Snap-in TPU cap, modelled in place (front face flush at z = T)."""
    x, y = PIN
    cap = cyl(x, y, CAP_D / 2 - 0.08, T - CAP_H + 0.05, T)
    cap = cap.union(cyl(x, y, CAP_D / 2 + 0.22, T - 1.35, T - 1.05))
    cap = cap.cut(cyl(x, y, 3.6, T - CAP_H, T - CAP_H + 1.0))  # room for the pin tip
    cap = cap.cut(cyl(x, y, 3.0, T - 0.25, T + 1).cut(cyl(x, y, 2.4, T - 0.3, T + 1)))  # fine ring
    return cap


def lock_ring() -> cq.Workplane:
    x, y = PIN
    r = cyl(x, y, LOCK_POCKET_D / 2 - 0.1, SPLIT + 0.02, SPLIT + LOCK_POCKET_H - 0.05)
    r = r.cut(cyl(x, y, 1.7, SPLIT - 1, SPLIT + 3))
    r = r.cut(cone(x, y, 2.9, 1.7, SPLIT, SPLIT + 1.2))  # lead-in for the arrow tip
    return r


def ppg_window() -> cq.Workplane:
    return rbox(*MAX_AT, 8.85, 6.85, 1.45, 0.0, 1.0)


def gasket() -> cq.Workplane:
    g = ring(LIP_OUT + 0.05, LIP_IN - 0.05, SPLIT + LIP_H, SPLIT + LIP_H + GASKET_T)
    return g.cut(box(-PORT_W / 2 - 0.4, -1, 0, PORT_W / 2 + 0.4, WALL + 0.5, T))


def usb_plug() -> cq.Workplane:
    w, h = PORT_W - 0.1, PORT_H - 0.1
    plug = cq.Workplane("XZ", origin=(0, WALL, USB_Z)).sketch().rect(w, h).vertices().fillet(PORT_R - 0.05) \
        .finalize().extrude(WALL)
    bead = cq.Workplane("XZ", origin=(0, WALL + 0.35, USB_Z)).sketch().rect(w + 0.5, h + 0.16).vertices() \
        .fillet(PORT_R + 0.1).finalize().extrude(0.35)
    plug = plug.union(bead)
    plug = plug.cut(box(-2.5, -0.1, USB_Z + h / 2 - 1.2, 2.5, 0.5, USB_Z + h / 2 + 1))  # pull groove
    plug = plug.cut(box(-4.65, WALL - 0.75, 6.85, 4.65, WALL + 1, 10.45))  # clears the receptacle lip
    return plug


def inlay(solar: bool, clearance: float) -> cq.Workplane:
    polys = front_graphics(solar)
    if clearance:
        polys = [q for p in polys for q in explode(p.buffer(-clearance, join_style=2))]
    return polys_to_solid(polys, T - INLAY_DEPTH, T)


def hardware() -> list[Component]:
    hw = []
    for x, y in SCREWS:
        head = cone(x, y, 1.9, 1.0, 0.05, 1.0)
        shank = cyl(x, y, 1.0, 1.0, 10.0)
        hw.append(Component("M2x10 countersunk screw", head.union(shank), (0.75, 0.76, 0.78), "A2 stainless"))
        ins = cyl(x, y, 1.6, SPLIT + 0.1, SPLIT + 3.1).cut(cyl(x, y, 1.0, SPLIT, SPLIT + 4))
        hw.append(Component("M2 heat-set insert", ins, (0.80, 0.62, 0.30), "brass, M2 x 3"))
    return hw


# ---------------------------------------------------------------------------
# Checks
# ---------------------------------------------------------------------------
def volume(wp: cq.Workplane) -> float:
    return sum(s.Volume() for s in wp.solids().vals())


def overlap(a: cq.Workplane, b: cq.Workplane) -> float:
    try:
        return volume(a.intersect(b))
    except Exception:  # empty intersection on some OCCT builds
        return 0.0


def run_checks(parts: dict[str, cq.Workplane], comps: list[Component]) -> dict:
    report = {"collisions": [], "clearance_ok": True}
    shells = {k: parts[k] for k in ("base", "cover")}
    for comp in comps:
        for name, sh in shells.items():
            v = overlap(comp.solid, sh)
            if v > 0.02:
                report["collisions"].append(f"{comp.name} x {name}: {v:.2f} mm3")
    for i, a in enumerate(comps):
        for b in comps[i + 1:]:
            v = overlap(a.solid, b.solid)
            if v > 0.02 and {a.name, b.name} not in ({"XIAO ESP32S3", "ESP32-S3 shield"}, {"XIAO ESP32S3", "USB-C receptacle"}):
                report["collisions"].append(f"{a.name} x {b.name}: {v:.2f} mm3")
    # the gasket is modelled uncompressed (0.8 mm into a 0.6 mm gap) so it is left out here
    small = {k: parts[k] for k in ("pin_cap", "lock_ring", "ppg_window", "usb_plug")}
    for k, p in small.items():
        for name, sh in shells.items():
            v = overlap(p, sh)
            if v > 0.05:
                report["collisions"].append(f"{k} x {name}: {v:.2f} mm3")
    report["clearance_ok"] = not report["collisions"]
    return report


DENSITY = {"PETG": 1.27, "TPU": 1.21, "PC": 1.20}
ELECTRONICS_G = {
    "XIAO ESP32S3 + Wio-SX1262": 5.5,
    "LiPo 602535 + PCM": 10.0,
    "GNSS module + 18 mm patch": 5.5,
    "MLX90614 (TO-39)": 1.1,
    "MAX30102 module": 0.6,
    "IMU breakout": 0.8,
    "FPC antenna + coax": 1.0,
    "Wiring, tape, silicone": 2.0,
    "4x M2 screws + inserts": 1.2,
}


def mass_report(parts: dict[str, cq.Workplane]) -> dict:
    infill = 1.0  # walls this thin print effectively solid
    mat = {"base": "PETG", "cover": "PETG", "logo_inlay": "PETG", "pin_cap": "TPU", "lock_ring": "TPU",
           "gasket": "TPU", "usb_plug": "TPU", "ppg_window": "PC"}
    g = {}
    for k, m in mat.items():
        g[k] = round(volume(parts[k]) / 1000 * DENSITY[m] * infill, 2)
    enclosure = round(sum(g.values()), 1)
    elec = round(sum(ELECTRONICS_G.values()), 1)
    return {"parts_g": g, "enclosure_g": enclosure, "electronics_g": elec, "total_g": round(enclosure + elec, 1)}


# ---------------------------------------------------------------------------
# Build + export
# ---------------------------------------------------------------------------
PART_COLORS = {
    "base": (0.03, 0.36, 0.21),
    "cover": (0.93, 0.92, 0.89),
    "logo_inlay": (0.03, 0.40, 0.22),
    "pin_cap": (0.03, 0.40, 0.22),
    "lock_ring": (0.15, 0.15, 0.16),
    "ppg_window": (0.20, 0.22, 0.25),
    "gasket": (0.15, 0.15, 0.16),
    "usb_plug": (0.93, 0.92, 0.89),
}


def build(solar: bool = False) -> dict[str, cq.Workplane]:
    s = shell(solar)
    base, cover = split_parts(s)
    return {
        "base": base,
        "cover": cover,
        "logo_inlay": inlay(solar, 0.0),
        "logo_inlay_press_fit": inlay(solar, 0.06),
        "pin_cap": pin_cap(),
        "lock_ring": lock_ring(),
        "ppg_window": ppg_window(),
        "gasket": gasket(),
        "usb_plug": usb_plug(),
    }


# Print orientation: each STL is exported lying in its printing pose.
def print_pose(name: str, wp: cq.Workplane) -> cq.Workplane:
    if name in ("cover", "cover_solar", "logo_inlay", "logo_inlay_press_fit", "pin_cap",
                "cover_solar_logo_inlay"):
        wp = wp.rotate((0, 0, 0), (0, 1, 0), 180)  # front face down on the bed
    elif name == "usb_plug":
        wp = wp.rotate((0, 0, 0), (1, 0, 0), 90)  # outer face down
    zmin = cq.Compound.makeCompound(wp.solids().vals()).BoundingBox().zmin
    return wp.translate((0, 0, -zmin))


def export_all(parts: dict[str, cq.Workplane], solar_parts: dict[str, cq.Workplane], comps: list[Component],
               hw: list[Component]) -> None:
    (OUT / "stl").mkdir(parents=True, exist_ok=True)
    (OUT / "step").mkdir(parents=True, exist_ok=True)
    stl_names = {
        "base": "01-rear-shell-base",
        "cover": "02-front-shell-cover",
        "logo_inlay": "03a-logo-inlay-multimaterial",
        "logo_inlay_press_fit": "03b-logo-inlay-press-fit",
        "pin_cap": "04-pin-cap-TPU",
        "lock_ring": "05-pin-lock-ring-TPU",
        "gasket": "06-gasket-TPU",
        "usb_plug": "07-usb-c-plug-TPU",
        "ppg_window": "08-ppg-window-clear",
    }
    for key, fname in stl_names.items():
        posed = print_pose(key, parts[key])
        cq.exporters.export(posed, str(OUT / "stl" / f"{fname}.stl"), tolerance=0.01, angularTolerance=0.08)
        cq.exporters.export(parts[key], str(OUT / "step" / f"{fname}.step"))
    for key, fname in (("cover", "02s-front-shell-cover-solar"), ("logo_inlay", "03s-logo-inlay-solar-multimaterial")):
        posed = print_pose("cover_solar" if key == "cover" else "cover_solar_logo_inlay", solar_parts[key])
        cq.exporters.export(posed, str(OUT / "stl" / f"{fname}.stl"), tolerance=0.01, angularTolerance=0.08)
        cq.exporters.export(solar_parts[key], str(OUT / "step" / f"{fname}.step"))

    # Assembly with the reference electronics (STEP keeps names + colours, GLB for the web viewer)
    assy = cq.Assembly(name="terrava_ear_tag_tv_et1")
    for key in ("base", "cover", "logo_inlay", "pin_cap", "lock_ring", "gasket", "usb_plug", "ppg_window"):
        assy.add(parts[key], name=key, color=cq.Color(*PART_COLORS[key]))
    elec = cq.Assembly(name="electronics")
    for i, comp in enumerate(comps + hw):
        elec.add(comp.solid, name=f"{i:02d}_{comp.name.replace(' ', '_')}", color=cq.Color(*comp.color))
    assy.add(elec, name="electronics")
    assy.save(str(OUT / "step" / "terrava-ear-tag-assembly.step"))
    assy.save(str(OUT / "terrava-ear-tag-assembly.glb"))

    # Per-part meshes in assembly coordinates for the renderer
    mesh_dir = OUT / "render-meshes"
    mesh_dir.mkdir(exist_ok=True)
    for key in ("base", "cover", "logo_inlay", "pin_cap", "lock_ring", "gasket", "usb_plug", "ppg_window"):
        cq.exporters.export(parts[key], str(mesh_dir / f"{key}.stl"), tolerance=0.006, angularTolerance=0.05)
    for key in ("cover", "logo_inlay"):
        cq.exporters.export(solar_parts[key], str(mesh_dir / f"solar_{key}.stl"), tolerance=0.006,
                            angularTolerance=0.05)
    meta = []
    for i, comp in enumerate(comps + hw):
        fn = f"comp_{i:02d}.stl"
        cq.exporters.export(comp.solid, str(mesh_dir / fn), tolerance=0.02, angularTolerance=0.1)
        meta.append({"file": fn, "name": comp.name, "color": comp.color, "note": comp.note})
    (mesh_dir / "components.json").write_text(json.dumps(meta, indent=1))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="build and verify only, no exports")
    args = ap.parse_args()

    parts = build(solar=False)
    comps = electronics()
    hw = hardware()
    report = run_checks(parts, comps)
    report["mass"] = mass_report(parts)
    bb = parts["base"].union(parts["cover"]).val().BoundingBox()
    report["envelope_mm"] = [round(bb.xlen, 2), round(bb.ylen, 2), round(bb.zlen, 2)]
    report["internal_volume_cm3"] = round(volume(prism(WALL, REAR, T - FRONT)) / 1000, 2)
    print(json.dumps(report, indent=2))
    if args.check:
        return
    solar_parts = build(solar=True)
    export_all(parts, solar_parts, comps, hw)
    (OUT / "build-report.json").write_text(json.dumps(report, indent=2))
    print("exported to", OUT)


if __name__ == "__main__":
    main()
