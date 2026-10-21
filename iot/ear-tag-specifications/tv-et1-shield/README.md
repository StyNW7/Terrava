# Terrava Smart Ear Tag TV-ET1: enclosure specification

[🇮🇩 Bahasa Indonesia](README-ind.md) · Part of the [Terrava ear tag family](../README.md), next to the [TV-ET0 Classic](../tv-et0-classic/README.md)

A compact, sealed, 3D-printable housing for the Terrava smart ear tag. It fits the IoT stack this repository's firmware targets (ESP32 + LoRa + IR temperature + PPG + IMU + GNSS), mounts on a cow's ear with a **standard two-piece cattle tag male button**, and is *plug & use*: charge over USB-C, seal, register, apply.

<p align="center"><img src="images/00-terrava-ear-tag-overview.png" alt="Terrava Smart Ear Tag overview" width="100%"></p>

Everything here comes from one parametric CAD script ([`cad/terrava_ear_tag.py`](cad/terrava_ear_tag.py)). The STL/STEP files, renders, drawings and 3D viewer are all generated from it, and every reference component is checked for **zero interference** against the shells.

---

## At a glance

| | |
| --- | --- |
| Envelope | **46 × 68 × 14 mm** (soft shield outline, R10 bottom / R18 shoulders) |
| Weight | **≈ 48 g** complete (printed parts 19.9 g + electronics ≈ 27.7 g) |
| Shell | 2 parts in PETG or ASA: rear shell 6.0 mm (ear side) + front shell 8.0 mm, lap joint, TPU gasket, 4 × M2 stainless screws into brass heat-set inserts |
| Mounting | Ø7.2 mm through-bore 12.6 mm below the top edge; standard male button (pin ≈ 19 mm) locked by a replaceable TPU ring; flush snap-in cap hides the tip |
| Body sensors | MLX90614 IR thermometer and MAX30102 PPG on the ear face, 11.8 mm either side of the pin, where the pin holds the tag flat on the skin |
| Electronics | Seeed XIAO ESP32S3 + Wio-SX1262 (LoRaWAN AS923-2), GNSS module + 18 mm ceramic patch, 6-axis IMU, LoRa FPC antenna |
| Power | LiPo 602535 ≈ 500 mAh, USB-C charging (port sealed by a flush TPU plug), optional 32 × 17 mm solar window |
| Front | Two-colour flush logo inlay (Terrava mark + wordmark), status light that glows through a 0.6 mm wall |
| Sealing | Lap joint + compressed TPU gasket + silicone at the sensor windows, **IP67 design target** (verify, see below) |
| Internal volume | 27 cm³; every reference component fits with zero overlap in the CAD check |

## Renders

| | |
| --- | --- |
| ![Front](images/renders/01-hero-front.png) | ![Rear / ear side](images/renders/02-hero-rear-sensors.png) |
| **Front**: logo inlay, flush pin cap, status light | **Ear side**: PPG window, pin bore, MLX90614 IR window, countersunk M2 screws, engraved ID |
| ![Exploded](images/renders/03-exploded-view.png) | ![Internal layout](images/renders/04-internal-layout.png) |
| **Exploded**: male button → screws → rear shell → electronics → gasket/ring → front shell → inlay → cap | **Inside**, cover removed: XIAO + LoRa stack, battery, GNSS patch and module, IMU, FPC antenna, body sensors |
| ![Colourways](images/renders/05-colorways.png) | ![Solar edition](images/renders/06-solar-edition.png) |
| **Colourways**: Field (high visibility), Signature, Stealth | **Solar edition**: 32 × 17 mm PV window, compact logo |

Also: [mounted on an ear](images/renders/07-mounted-on-ear.png) and six orthographic catalogue views (`images/renders/view-*.png`, transparent background).

**Interactive 3D:** open [`terrava-ear-tag-3d-viewer.html`](terrava-ear-tag-3d-viewer.html) in a browser to orbit the model, explode it, hide the front shell or electronics, and switch colourways. The model is embedded in the file; only three.js and the font load from a CDN.

## Technical drawings

