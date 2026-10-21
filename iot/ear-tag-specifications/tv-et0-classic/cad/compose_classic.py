"""Composite images for the Classic (run after render_classic.py).

    python compose_classic.py
      -> ../images/00-terrava-classic-overview.png   one-page product overview
      -> ../images/08-concept-vs-cad.png             2025 concept views next to the CAD views
      -> ../../images/00-terrava-ear-tag-family.png  Classic + Shield side by side
"""

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
SHIELD = HERE.parents[1] / "tv-et1-shield"
sys.path.insert(0, str(SHIELD / "cad"))

import compose_overview as base  # noqa: E402  (the Shield's poster kit)
from compose_overview import GREEN, INK, LINE, LOGO, MUTED, SOFT, card, font  # noqa: E402

IMG = HERE.parent / "images"
REN = IMG / "renders"
ROOT_IMG = HERE.parents[1] / "images"
REFERENCE = HERE.parents[1] / "references" / "Prototype-Terrava-Ear-Tag-v1.png"
REPORT = json.loads((HERE.parent / "models" / "build-report.json").read_text())
SHIELD_REPORT = json.loads((SHIELD / "models" / "build-report.json").read_text())
W, H = 3200, 2000


def header(canvas, title, subtitle, tagline, sub2):
    d = ImageDraw.Draw(canvas)
    logo = Image.open(LOGO).convert("RGBA").resize((150, 150), Image.LANCZOS)
    canvas.paste(logo, (90, 70), logo)
    d.text((270, 78), title, font=font("xb", 96), fill=GREEN)
    d.text((274, 190), subtitle, font=font("b", 34), fill=INK)
    d.text((canvas.width - 90, 96), tagline, font=font("b", 56), fill=INK, anchor="ra")
    d.text((canvas.width - 90, 176), sub2, font=font("m", 32), fill=MUTED, anchor="ra")


def spec_panel(canvas, box, specs, title="Specifications", key_w=250):
    d = ImageDraw.Draw(canvas)
    x0, y0, x1, y1 = box
    d.rounded_rectangle(box, radius=36, fill=GREEN)
    d.text((x0 + 50, y0 + 40), title, font=font("xb", 46), fill=(255, 255, 255))
    for i, (k, v) in enumerate(specs):
        yy = y0 + 125 + i * 56
        d.text((x0 + 50, yy), k, font=font("m", 30), fill=(190, 225, 205))
        d.text((x0 + 50 + key_w, yy), v, font=font("b", 30), fill=(255, 255, 255))


def classic_specs():
    m, env = REPORT["mass"], REPORT["envelope_mm"]
    return [
        ("Envelope", f"{env[0]:g} × {env[1]:g} × {env[2]:g} mm"),
        ("Weight", f"≈ {m['total_g']:.0f} g  (shell {m['enclosure_g']:.0f} g)"),
        ("Radio", "LoRaWAN AS923-2 · SX1262"),
        ("Sensing", "IR temp · HR/SpO₂ · IMU · GNSS"),
        ("Power", "LiPo 250 mAh · 154 mW solar · USB-C"),
        ("Sealing", "lap joint + TPU gasket · IP67 target"),
        ("Mounting", "standard male button, dangle"),
    ]


def overview():
    canvas = Image.new("RGB", (W, H), SOFT)
    header(canvas, "Terrava", "SMART EAR TAG  ·  TV-ET0 CLASSIC  ·  3D-PRINTABLE ENCLOSURE",
           "The original. Re-engineered.", "The 2025 dangle tag, now sealed, solar-assisted and sensing at the ear.")
    hero = Image.open(REN / "01-hero-front.png").convert("RGB")
    rear = Image.open(REN / "02-hero-rear-solar-sensors.png").convert("RGB")
    expl = Image.open(REN / "03-exploded-view.png").convert("RGB")
    inner = Image.open(REN / "04-internal-layout.png").convert("RGB")
    cw = Image.open(REN / "05-colorways.png").convert("RGB")
    card(canvas, (90, 290, 1180, 1300), hero, "Front", "logo inlay · grey grommet cap · neck step")
    card(canvas, (1220, 290, 1900, 1300), rear, "Back", "solar cell · TPU sensor yoke · PPG + IR")
    card(canvas, (1940, 290, 3110, 1300), expl, "Exploded", "housing + cover · hook + 2× M2 · TPU parts")
    card(canvas, (90, 1340, 900, 1900), inner, "Inside", "XIAO ESP32S3 + SX1262 · GNSS · 250 mAh")
    card(canvas, (940, 1340, 1900, 1900), cw, "Colourways", "Mint (2025 homage) · Signature · Stealth")
    spec_panel(canvas, (1940, 1340, 3110, 1900), classic_specs())
    out = IMG / "00-terrava-classic-overview.png"
    canvas.save(out, optimize=True)
    print("wrote", out)


