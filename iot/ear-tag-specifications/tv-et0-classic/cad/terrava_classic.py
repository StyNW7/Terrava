"""Terrava Smart Ear Tag TV-ET0 "Classic": parametric enclosure (CadQuery).

The original 2025 Terrava concept (../../references/Prototype-Terrava-Ear-Tag-v1.png)
rebuilt as a printable, sealed product: the classic dangle-tag silhouette with the
logo on the front, a solar cell behind a window on the back and a soft TPU sensor
yoke where the ear pin holds the tag against the ear.

Shares its helpers, fonts and the traced logo with the Shield (TV-ET1) in
../../tv-et1-shield/cad/terrava_ear_tag.py.

    python terrava_classic.py            # build + checks + exports
    python terrava_classic.py --check    # build + checks only

Coordinate system (all mm, same as the Shield)
    X  across the tag (as seen from the front), 0 = centre line
    Y  up the tag, 0 = bottom edge
    Z  through the tag, 0 = rear face of the housing, +Z = outward (front)
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import cadquery as cq
from shapely.geometry import Polygon, box as sbox

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "models"
sys.path.insert(0, str(HERE.parents[1] / "tv-et1-shield" / "cad"))

import terrava_ear_tag as et1  # noqa: E402
from terrava_ear_tag import (  # noqa: E402
    DENSITY, FONT_BOLD, FONT_XBOLD, Component, box, cone, cyl, explode, logo_polys, overlap, polys_to_solid, rbox,
    text_polys, volume,
)

# ---------------------------------------------------------------------------
# Envelope and silhouette (proportions measured from the 2025 concept renders)
# ---------------------------------------------------------------------------
W = 42.0  # overall width
H = 66.0  # overall height
T = 17.0  # body thickness, rear face to logo face
T_NECK = 16.0  # the neck sits 1 mm below the front face (the step seen on the concept)
YOKE_T = 1.0  # TPU sensor yoke on the rear: 18.0 mm over the yoke
R_BOT = 6.5  # bottom corners
R_SHOULDER = 8.0  # convex shoulder
R_WAIST = 8.0  # concave fillet where the shoulder flank runs into the neck
R_TOP = 8.6  # top arc, concentric with the pin
FLANK_ANGLE = 37.6  # shoulder flank, degrees above horizontal
FLANK_THROUGH = (13.0, H - 22.0)
NECK_TAPER = 7.0  # neck sides lean out by this much going down (degrees)

WALL = 2.0
REAR = 1.6
FRONT = 1.6  # 0.8 mm left behind the 0.8 mm logo inlay
CH_FRONT, CH_REAR, CH_NECK = 1.2, 0.8, 1.0
SPLIT = 11.4  # parting plane; the cover is the front 5.6 mm like the concept
Y_LID = 47.0  # the cover ends at the neck base, the whole neck belongs to the housing
LID_GAP = 0.1
Y_CAV = Y_LID - LID_GAP - 2.4  # top wall of the cavity (room for the lip across the neck base)

# Lap joint + gasket: same section as the Shield
LIP_IN, LIP_OUT, LIP_H = et1.LIP_IN, et1.LIP_OUT, et1.LIP_H
GROOVE_OUT, GASKET_T, GROOVE_H = et1.GROOVE_OUT, et1.GASKET_T, et1.GROOVE_H

# Ear pin: standard two-piece male button from the ear side into the neck
PIN = (0.0, H - R_TOP)
PIN_BORE_D = 7.2
LOCK_Z0 = 5.0  # TPU lock ring seat, 6 mm behind the yoke face as on the Shield
LOCK_POCKET_D, LOCK_H = 9.8, 2.4
CAP_D, CAP_H = 11.0, 2.0  # grey "grommet" cap, flush with the neck front

# Screws: 2x M2x14 countersunk from the rear (the two seen on the concept back) into
# heat-set inserts in the cover; the top of the cover is held by a tongue in the neck.
SCREWS = [(-16.0, 4.4), (16.0, 4.4)]
SCREW_CLEAR_D, CSK_D = 2.3, 4.2
INSERT_D, INSERT_DEPTH = 3.2, 3.6
COVER_BOSS_R, BASE_STUB_R = 2.6, 2.0
TONGUE = (4.5, 1.8, 12.4, 13.8)  # half-width, reach into the neck, z0, z1
SLOT_CLEAR = 0.2

# Body sensors in the yoke: PPG right under the pin (firmest contact), IR beside it
MAX_AT = (0.0, 46.6)
MLX_AT = (-8.3, 37.5)
YOKE_Y0 = 31.6
YOKE_INSET = 1.4
YOKE_PEGS = [(-6.0, 53.5), (6.0, 53.5)]
PEG_D, PEG_H = 2.4, 1.1

# Solar: ANYSOLAR SM141K05L class mono cell (35 x 22 x 2.1, 154 mW) bonded behind a window
CELL_W, CELL_H, CELL_T = 35.0, 22.0, 2.1
CELL_CY = 19.55
WIN_W, WIN_H, WIN_R = 33.0, 20.0, 1.5
WIN_STEP = 0.5  # bezel step around the window on the rear face

# USB-C service port on the bottom edge (stack mounted components-down, so the
# receptacle centre sits at the same height as on the Shield)
STACK_Z0 = 6.9
USB_Z = STACK_Z0 + (10.26 - 8.63)
PORT_W, PORT_H, PORT_R = et1.PORT_W, et1.PORT_H, et1.PORT_R

# Front graphics
LOGO_H, LOGO_CY = 17.0, 25.6
WORD_CAP, WORD_CY = 5.0, 11.0
INLAY_DEPTH = 0.8


# ---------------------------------------------------------------------------
# Silhouette: a polygon with filleted corners, so every inset is exact
# ---------------------------------------------------------------------------
def _solve(n1, k1, n2, k2):
    det = n1[0] * n2[1] - n1[1] * n2[0]
    return ((k1 * n2[1] - n1[1] * k2) / det, (n1[0] * k2 - k1 * n2[0]) / det)


def corner_polygon() -> list[tuple[tuple[float, float], float]]:
    """(vertex, fillet radius) pairs, counter-clockwise from the bottom left."""
    t, a = math.radians(NECK_TAPER), math.radians(FLANK_ANGLE)
    n_neck = (math.cos(t), math.sin(t))  # outward normal of the right neck side
    k_neck = n_neck[1] * PIN[1] + R_TOP  # tangent to the top arc around the pin
    n_flank = (math.sin(a), math.cos(a))
    k_flank = n_flank[0] * FLANK_THROUGH[0] + n_flank[1] * FLANK_THROUGH[1]
    wx, wy = _solve(n_neck, k_neck, n_flank, k_flank)
    sy = (k_flank - n_flank[0] * W / 2) / n_flank[1]
    apex = (0.0, k_neck / n_neck[1])
    return [((-W / 2, 0.0), R_BOT), ((W / 2, 0.0), R_BOT), ((W / 2, sy), R_SHOULDER), ((wx, wy), R_WAIST),
            (apex, R_TOP), ((-wx, wy), R_WAIST), ((-W / 2, sy), R_SHOULDER)]


def _fillets():
    pts = corner_polygon()
    n = len(pts)
    out = []
    for i, (v, r) in enumerate(pts):
        p, q = pts[i - 1][0], pts[(i + 1) % n][0]
        din = ((v[0] - p[0]), (v[1] - p[1]))
        dout = ((q[0] - v[0]), (q[1] - v[1]))
        li, lo = math.hypot(*din), math.hypot(*dout)
        din, dout = (din[0] / li, din[1] / li), (dout[0] / lo, dout[1] / lo)
        cross = din[0] * dout[1] - din[1] * dout[0]
        phi = math.acos(max(-1.0, min(1.0, din[0] * dout[0] + din[1] * dout[1])))
        tl = r * math.tan(phi / 2)
        a = (v[0] - din[0] * tl, v[1] - din[1] * tl)
        b = (v[0] + dout[0] * tl, v[1] + dout[1] * tl)
        s = 1 if cross > 0 else -1
        c = (a[0] - s * din[1] * r, a[1] + s * din[0] * r)
        dv = (v[0] - c[0], v[1] - c[1])
        lv = math.hypot(*dv)
        m = (c[0] + r * dv[0] / lv, c[1] + r * dv[1] / lv)
        out.append((a, m, b))
    return out


_BASE_WIRE = None


def outline_wire() -> cq.Wire:
    global _BASE_WIRE
    if _BASE_WIRE is None:
        f = _fillets()
        edges = []
        for i, (a, m, b) in enumerate(f):
            prev_b = f[i - 1][2]
            edges.append(cq.Edge.makeLine(cq.Vector(*prev_b, 0), cq.Vector(*a, 0)))
            edges.append(cq.Edge.makeThreePointArc(cq.Vector(*a, 0), cq.Vector(*m, 0), cq.Vector(*b, 0)))
        _BASE_WIRE = cq.Wire.assembleEdges(edges)
    return _BASE_WIRE


def outline_shapely(d: float = 0.0, n: int = 24) -> Polygon:
    pts = []
    for a, m, b in _fillets():
        pts.append(a)
        arc = cq.Edge.makeThreePointArc(cq.Vector(*a, 0), cq.Vector(*m, 0), cq.Vector(*b, 0))
        for k in range(1, n + 1):
            p = arc.positionAt(k / n)
            pts.append((p.x, p.y))
    poly = Polygon(pts)
    return poly.buffer(-d, join_style=1) if d else poly


def prism(d: float, z0: float, z1: float) -> cq.Workplane:
    """Silhouette inset by d, extruded between z0 and z1."""
    w = outline_wire()
    if d:
        w = w.offset2D(-d, "arc")[0]
    face = cq.Face.makeFromWires(w)
    solid = cq.Solid.extrudeLinear(face, cq.Vector(0, 0, z1 - z0)).translate(cq.Vector(0, 0, z0))
    return cq.Workplane("XY").add(solid)


def ring(d_out: float, d_in: float, z0: float, z1: float) -> cq.Workplane:
    return prism(d_out, z0, z1).cut(prism(d_in, z0 - 1, z1 + 1))


def lid_fp(d: float, z0: float, z1: float) -> cq.Workplane:
    """Cover footprint (silhouette below the neck base) inset by d."""
    return prism(d, z0, z1).intersect(box(-50, -50, z0 - 1, 50, Y_LID - LID_GAP - d, z1 + 1))


def lid_ring(d_out: float, d_in: float, z0: float, z1: float) -> cq.Workplane:
    return lid_fp(d_out, z0, z1).cut(lid_fp(d_in, z0 - 1, z1 + 1))


def yz_prism(pts, x0=-30.0, x1=30.0) -> cq.Workplane:
    """Polygon drawn in the (Y, Z) plane, extruded across X."""
    return cq.Workplane("YZ", origin=(x0, 0, 0)).polyline(pts).close().extrude(x1 - x0)


# ---------------------------------------------------------------------------
# Graphics
# ---------------------------------------------------------------------------
def front_graphics() -> list[Polygon]:
    return logo_polys(LOGO_H, 0.0, LOGO_CY) + text_polys("Terrava", FONT_BOLD, WORD_CAP, 0.0, WORD_CY)


def rear_lettering() -> list[Polygon]:
    l1 = text_polys("TERRAVA  TV-ET0", FONT_XBOLD, 1.6, 0.0, 5.3, mirror=True)
    l2 = text_polys("LoRaWAN AS923  SOLAR", FONT_XBOLD, 1.1, 0.0, 2.6, mirror=True)
    return l1 + l2


def yoke_footprint() -> list[Polygon]:
    p = outline_shapely(YOKE_INSET).intersection(sbox(-50, YOKE_Y0, 50, 200))
    return explode(p.buffer(-1.5, join_style=1).buffer(1.5, join_style=1))


# ---------------------------------------------------------------------------
# Reference electronics (keep-out bodies used for fit checks and renders)
# ---------------------------------------------------------------------------
def electronics() -> list[Component]:
    c = []
    # Seeed XIAO ESP32S3 + Wio-SX1262 stack, mounted components-down on top of the battery
    xw, y0 = 17.8, WALL + 0.05

    def z(z_shield):  # Shield stack heights mirrored: z' = STACK_Z0 + (10.26 - z)
        return STACK_Z0 + (10.26 - z_shield)

    wio = box(-xw / 2, y0, z(3.0), xw / 2, y0 + 21.0, z(2.0))
    wio_parts = box(-6.0, y0 + 4.0, z(5.4), 6.0, y0 + 17.0, z(3.0))
    posts = box(-xw / 2, y0 + 1.0, z(6.0), -xw / 2 + 2.5, y0 + 20.0, z(3.0)).union(
        box(xw / 2 - 2.5, y0 + 1.0, z(6.0), xw / 2, y0 + 20.0, z(3.0)))
    xiao = box(-xw / 2, y0, z(7.0), xw / 2, y0 + 21.0, z(6.0))
    can = box(-6.5, y0 + 7.2, z(9.4), 6.5, y0 + 19.0, z(7.0))
    usb = box(-4.47, y0 - 0.6, z(10.26), 4.47, y0 + 6.75, z(7.0))
    c.append(Component("Wio-SX1262 LoRa board", wio.union(wio_parts).union(posts), (0.08, 0.33, 0.20),
                       "SX1262, 923 MHz, u.FL"))
    c.append(Component("XIAO ESP32S3", xiao, (0.10, 0.22, 0.40), "MCU, USB-C charger, BLE/Wi-Fi"))
    c.append(Component("ESP32-S3 shield", can, (0.78, 0.78, 0.80), "RF can"))
    c.append(Component("USB-C receptacle", usb, (0.82, 0.82, 0.84), "charge + firmware"))

    # Solar cell behind the rear window, LiPo 302535 on top of it
    c.append(Component("Solar cell SM141K05L", box(-CELL_W / 2, CELL_CY - CELL_H / 2, REAR + 0.02, CELL_W / 2,
                                                   CELL_CY + CELL_H / 2, REAR + 0.02 + CELL_T),
                       (0.06, 0.08, 0.16), "35 x 22 mm mono, 154 mW"))
    c.append(Component("LiPo 302535 250 mAh", rbox(0, 19.1, 35.0, 25.0, 1.0, 3.8, 6.8), (0.70, 0.71, 0.74),
                       "3.7 V pouch cell incl. PCM"))
    c.append(Component("Solar harvester", box(9.6, 9.0, 6.95, 18.4, 23.0, 9.95), (0.20, 0.45, 0.85),
                       "BQ25570-class boost charger"))

    # Upper body ("GNSS tower"): module, IMU, then the patch behind the logo
    zf = T - FRONT
    c.append(Component("GNSS module (L76K / ATGM336H)", box(-8.0, 29.0, 6.95, 8.0, 42.0, 9.35), (0.10, 0.36, 0.22),
                       "16 x 13 mm"))
    c.append(Component("6-axis IMU breakout", box(-6.35, 24.0, 9.45, 6.35, 36.7, 11.3), (0.40, 0.18, 0.55),
                       "<= 12.7 x 12.7 mm (MPU-6050 class)"))
    c.append(Component("GNSS ceramic patch 18x18", box(-9.0, 26.0, zf - 4.0, 9.0, 44.0, zf - 0.05),
                       (0.86, 0.83, 0.74), "passive, u.FL, faces out"))

    # LoRa FPC antenna bent along the inside of the left wall and shoulder
    fpc = ring(2.1, 2.3, 7.3, 15.0).intersect(box(-30, 8.6, 0, -9.5, 42.0, 20))
    c.append(Component("LoRa FPC antenna 923 MHz", fpc, (0.80, 0.50, 0.12), "<= 40 x 8 mm flex, u.FL"))

    # MLX90614 in TO-39: can face flush with the housing rear face, flange on a ledge
    mx, my = MLX_AT
    mlx = cyl(mx, my, 8.1 / 2, 0.0, 3.7).union(cyl(mx, my, 9.2 / 2, 3.7, 4.2)).union(cyl(mx, my, 4.4, 4.2, 5.5))
    c.append(Component("MLX90614 IR thermometer", mlx, (0.80, 0.80, 0.82), "TO-39, 90 deg FOV"))
    # MAX30102 on a <= 10 x 10 mm carrier, sensor face on the clear window
    ax_, ay = MAX_AT
    maxm = box(ax_ - 2.8, ay - 1.65, 1.02, ax_ + 2.8, ay + 1.65, 2.57).union(
        box(ax_ - 5.0, ay - 5.0, 2.57, ax_ + 5.0, ay + 5.0, 4.17))
    c.append(Component("MAX30102 PPG sensor", maxm, (0.12, 0.12, 0.14), "HR + SpO2, reflective"))
    return c


# ---------------------------------------------------------------------------
# Enclosure
# ---------------------------------------------------------------------------
def outer_body() -> cq.Workplane:
    body = prism(0, 0, T)
    body = body.faces(">Z").edges().chamfer(CH_FRONT)
    body = body.faces("<Z").edges().chamfer(CH_REAR)
    neck = prism(0, 0, T_NECK)
    neck = neck.faces(">Z").edges().chamfer(CH_NECK)
    neck = neck.faces("<Z").edges().chamfer(CH_REAR)
    return body.intersect(box(-50, -50, -1, 50, Y_LID, 30)).union(neck.intersect(box(-50, Y_LID, -1, 50, 200, 30)))


def shell() -> cq.Workplane:
    zf = T - FRONT
    s = outer_body().cut(prism(WALL, REAR, zf).intersect(box(-50, -50, 0, 50, Y_CAV, 30)))

    # --- solid features that grow from the walls ---------------------------
    for x, y in SCREWS:
        s = s.union(cyl(x, y, BASE_STUB_R, REAR - 0.1, SPLIT))
        s = s.union(cyl(x, y, COVER_BOSS_R, SPLIT, zf + 0.1))
    s = s.union(cyl(*MLX_AT, 5.7, REAR - 0.1, 6.4))
    s = s.union(rbox(*MAX_AT, 12.3, 12.3, 1.5, REAR - 0.1, 6.4))
    # solar cell locating ribs (rear wall, inside)
    cx0, cx1 = CELL_W / 2 + 0.15, CELL_W / 2 + 0.95
    cy0, cy1 = CELL_CY - CELL_H / 2 - 0.15, CELL_CY + CELL_H / 2 + 0.15
    for sx in (-1, 1):
        s = s.union(box(min(sx * cx0, sx * cx1), CELL_CY - 6, REAR - 0.1, max(sx * cx0, sx * cx1), CELL_CY + 6, REAR + 1.0))
    s = s.union(box(-6, cy1, REAR - 0.1, 6, cy1 + 0.8, REAR + 1.0))
    s = s.union(box(-6, cy0 - 0.8, REAR - 0.1, 6, cy0, REAR + 1.0))
    # GNSS patch frame on the inside of the cover
    px, py = 0.0, 35.0
    frame = rbox(px, py, 20.0, 20.0, 1.5, zf - 1.6, zf + 0.1).cut(box(px - 9.2, py - 9.2, zf - 2, px + 9.2, py + 9.2, zf + 1))
    frame = frame.cut(box(px - 3, py - 11, zf - 2, px + 3, py + 11, zf + 1))
    frame = frame.cut(box(px - 11, py - 3, zf - 2, px + 11, py + 3, zf + 1))
    s = s.union(frame.intersect(prism(WALL, 0, T)))

    # --- cuts ----------------------------------------------------------------
    x, y = PIN
    s = s.cut(cyl(x, y, PIN_BORE_D / 2, -1, LOCK_Z0 + 0.01))
    s = s.cut(cone(x, y, PIN_BORE_D / 2 + 1.0, PIN_BORE_D / 2, -0.001, 1.0))
    s = s.cut(cyl(x, y, LOCK_POCKET_D / 2, LOCK_Z0, T_NECK - CAP_H + 0.01))
    s = s.cut(cyl(x, y, CAP_D / 2, T_NECK - CAP_H, T_NECK + 1))
    s = s.cut(cyl(x, y, CAP_D / 2 + 0.3, T_NECK - 1.4, T_NECK - 1.0))  # snap groove for the cap bead

    for sx, sy in SCREWS:
        s = s.cut(cyl(sx, sy, SCREW_CLEAR_D / 2, -1, SPLIT + 0.01))
        s = s.cut(cone(sx, sy, CSK_D / 2, SCREW_CLEAR_D / 2, -0.001, (CSK_D - SCREW_CLEAR_D) / 2))
        s = s.cut(cyl(sx, sy, INSERT_D / 2, SPLIT, SPLIT + INSERT_DEPTH))

    # MLX: aperture for the can (8.4) with a ledge for the flange at z = 3.7
    s = s.cut(cyl(*MLX_AT, 8.4 / 2, -1, 3.7))
    s = s.cut(cyl(*MLX_AT, 9.5 / 2, 3.7, 6.5))
    # MAX: clear window recess on the rear face, aperture, module pocket
    s = s.cut(rbox(*MAX_AT, 9.0, 7.0, 1.5, -1, 1.0))
    s = s.cut(rbox(*MAX_AT, 6.4, 4.4, 1.0, -1, 2.41))
    s = s.cut(rbox(*MAX_AT, 10.3, 10.3, 0.5, 2.4, 6.5))

    # solar window with a small bezel step on the rear face
    s = s.cut(rbox(0, CELL_CY, WIN_W, WIN_H, WIN_R, -1, REAR + 0.01))
    s = s.cut(rbox(0, CELL_CY, WIN_W + 2 * WIN_STEP, WIN_H + 2 * WIN_STEP, WIN_R + WIN_STEP, -1, WIN_STEP))

    # USB-C service port
    port = cq.Workplane("XZ", origin=(0, WALL + 1.0, USB_Z)).sketch().rect(PORT_W, PORT_H).vertices() \
        .fillet(PORT_R).finalize().extrude(WALL + 2.0)
    s = s.cut(port)

    # yoke pegs, front logo inlay pocket, rear lettering
    for px_, py_ in YOKE_PEGS:
        s = s.cut(cyl(px_, py_, PEG_D / 2, -1, PEG_H + 0.1))
    s = s.cut(polys_to_solid(front_graphics(), T - INLAY_DEPTH, T + 0.5))
    s = s.cut(polys_to_solid(rear_lettering(), -0.5, 0.4))
    return s


def split_parts(s: cq.Workplane) -> tuple[cq.Workplane, cq.Workplane]:
    big = 200
    cover_zone = box(-big, -big, SPLIT, big, Y_LID - LID_GAP, big)
    housing = s.intersect(box(-big, -big, -big, big, big, SPLIT).union(box(-big, Y_LID, -big, big, big, big)))
    cover = s.intersect(cover_zone)

    port_keepout = box(-PORT_W / 2 - 0.4, -1, 0, PORT_W / 2 + 0.4, WALL + 0.5, T)
    lip = lid_ring(LIP_OUT, LIP_IN, SPLIT - 0.1, SPLIT + LIP_H).cut(port_keepout)
    housing = housing.union(lip)
    cover = cover.cut(lid_ring(GROOVE_OUT, LIP_IN + 0.4, SPLIT - 0.01, SPLIT + GROOVE_H))

    # top of the cover: 45 deg step down to the neck, and the tongue that hooks into the neck
    yt = Y_LID - LID_GAP
    cover = cover.cut(yz_prism([(yt - 1.0, T + 1), (yt - 1.0, T), (yt, T - 1.0), (yt + 1, T - 1.0), (yt + 1, T + 1)]))
    hw, reach, z0, z1 = TONGUE
    cover = cover.union(box(-hw, yt - 0.6, z0, hw, Y_LID + reach, z1))
    c = SLOT_CLEAR
    housing = housing.cut(box(-hw - c, Y_LID - 0.5, z0 - c, hw + c, Y_LID + reach + c, z1 + c))
    return housing, cover


# ---------------------------------------------------------------------------
# Small parts
# ---------------------------------------------------------------------------
def pin_cap() -> cq.Workplane:
    """Grey TPU cap, the "grommet" ring of the concept, modelled in place."""
    x, y = PIN
    cap = cyl(x, y, CAP_D / 2 - 0.08, T_NECK - CAP_H + 0.05, T_NECK)
    cap = cap.union(cyl(x, y, CAP_D / 2 + 0.22, T_NECK - 1.35, T_NECK - 1.05))
    cap = cap.cut(cyl(x, y, 3.6, T_NECK - CAP_H, T_NECK - CAP_H + 1.0))  # room for the pin tip
    cap = cap.cut(cyl(x, y, 2.3, T_NECK - 0.5, T_NECK + 1))  # the dark "hole" of the grommet
    return cap


def lock_ring() -> cq.Workplane:
    x, y = PIN
    r = cyl(x, y, LOCK_POCKET_D / 2 - 0.05, LOCK_Z0 + 0.02, LOCK_Z0 + LOCK_H - 0.05)
    r = r.cut(cyl(x, y, 1.7, LOCK_Z0 - 1, LOCK_Z0 + 3))
    r = r.cut(cone(x, y, 2.9, 1.7, LOCK_Z0, LOCK_Z0 + 1.2))  # lead-in for the arrow tip
    return r


def ppg_window() -> cq.Workplane:
    return rbox(*MAX_AT, 8.85, 6.85, 1.45, -YOKE_T, 1.0)


def gasket() -> cq.Workplane:
    g = lid_ring(LIP_OUT + 0.05, LIP_IN - 0.05, SPLIT + LIP_H, SPLIT + LIP_H + GASKET_T)
    return g.cut(box(-PORT_W / 2 - 0.4, -1, 0, PORT_W / 2 + 0.4, WALL + 0.5, T))


def usb_plug() -> cq.Workplane:
    w, h = PORT_W - 0.1, PORT_H - 0.1
    plug = cq.Workplane("XZ", origin=(0, WALL, USB_Z)).sketch().rect(w, h).vertices().fillet(PORT_R - 0.05) \
        .finalize().extrude(WALL)
    bead = cq.Workplane("XZ", origin=(0, WALL + 0.35, USB_Z)).sketch().rect(w + 0.5, h + 0.16).vertices() \
        .fillet(PORT_R + 0.1).finalize().extrude(0.35)
    plug = plug.union(bead)
    plug = plug.cut(box(-2.5, -0.1, USB_Z + h / 2 - 1.2, 2.5, 0.5, USB_Z + h / 2 + 1))  # pull groove
    plug = plug.cut(box(-4.65, WALL - 0.75, USB_Z - 1.78, 4.65, WALL + 1, USB_Z + 1.82))  # clears the receptacle lip
    return plug


def inlay(clearance: float) -> cq.Workplane:
    polys = front_graphics()
    if clearance:
        polys = [q for p in polys for q in explode(p.buffer(-clearance, join_style=2))]
    return polys_to_solid(polys, T - INLAY_DEPTH, T)


def yoke() -> cq.Workplane:
    """Soft TPU contact yoke: neck and shoulders of the rear face."""
    y = polys_to_solid(yoke_footprint(), -YOKE_T, 0.0)
    y = y.cut(cyl(*PIN, PIN_BORE_D / 2 + 0.2, -2, 1))
    y = y.cut(cone(PIN[0], PIN[1], PIN_BORE_D / 2 + 1.0, PIN_BORE_D / 2 + 0.2, -YOKE_T - 0.001, -YOKE_T + 0.8))
    y = y.cut(cyl(*MLX_AT, 8.4 / 2, -2, 1))
    y = y.cut(rbox(*MAX_AT, 9.0, 7.0, 1.5, -2, 1))
    for x, yy in YOKE_PEGS:
        y = y.union(cyl(x, yy, PEG_D / 2 - 0.05, -0.01, PEG_H))
    return y


def hardware() -> list[Component]:
    hw = []
    for x, y in SCREWS:
        head = cone(x, y, 1.9, 1.0, 0.05, 1.0)
        shank = cyl(x, y, 1.0, 1.0, 14.0)
        hw.append(Component("M2x14 countersunk screw", head.union(shank), (0.75, 0.76, 0.78), "A2 stainless"))
        ins = cyl(x, y, 1.6, SPLIT + 0.1, SPLIT + 3.1).cut(cyl(x, y, 1.0, SPLIT, SPLIT + 4))
        hw.append(Component("M2 heat-set insert", ins, (0.80, 0.62, 0.30), "brass, M2 x 3"))
    return hw


# ---------------------------------------------------------------------------
# Checks
# ---------------------------------------------------------------------------
ALLOWED_TOUCH = ({"XIAO ESP32S3", "ESP32-S3 shield"}, {"XIAO ESP32S3", "USB-C receptacle"})


def run_checks(parts: dict[str, cq.Workplane], comps: list[Component]) -> dict:
    report = {"collisions": [], "clearance_ok": True}
    shells = {k: parts[k] for k in ("housing", "cover")}
    for comp in comps:
        for name, sh in shells.items():
            v = overlap(comp.solid, sh)
            if v > 0.02:
                report["collisions"].append(f"{comp.name} x {name}: {v:.2f} mm3")
    for i, a in enumerate(comps):
        for b in comps[i + 1:]:
            v = overlap(a.solid, b.solid)
            if v > 0.02 and {a.name, b.name} not in ALLOWED_TOUCH:
                report["collisions"].append(f"{a.name} x {b.name}: {v:.2f} mm3")
    # the gasket is modelled uncompressed (0.8 mm into a 0.6 mm gap) so it is left out here
    for k in ("pin_cap", "lock_ring", "ppg_window", "usb_plug", "yoke"):
        for name, sh in shells.items():
            v = overlap(parts[k], sh)
            if v > 0.05:
                report["collisions"].append(f"{k} x {name}: {v:.2f} mm3")
    v = overlap(parts["yoke"], parts["ppg_window"])
    if v > 0.05:
        report["collisions"].append(f"yoke x ppg_window: {v:.2f} mm3")
    report["clearance_ok"] = not report["collisions"]
    return report


ELECTRONICS_G = {
    "XIAO ESP32S3 + Wio-SX1262": 5.5,
    "LiPo 302535 + PCM": 5.5,
    "Solar cell SM141K05L": 3.2,
    "Solar harvester board": 0.6,
    "GNSS module + 18 mm patch": 5.5,
    "MLX90614 (TO-39)": 1.1,
    "MAX30102 module": 0.6,
    "IMU breakout": 0.8,
    "FPC antenna + coax": 1.0,
    "Wiring, tape, silicone": 2.0,
    "2x M2 screws + inserts": 0.6,
}


def mass_report(parts: dict[str, cq.Workplane]) -> dict:
    mat = {"housing": "PETG", "cover": "PETG", "logo_inlay": "PETG", "pin_cap": "TPU", "lock_ring": "TPU",
           "gasket": "TPU", "usb_plug": "TPU", "yoke": "TPU", "ppg_window": "PC"}
    g = {k: round(volume(parts[k]) / 1000 * DENSITY[m], 2) for k, m in mat.items()}
    enclosure = round(sum(g.values()), 1)
    elec = round(sum(ELECTRONICS_G.values()), 1)
    return {"parts_g": g, "enclosure_g": enclosure, "electronics_g": elec, "total_g": round(enclosure + elec, 1)}


# ---------------------------------------------------------------------------
# Build + export
# ---------------------------------------------------------------------------
PART_COLORS = {
    "housing": (0.93, 0.92, 0.89),
    "cover": (0.93, 0.92, 0.89),
    "logo_inlay": (0.03, 0.40, 0.22),
    "pin_cap": (0.55, 0.56, 0.56),
    "lock_ring": (0.15, 0.15, 0.16),
    "ppg_window": (0.20, 0.22, 0.25),
    "gasket": (0.15, 0.15, 0.16),
    "usb_plug": (0.93, 0.92, 0.89),
    "yoke": (0.55, 0.56, 0.56),
}
ASSEMBLY_KEYS = ("housing", "cover", "logo_inlay", "pin_cap", "lock_ring", "gasket", "usb_plug", "ppg_window", "yoke")


def build() -> dict[str, cq.Workplane]:
    housing, cover = split_parts(shell())
    return {
        "housing": housing,
        "cover": cover,
        "logo_inlay": inlay(0.0),
        "logo_inlay_press_fit": inlay(0.06),
        "pin_cap": pin_cap(),
        "lock_ring": lock_ring(),
        "ppg_window": ppg_window(),
        "gasket": gasket(),
        "usb_plug": usb_plug(),
        "yoke": yoke(),
    }


def export_print_stl(name: str, step: Path, path: Path) -> None:
    """Mesh the exported STEP, then lay the mesh in its printing pose (z min = 0).

    Meshing the in-memory cover straight after the booleans left a few open edges;
    the STEP round-trip re-sews the shape and meshes watertight.
    """
    import numpy as np
    import trimesh

    cq.exporters.export(cq.importers.importStep(str(step)), str(path), tolerance=0.01, angularTolerance=0.08)
    m = trimesh.load(path, force="mesh")
    if name in ("cover", "logo_inlay", "logo_inlay_press_fit", "pin_cap"):
        m.apply_transform(trimesh.transformations.rotation_matrix(np.pi, (0, 1, 0)))  # front face down
    elif name == "usb_plug":
        m.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2, (1, 0, 0)))  # outer face down
    m.apply_translation((0, 0, -m.bounds[0][2]))
    m.export(path)


STL_NAMES = {
    "housing": "01-rear-housing",
    "cover": "02-front-cover",
    "logo_inlay": "03a-logo-inlay-multimaterial",
    "logo_inlay_press_fit": "03b-logo-inlay-press-fit",
    "pin_cap": "04-pin-cap-TPU-grey",
    "lock_ring": "05-pin-lock-ring-TPU",
    "gasket": "06-gasket-TPU",
    "usb_plug": "07-usb-c-plug-TPU",
    "ppg_window": "08-ppg-window-clear",
    "yoke": "09-sensor-yoke-TPU-grey",
}


def export_all(parts: dict[str, cq.Workplane], comps: list[Component], hw: list[Component]) -> None:
    (OUT / "stl").mkdir(parents=True, exist_ok=True)
    (OUT / "step").mkdir(parents=True, exist_ok=True)
    for key, fname in STL_NAMES.items():
        cq.exporters.export(parts[key], str(OUT / "step" / f"{fname}.step"))
        export_print_stl(key, OUT / "step" / f"{fname}.step", OUT / "stl" / f"{fname}.stl")

    assy = cq.Assembly(name="terrava_ear_tag_tv_et0_classic")
    for key in ASSEMBLY_KEYS:
        assy.add(parts[key], name=key, color=cq.Color(*PART_COLORS[key]))
    elec = cq.Assembly(name="electronics")
    for i, comp in enumerate(comps + hw):
        elec.add(comp.solid, name=f"{i:02d}_{comp.name.replace(' ', '_')}", color=cq.Color(*comp.color))
    assy.add(elec, name="electronics")
    assy.save(str(OUT / "step" / "terrava-classic-assembly.step"))
    assy.save(str(OUT / "terrava-classic-assembly.glb"))

    mesh_dir = OUT / "render-meshes"
    mesh_dir.mkdir(exist_ok=True)
    for key in ASSEMBLY_KEYS:
        src = cq.importers.importStep(str(OUT / "step" / f"{STL_NAMES[key]}.step"))
        cq.exporters.export(src, str(mesh_dir / f"{key}.stl"), tolerance=0.006, angularTolerance=0.05)
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

    parts = build()
    comps = electronics()
    hw = hardware()
    report = run_checks(parts, comps)
    report["mass"] = mass_report(parts)
    bb = parts["housing"].union(parts["cover"]).union(parts["yoke"]).val().BoundingBox()
    report["envelope_mm"] = [round(bb.xlen, 2), round(bb.ylen, 2), round(bb.zlen, 2)]
    report["body_mm"] = [W, H, T]
    cav = prism(WALL, REAR, T - FRONT).intersect(box(-50, -50, 0, 50, Y_CAV, 30))
    report["internal_volume_cm3"] = round(volume(cav) / 1000, 2)
    report["silhouette"] = {"corners": [[round(v[0], 2), round(v[1], 2), r] for v, r in corner_polygon()]}
    print(json.dumps(report, indent=2))
    if args.check:
        return
    export_all(parts, comps, hw)
    (OUT / "build-report.json").write_text(json.dumps(report, indent=2))
    print("exported to", OUT)


if __name__ == "__main__":
    main()