| Sheet | Content |
| --- | --- |
| [1 · General arrangement](images/drawings/sheet-1-general-arrangement.png) ([PDF](images/drawings/sheet-1-general-arrangement.pdf)) | Front, side, rear, bottom, section A–A through the pin, all key dimensions |
| [2 · Internal layout](images/drawings/sheet-2-internal-layout.png) ([PDF](images/drawings/sheet-2-internal-layout.pdf)) | Component footprint by layer, BOM, real cross-sections B–B / C–C / D–D cut from the CAD |
| [3 · Placement & installation](images/drawings/sheet-3-placement-installation.png) ([PDF](images/drawings/sheet-3-placement-installation.pdf)) | Where on the ear, how the pin holds, six plug & use steps |

---

## Design rationale

**Size.** The housing is sized from the parts outward instead of from a sketch. The tallest part (XIAO + Wio-SX1262 stack, ≈ 10 mm) sets the 14 mm thickness. The 21 mm stack, the 25 mm battery and the 10 mm sensor row, stacked vertically, set the 68 mm height. Battery width plus two side channels sets the 46 mm width. The bounding box is about the same as the 62 × 42 × 18 mm 2025 concept (≈ 44 vs 47 cm³), which is now built as the [TV-ET0 Classic](../tv-et0-classic/README.md),, but 4 mm thinner, so it hangs closer to the ear.

**Shape.** A convex "shield" with no neck: a narrow neck is where panel tags tear, and a full-width top gives room for both body sensors right next to the pin. All edges are rounded or chamfered, and nothing protrudes that can snag a fence or feeder: the cap, plug, windows and screws are all flush.

**Placement.** Tags go in the **middle third of the ear, between the two cartilage ribs**, away from the large veins and the edge (Oklahoma State University Extension; Allflex best practice). Too close to the head risks necrosis, too close to the edge risks tear-out. Sheet 3 shows this at true scale against a ≈ 190 × 110 mm ear.

**Sensing where it works.** The pin clamps the tag against the ear, so the rear face around it is the only area with reliable skin contact. The MLX90614 (non-contact, 90° FOV) sits 0.3 mm behind the ear face. The MAX30102 looks through a flush 1 mm clear window. The GNSS patch faces outward behind the logo, which is plastic only, with no metal paint.

**Printable without supports.** Both shells print face-down on the bed. The front and rear edges are 45° chamfers rather than fillets, so the first layers do not curl. The logo pocket sits in the first 0.8 mm, so a multi-material printer lays down a truly flush two-colour logo.

## Reference electronics

| # | Component | Envelope (mm) | Where |
| --- | --- | --- | --- |
| 1 | Seeed **XIAO ESP32S3** (MCU, Li-ion charger, USB-C) | 21 × 17.8 | bottom, full depth, USB-C on the bottom edge |
| 2 | Seeed **Wio-SX1262** for XIAO (LoRa/LoRaWAN, u.FL) | 21 × 17.8 | stacked under the XIAO |
| 3 | **LiPo 602535** 3.7 V ≈ 500 mAh + PCM, JST-SH | 35 × 25 × 6 | ear-side layer, middle |
| 4 | GNSS **ceramic patch** 18 × 18 × 4, u.FL | 18 × 18 × 4 | front layer, faces outward |
| 5 | GNSS module **L76K / ATGM336H** class | ≤ 16 × 13 × 2.4 | front layer, top left |
| 6 | 6-axis **IMU** breakout (MPU-6050 class) | ≤ 12.7 × 12.7 × 2.2 | front layer, left |
| 7 | **MLX90614ESF** IR thermometer, TO-39 can | Ø9.2 | ear face, left of the pin |
| 8 | **MAX30102** mini module (HR + SpO₂) | ≤ 10 × 10 × 3.2 | ear face, right of the pin |
| 9 | LoRa **FPC antenna** 915/923 MHz, u.FL | ≤ 40 × 10 × 0.2 | inside the left wall |

All pockets are parameters at the top of the CAD script. If your modules differ, change the numbers and run it again; the interference check tells you if something no longer fits.

> **Firmware note.** The current firmware targets a LilyGO T-Beam (SX1276 + AXP192). A T-Beam with its 18650 cell cannot fit any ear-sized housing, so this enclosure uses the XIAO form factor. Porting means changing the pin map in `config.h`, using RadioLib's `SX1262` class instead of `SX1276`, and reading the battery through an ADC divider instead of the AXP192. The sensor and protocol code is unchanged. The **XIAO nRF52840** drops into the same pocket and is the low-power upgrade path (see Power).

## Printed parts

STL files in [`models/stl/`](models/stl) are already in print orientation. STEP files in [`models/step/`](models/step) are in assembly position, plus a full assembly with named and coloured parts.