def _view(name, h_px):
    im = Image.open(REN / f"view-{name}.png").convert("RGBA")
    bb = im.getchannel("A").getbbox()
    im = im.crop(bb)
    s = h_px / im.height
    return im.resize((max(1, int(im.width * s)), h_px), Image.LANCZOS)


def comparison():
    canvas = Image.new("RGB", (W, 1900), SOFT)
    header(canvas, "Terrava", "TV-ET0 CLASSIC  ·  FROM THE 2025 CONCEPT TO A PRINTABLE PART",
           "Same tag. Now it fits.", "Concept renders (top) and the CAD built from them (bottom), same views.")
    d = ImageDraw.Draw(canvas)
    ref = Image.open(REFERENCE).convert("RGB")
    concept = {  # crops of the reference collage (front, back, left, right views)
        "front": (70, 196, 232, 452), "rear": (268, 196, 434, 452),
        "left": (472, 196, 564, 452), "right": (614, 196, 710, 452),
    }
    labels = {"front": "FRONT", "rear": "BACK", "left": "LEFT", "right": "RIGHT"}
    # the concept's LEFT view shows the front face on the left, which is the tag's +X side
    cad_view = {"front": "front", "rear": "rear", "left": "right", "right": "left"}
    x0, row_h = 90, 660
    slots = [(x0, 470), (x0 + 520, 470), (x0 + 1040, 260), (x0 + 1340, 260)]
    for row, ytop in ((0, 300), (1, 1060)):
        d.rounded_rectangle((x0 - 30, ytop - 20, x0 + 1640, ytop + row_h + 60), radius=36, fill=(255, 255, 255),
                            outline=LINE, width=3)
        d.text((x0, ytop), "2025 CONCEPT RENDER" if row == 0 else "2026 CAD · TV-ET0 CLASSIC",
               font=font("b", 34), fill=GREEN if row else MUTED)
        for (k, box), (sx, sw) in zip(concept.items(), slots):
            if row == 0:
                im = ref.crop(box)
                im = im.resize((int(im.width * (row_h - 120) / im.height), row_h - 120), Image.LANCZOS)
                canvas.paste(im, (sx + (sw - im.width) // 2, ytop + 70))
            else:
                im = _view(cad_view[k], row_h - 120)
                canvas.paste(im, (sx + (sw - im.width) // 2, ytop + 70), im)
            d.text((sx + sw // 2, ytop + row_h + 10), labels[k], font=font("b", 26), fill=INK, anchor="ma")
    env = REPORT["envelope_mm"]
    d.text((x0 + 1600, 1060 + row_h - 4), f"{env[0]:g} × {env[1]:g} × {env[2]:g} mm", font=font("b", 30),
           fill=INK, anchor="rd")

    # notes
    nx0, ny0, nx1, ny1 = 1780, 280, 3110, 1780
    d.rounded_rectangle((nx0, ny0, nx1, ny1), radius=36, fill=(255, 255, 255), outline=LINE, width=3)
    blocks = [
        ("KEPT FROM 2025", MUTED, [
            "Dangle-tag silhouette: round-top neck, waist,",
            "38° shoulder flank, R6.5 bottom corners",
            "Logo cube + Terrava wordmark on the front",
            "Grey grommet ring around the pin",
            "Solar panel on the back, 2 screws below it",
            "Cover = front 5.6 mm, 1 mm step at the neck",
        ]),
        ("ENGINEERED FOR 2026", GREEN, [
            "66 mm tall, not the labelled 62 (the drawing",
            "itself measures 68): battery, screws, sensors fit",
            "Grey TPU yoke: PPG under the pin, IR beside it",
            "Sealed: lap joint + gasket, neck hook + 2× M2,",
            "TPU USB-C plug; the neck is solid, no leak path",
            "Real parts: SM141K05L cell, XIAO ESP32S3 +",
            "Wio-SX1262, LiPo 302535, L76K GNSS",
            "Zero CAD interference, every STL watertight",
        ]),
    ]
    yy = ny0 + 50
    for title, col, lines in blocks:
        d.text((nx0 + 50, yy), title, font=font("xb", 36), fill=col)
        yy += 70
        for ln in lines:
            bullet = not ln[:1].islower() and not ln.startswith(("38°", "itself", "TPU", "Wio"))
            d.text((nx0 + 50, yy), "•" if bullet else "", font=font("b", 28), fill=col)
            d.text((nx0 + 85, yy), ln, font=font("m", 28), fill=INK)
            yy += 48
        yy += 50
    out = IMG / "08-concept-vs-cad.png"
    canvas.save(out, optimize=True)
    print("wrote", out)


def family():
    canvas = Image.new("RGB", (W, 1900), SOFT)
    header(canvas, "Terrava", "SMART EAR TAG FAMILY  ·  TWO 3D-PRINTABLE ENCLOSURES, ONE ELECTRONICS KIT",
           "Pick the fit for the herd.", "Same XIAO ESP32S3 + SX1262 core, same firmware and LoRaWAN payload.")
    lineup = Image.open(ROOT_IMG / "terrava-ear-tag-lineup.png").convert("RGB")
    d = ImageDraw.Draw(canvas)
    # the banner-format render fills the card edge to edge, clipped to its rounded corners
    cw, ch = 3020, 890
    s = max(cw / lineup.width, ch / lineup.height)  # cover the card, never leave an empty row
    im = lineup.resize((round(lineup.width * s), round(lineup.height * s)), Image.LANCZOS)
    left, top = (im.width - cw) // 2, (im.height - ch) // 2
    im = im.crop((left, top, left + cw, top + ch))
    mask = Image.new("L", (cw, ch), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, cw - 1, ch - 1), radius=36, fill=255)
    canvas.paste(im, (90, 290), mask)
    d.rounded_rectangle((90, 290, 90 + cw, 290 + ch), radius=36, outline=LINE, width=3)
    sm, se = SHIELD_REPORT["mass"], SHIELD_REPORT["envelope_mm"]
    cm, ce = REPORT["mass"], REPORT["envelope_mm"]
    shield = [("Form", "flat clamp on the ear"), ("Envelope", f"{se[0]:g} × {se[1]:g} × {se[2]:g} mm"),
              ("Weight", f"≈ {sm['total_g']:.0f} g"), ("Battery", "LiPo 602535 ~500 mAh"),
              ("Solar", "optional front cell (edition)"), ("Sensors", "IR + PPG beside the pin"),
              ("Best for", "lowest profile, longest battery")]
    classic = [("Form", "dangle tag (2025 design)"), ("Envelope", f"{ce[0]:g} × {ce[1]:g} × {ce[2]:g} mm"),
               ("Weight", f"≈ {cm['total_g']:.0f} g"), ("Battery", "LiPo 302535 ~250 mAh"),
               ("Solar", "154 mW cell on the back"), ("Sensors", "IR + PPG in the TPU yoke"),
               ("Best for", "familiar look, solar top-up")]
    spec_panel(canvas, (90, 1220, 1580, 1820), shield, "TV-ET1 Shield", key_w=230)
    spec_panel(canvas, (1620, 1220, 3110, 1820), classic, "TV-ET0 Classic", key_w=230)
    out = ROOT_IMG / "00-terrava-ear-tag-family.png"
    canvas.save(out, optimize=True)
    print("wrote", out)


if __name__ == "__main__":
    overview()
    comparison()
    family()
