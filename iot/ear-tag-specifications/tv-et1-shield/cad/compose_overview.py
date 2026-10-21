"""One-page product overview (PNG) built from the renders and the build report.

    python compose_overview.py   ->  ../images/00-terrava-ear-tag-overview.png
"""

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
IMG = HERE.parent / "images"
REN = IMG / "renders"
REPORT = json.loads((HERE.parent / "models" / "build-report.json").read_text())
LOGO = next(p for p in HERE.parents if (p / "images" / "logo.png").exists()) / "images" / "logo.png"

W, H = 3200, 2000
GREEN = (11, 107, 62)
INK = (21, 35, 27)
MUTED = (93, 107, 99)
LINE = (220, 230, 223)
SOFT = (244, 247, 244)


def font(weight, size):
    name = {"xb": "PlusJakartaSans-ExtraBold.ttf", "b": "PlusJakartaSans-Bold.ttf",
            "m": "PlusJakartaSans-Medium.ttf"}[weight]
    return ImageFont.truetype(str(HERE / "fonts" / name), size)


def crop_to_content(im, pad=40, thresh=246):
    g = im.convert("L").point(lambda v: 255 if v < thresh else 0)
    bb = g.getbbox()
    if not bb:
        return im
    x0, y0, x1, y1 = bb
    return im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))


def fit(im, w, h):
    s = min(w / im.width, h / im.height)
    return im.resize((int(im.width * s), int(im.height * s)), Image.LANCZOS)


def card(canvas, box, im, label, sub=None):
    d = ImageDraw.Draw(canvas)
    x0, y0, x1, y1 = box
    d.rounded_rectangle(box, radius=36, fill=(255, 255, 255), outline=LINE, width=3)
    inner = fit(crop_to_content(im), x1 - x0 - 60, y1 - y0 - 150)
    canvas.paste(inner, (x0 + (x1 - x0 - inner.width) // 2, y0 + 30 + (y1 - y0 - 150 - inner.height) // 2))
    d.text((x0 + 40, y1 - 100), label, font=font("b", 40), fill=INK)
    if sub:
        d.text((x0 + 40, y1 - 52), sub, font=font("m", 28), fill=MUTED)


def main():
    canvas = Image.new("RGB", (W, H), SOFT)
    d = ImageDraw.Draw(canvas)

    # header
    logo = Image.open(LOGO).convert("RGBA").resize((150, 150), Image.LANCZOS)
    canvas.paste(logo, (90, 70), logo)
    d.text((270, 78), "Terrava", font=font("xb", 96), fill=GREEN)
    d.text((274, 190), "SMART EAR TAG  ·  TV-ET1  ·  3D-PRINTABLE ENCLOSURE", font=font("b", 34), fill=INK)
    d.text((W - 90, 96), "Compact. Sealed. Plug & use.", font=font("b", 56), fill=INK, anchor="ra")
    d.text((W - 90, 176), "Body sensors sit where the pin clamps the tag flat against the ear.",
           font=font("m", 32), fill=MUTED, anchor="ra")

    hero = Image.open(REN / "01-hero-front.png").convert("RGB")
    rear = Image.open(REN / "02-hero-rear-sensors.png").convert("RGB")
    expl = Image.open(REN / "03-exploded-view.png").convert("RGB")
    inner = Image.open(REN / "04-internal-layout.png").convert("RGB")
    cw = Image.open(REN / "05-colorways.png").convert("RGB")

    card(canvas, (90, 290, 1180, 1300), hero, "Front", "logo inlay · flush pin cap · status light")
    card(canvas, (1220, 290, 1900, 1300), rear, "Ear side", "IR temp · PPG window · pin bore")
    card(canvas, (1940, 290, 3110, 1300), expl, "Exploded", "2 shells · 4× M2 · TPU lock ring & gasket")
    card(canvas, (90, 1340, 900, 1900), inner, "Inside", "XIAO ESP32S3 + SX1262 · GNSS · 500 mAh")
    card(canvas, (940, 1340, 1900, 1900), cw, "Colourways", "Signature · Field · Stealth")

    # spec panel
    x0, y0, x1, y1 = 1940, 1340, 3110, 1900
    d.rounded_rectangle((x0, y0, x1, y1), radius=36, fill=GREEN)
    m = REPORT["mass"]
    env = REPORT["envelope_mm"]
    specs = [
        ("Envelope", f"{env[0]:g} × {env[1]:g} × {env[2]:g} mm"),
        ("Weight", f"≈ {m['total_g']:.0f} g  (shell {m['enclosure_g']:.0f} g)"),
        ("Radio", "LoRaWAN AS923-2 · SX1262"),
        ("Sensing", "IR temp · HR/SpO₂ · IMU · GNSS"),
        ("Power", "LiPo 500 mAh · USB-C · solar option"),
        ("Sealing", "lap joint + TPU gasket · IP67 target"),
        ("Mounting", "standard male button, Ø7.2 bore"),
    ]
    d.text((x0 + 50, y0 + 40), "Specifications", font=font("xb", 46), fill=(255, 255, 255))
    for i, (k, v) in enumerate(specs):
        yy = y0 + 125 + i * 56
        d.text((x0 + 50, yy), k, font=font("m", 30), fill=(190, 225, 205))
        d.text((x0 + 300, yy), v, font=font("b", 30), fill=(255, 255, 255))

    out = IMG / "00-terrava-ear-tag-overview.png"
    canvas.save(out, optimize=True)
    print("wrote", out)


if __name__ == "__main__":
    main()