| File | Material | Qty | Notes |
| --- | --- | --- | --- |
| `01-rear-shell-base` | PETG / ASA | 1 | ear face down, no supports |
| `02-front-shell-cover` | PETG / ASA | 1 | front face down on textured PEI, no supports |
| `02s-front-shell-cover-solar` | PETG / ASA | — | alternative cover with a 32 × 17 × 1.0 mm PV recess |
| `03a-logo-inlay-multimaterial` | PETG / ASA, green | 1 | load together with the cover as **one object, two parts**, then assign the green filament |
| `03b-logo-inlay-press-fit` | PETG / ASA, green | (1) | single-extruder option: 0.06 mm smaller, print flat, press in with a drop of CA glue |
| `04-pin-cap-TPU` | TPU 95A | 1 | snap-in, hides the pin tip |
| `05-pin-lock-ring-TPU` | TPU 95A | 1 (+ spares) | grips the male pin's arrow tip; replace whenever the tag is re-applied |
| `06-gasket-TPU` | TPU 95A | 1 | 0.8 mm, compressed to 0.6 mm |
| `07-usb-c-plug-TPU` | TPU 95A | 1 (+ spare) | flush plug with snap bead and pull groove |
| `08-ppg-window-clear` | clear PC / acrylic | 1 | best cut from 1 mm clear PC; printed clear PETG scatters light |

**Recommended settings:** 0.4 mm nozzle, 0.16 mm layers, 5 perimeters (the 1.6–2.0 mm walls print solid), 6 top and bottom layers, 40 % gyroid inside the bosses, ironing off. Use **ASA** for the longest UV life in the sun, or PETG. Avoid PLA: it creeps above about 50 °C, which a dark tag can reach in tropical sun. TPU parts: 25 mm/s, 100 % infill.

## Hardware

| Item | Qty |
| --- | --- |
| M2 × 10 countersunk screw, A2 stainless (DIN 965 / ISO 7046) | 4 |
| M2 × 3 brass heat-set insert (Ø3.2 mm hole) | 4 |
| Standard cattle tag **male button** (e.g. Allflex Global/Universal male, pin ≈ 19 mm) + applicator | 1 per animal |
| Neutral-cure silicone (sensor windows, optional gasket bead), Kapton tape, 0.4 mm foam pad | — |

## Assembly

1. Press the 4 heat-set inserts into the front-shell bosses with a soldering iron at 220 °C.
2. Press the TPU lock ring into its pocket inside the front shell's pin boss.
3. Fit the PPG window into the rear shell (a thin ring of clear epoxy or silicone around the edge).
4. Fit the MLX90614 (can into the Ø8.4 aperture, flange on the ledge) and the MAX30102 module (sensor against the window). Seal both from the inside with silicone.
5. Place the battery between the corner guides, then the XIAO + Wio stack on a 0.4 mm foam pad with USB-C in the port.
6. Stick the FPC antenna to the left wall, and the GNSS patch (in its frame), the GNSS module and the IMU to the inside of the front shell. Route the u.FL cables and the I²C/UART wires.
7. Flash and test on the bench (`pio run -t upload`, then `python -m terrava_iot decode …` on an uplink).
8. Lay the gasket on the base lip, close the shells, and tighten the 4 screws evenly (snug, about 0.15 N·m).
9. Press in the USB plug.

## Plug & use (field)

1. **Charge** over USB-C. The status light glows through the shell.
2. **Seal**: press the TPU plug in flush.
3. **Register** the DevEUI in Terrava → Devices and pair it with the animal (same flow as [`iot/README.md`](../../README.md)).
4. **Load**: take the cap off, put the tag on the applicator's female jaw, and put a male button on the pin.
5. **Apply**: disinfect, then press in one firm stroke in the middle third between the ribs. The design leaves 2–4 mm of play for ear growth and airflow.
6. **Cap & go**: snap the cap in. The tag joins LoRaWAN and reports within one interval.

Removal: cut the male pin, pop the cap out from behind, and fit a new lock ring.

## Power budget (estimate)

| Profile | Assumptions | Consumption | Runtime on 500 mAh (80 % usable) |
| --- | --- | --- | --- |
| Firmware default | 5 min interval, 15 s awake at ~45 mA, GPS every 3rd cycle | ≈ 85 mAh/day | ≈ 5 days |
| **Field profile** | 15 min interval, ~6 s awake, IMU FIFO for activity, GPS hourly (hot start), sensors on a switched rail | ≈ 9 mAh/day | ≈ 45 days |
| Field + solar edition | 5.4 cm² cell, a vertical tag gets ~10 % of horizontal insolation | +5 to +10 mAh/day harvested | close to energy-neutral in open pasture |
| Field + XIAO nRF52840 | same pocket, ~5 µA sleep, ~8 mA active | ≈ 3 mAh/day | 4 months or more, beats the 60–80-day target |

These are planning numbers. Measure on the real build with a current logger (for example a Nordic PPK2).

## Weight

Shells 19.0 g, inlay, cap, ring, gasket, plug and window 0.9 g, electronics ≈ 27.7 g (battery 10 g, XIAO + LoRa 5.5 g, GNSS 5.5 g, the rest under 7 g), for **≈ 48 g** in total. That is reasonable for growing and adult cattle (≥ 250 kg), but heavier than plain visual tags. For calves, build a lite variant (no GNSS, 300 mAh) at about 35 g. A custom PCB is the route to about 30 g.

## Validation checklist before field use

- [ ] Fit-check one set of printed shells with your actual modules (pocket sizes are parameters)
- [ ] Male button fit: pass the arrow tip through the Ø7.2 bore and lock ring; pull-out force should exceed 100 N
- [ ] Submersion test, 1 m for 30 min, with a dry tissue inside (IP67 target)
- [ ] RF check: compare RSSI/SNR with the reference antenna; trim the FPC position if needed
- [ ] Sensor calibration: IR offset (`TEMP_CAL_OFFSET_C`) against rectal temperature; PPG contact quality
- [ ] Drop test from 1.5 m onto concrete, and a 70 °C oven soak for 1 h (sun load)
- [ ] Animal welfare: watch the ear daily for one week on a pilot group

## Regenerating everything

```bash
cd iot/ear-tag-specifications/tv-et1-shield/cad
python -m venv .venv && .venv/Scripts/activate       # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python trace_logo.py          # images/logo.png -> terrava_logo.json (only when the logo changes)
python terrava_ear_tag.py     # CAD + interference/mass checks -> models/ (STEP, STL, GLB)
python drawings.py            # -> images/drawings/ (PNG + PDF)
python render.py              # -> images/renders/ (Mitsuba 3, CPU; ~90 min at full quality)
python compose_overview.py    # -> images/00-terrava-ear-tag-overview.png
python build_viewer.py        # -> terrava-ear-tag-3d-viewer.html
```

`python terrava_ear_tag.py --check` only prints the interference and mass report (`models/build-report.json`).

## Folder structure

```
ear-tag-specifications/tv-et1-shield/
├── README.md / README-ind.md
├── terrava-ear-tag-3d-viewer.html     interactive model (offline-capable)
├── cad/                               parametric source + toolchain
│   ├── terrava_ear_tag.py             CadQuery model, checks, exports
│   ├── render.py · drawings.py · compose_overview.py · build_viewer.py
│   ├── trace_logo.py · terrava_logo.json/.svg   vector Terrava mark
│   └── fonts/                         Plus Jakarta Sans (SIL OFL)
├── models/
│   ├── stl/                           print-ready parts
│   ├── step/                          parts + coloured assembly
│   ├── terrava-ear-tag-assembly.glb
│   └── build-report.json              interference + mass report
└── images/
    ├── 00-terrava-ear-tag-overview.png
    ├── renders/                       photoreal renders + catalogue views
    └── drawings/                      A3 drawing sheets (PNG + PDF)
```

## References

- Oklahoma State University Extension, [Livestock tagging](https://extension.okstate.edu/fact-sheets/livestock-tagging): placement in the middle third, between the ribs
- SRUC, [Implication of smart ear tags' material, shape, weight and placement](https://pure.sruc.ac.uk/en/publications/implication-of-smart-ear-tags-material-shape-weight-and-placement/): lighter, compact tags reduce droop and loss
- Allflex, [Button Male (M1)](https://www.allflex.global/product/button-male-m1): 28 mm male button head; [ICAR test data](https://www.icar.org/?p=1687) for male pin lengths
- Seeed Studio, [XIAO ESP32S3 & Wio-SX1262 kit](https://wiki.seeedstudio.com/wio_sx1262_with_xiao_esp32s3_kit/): 21 × 18 mm form factor
