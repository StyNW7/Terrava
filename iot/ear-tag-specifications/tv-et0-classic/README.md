# Terrava Smart Ear Tag TV-ET0 Classic: enclosure specification

[🇮🇩 Bahasa Indonesia](README-ind.md) · Part of the [Terrava ear tag family](../README.md), next to the [TV-ET1 Shield](../tv-et1-shield/README.md)

The **original 2025 Terrava ear tag**, rebuilt from its concept renders and prototype photos ([`references/`](../references/Prototype-Terrava-Ear-Tag-v1.png)) into a sealed, 3D-printable product. It keeps the classic **dangle-tag silhouette** (round-top neck, shoulders, wide body), the **logo on the front** and the **solar panel on the back**. It now houses the same IoT stack as the Shield (ESP32-S3 + LoRa SX1262, IR temperature, PPG, IMU, GNSS), mounts with a **standard two-piece cattle tag male button**, and is *plug & use*: charge over USB-C, seal, register, apply.

<p align="center"><img src="images/00-terrava-classic-overview.png" alt="Terrava Classic overview" width="100%"></p>

Everything comes from one parametric CAD script ([`cad/terrava_classic.py`](cad/terrava_classic.py)). The STL/STEP files, renders, drawings and 3D viewer are all generated from it, and every reference component is checked for **zero interference** against the housing and cover.

---

## From the 2025 concept to a printable part

<p align="center"><img src="images/08-concept-vs-cad.png" alt="2025 concept views next to the CAD views" width="100%"></p>

The concept sheet labels the tag **42 × 62 × 18 mm**, but the drawing does not match its own labels. Measured against the 42 mm width, the drawn front view is **68 mm** tall and the side view 16 mm thick. The CAD keeps the drawn shape and settles on a size that fits the electronics:

| | Concept (measured from the render) | TV-ET0 Classic CAD |
| --- | --- | --- |
| Width | 42 mm | **42 mm** |
| Height | 62 labelled, 68 drawn | **66 mm**: below 66, the battery, the two bottom screws and the sensor row no longer fit |
| Thickness | 18 labelled, 16 drawn | **17 mm** body + **1 mm** TPU yoke = **18 mm** |
| Neck | round top concentric with the hole, ~17–19 mm wide | **R8.6** top concentric with the pin, **17.3 mm** at the pin, sides leaning out 7° |
| Shoulders | concave waist → straight flank → round shoulder | **R8** waist → **37.6°** flank → **R8** shoulder, full width from 32 mm below the top |
| Seam | cover = front ≈ 5.6 mm, line across the neck base | **5.6 mm** cover, ends at the neck base with a 1 mm 45° step |
| Back | dark solar panel, two screws below it, grey ring at the hole | **35 × 22 mm** solar cell behind a 33 × 20 window, **2 × M2** below it, grey TPU yoke |

The prototype photos show where it was going: a flat plate with the MAX30102 right under the pin, wired to a separate box with a solar panel and a rocker switch. TV-ET0 puts all of that in one sealed shell.

## At a glance

| | |
| --- | --- |
| Envelope | **42 × 66 × 18 mm** (17 mm body + 1 mm soft yoke); neck 17.3 mm wide, 16 mm thick |
| Weight | **≈ 44 g** complete (printed parts 17.5 g + electronics ≈ 26.4 g) |
| Shell | **Housing** (rear, includes the whole neck) + **cover** (front 5.6 mm) in PETG or ASA, lap joint + TPU gasket. A tongue on the cover hooks into the neck; **2 × M2 × 14** stainless screws from the back into brass heat-set inserts |
| Mounting | Ø7.2 mm bore through the solid neck, **8.6 mm below the top**, concentric with the top arc. Standard male button (pin ≈ 19 mm) locked by a replaceable TPU ring; grey snap-in cap = the concept's "grommet" |
| Body sensors | Grey **TPU sensor yoke** on the neck and shoulders of the back, 1 mm proud: **MAX30102** PPG window 10.8 mm under the pin, **MLX90614** IR window beside it |
| Electronics | Seeed XIAO ESP32S3 + Wio-SX1262 (LoRaWAN AS923-2), GNSS module + 18 mm ceramic patch, 6-axis IMU, LoRa FPC antenna (36 mm run along the left wall) |
| Power | LiPo **302535 ≈ 250 mAh**, **154 mW solar cell** (ANYSOLAR SM141K05L, 35 × 22 × 2.1 mm) through a BQ25570-class harvester, USB-C charging (flush TPU plug) |
| Front | Two-colour flush logo inlay: cube mark 17 mm + "Terrava" wordmark 5 mm cap height |
| Sealing | Lap joint + compressed TPU gasket + bonded solar cell + silicone at the sensor windows. The pin passes through the solid neck, outside the sealed cavity. **IP67 design target** (verify, see below) |
| Internal volume | 21 cm³; every reference component fits with zero overlap in the CAD check |

## Renders

| | |
| --- | --- |
| ![Front](images/renders/01-hero-front.png) | ![Back](images/renders/02-hero-rear-solar-sensors.png) |
| **Front**: logo inlay, grey grommet cap, 1 mm step at the neck base | **Back**: solar cell in its window, grey TPU yoke with the PPG and IR windows, 2 countersunk M2, engraved ID |
| ![Exploded](images/renders/03-exploded-view.png) | ![Internal layout](images/renders/04-internal-layout.png) |
| **Exploded**: male button → screws → PPG window → yoke → housing → electronics + solar cell → gasket/ring → cover → inlay → cap | **Inside**, cover removed: XIAO + LoRa stack over the battery, harvester, GNSS tower (module, IMU, patch), FPC antenna, sensors |
| ![Colourways](images/renders/05-colorways.png) | ![Profile](images/renders/06-profile-yoke-detail.png) |
| **Colourways**: Mint (the 2025 prototype's colour), Signature, Stealth | **Profile**: the yoke stands 1 mm proud, so the sensors touch the ear first |

Also: [mounted on an ear](images/renders/07-mounted-on-ear.png), the [Classic and Shield side by side](../images/terrava-ear-tag-lineup.png), and six orthographic catalogue views (`images/renders/view-*.png`, transparent background).

**Interactive 3D:** open [`terrava-classic-3d-viewer.html`](terrava-classic-3d-viewer.html) in a browser to orbit the model, explode it, hide the cover or electronics, and switch colourways. The model is embedded in the file; only three.js and the font load from a CDN.

## Technical drawings

| Sheet | Content |
| --- | --- |
| [1 · General arrangement](images/drawings/sheet-1-general-arrangement.png) ([PDF](images/drawings/sheet-1-general-arrangement.pdf)) | Front, side, rear, bottom, section A–A through the pin, all key dimensions and radii |
| [2 · Internal layout](images/drawings/sheet-2-internal-layout.png) ([PDF](images/drawings/sheet-2-internal-layout.pdf)) | Component footprint by layer, BOM, real cross-sections B–B / C–C / D–D cut from the CAD |
| [3 · Placement & installation](images/drawings/sheet-3-placement-installation.png) ([PDF](images/drawings/sheet-3-placement-installation.pdf)) | Where on the ear, how the pin holds, six plug & use steps |

---

## Design rationale

**Why 66 mm and not 62.** The full-width body is the only place a 35 mm battery and a 35 mm solar cell fit, and it also has to hold the two screws the concept shows below the panel. Bottom screws (top of boss at 6.4 mm), battery (25 mm) and the IR sensor tube (from 31.8 mm) stack up to the 34 mm where the shoulders begin. At 62 mm that body is 4 mm too short. At 66 mm everything fits with 0.2–0.4 mm to spare, and the outline still lies on top of the concept's drawn silhouette (see the comparison above).

**A dangle tag that still senses.** On a dangle tag the male button clamps only the area around the pin; the body hangs. So the skin-contact sensors live in a soft **TPU yoke** that covers the neck and shoulders of the back and stands 1 mm proud of the housing:

- The **MAX30102** PPG needs pressure, so it sits **10.8 mm straight below the pin**, inside the button's clamp zone. It looks through a 2 mm clear window that ends flush with the yoke face.
- The **MLX90614** is non-contact (90° field of view), so it can sit 21.6 mm from the pin, beside the PPG, with its can flush with the housing and 1 mm behind the yoke face.

**Solar on the back, honestly.** Mounted 20–25 mm above the lower ear margin (sheet 3), the yoke rests on the ear while the solar half hangs below it in open air. A hanging cell facing backwards gets roughly a tenth of horizontal sunlight. That is a top-up, not full autonomy; see Power.

**A neck that cannot leak or tear.** The neck is a solid 17 × 16 mm section of the housing. The pin, lock ring and cap all live in it, outside the sealed cavity, so a lost cap never lets water in. Panel tags tear at a 2 mm neck; this one is about eight times thicker.

**Closing the shell.** The concept shows only two screws, below the solar panel. The top of the cover is held by a **tongue that hooks into a slot in the neck**: hook the tongue in, swing the cover down, then drive the two screws. The lap joint and gasket run all round, across the neck base too.

**Printable without supports.** The housing prints back-face down. The back is kept dead flat for that reason, which is why the yoke is a separate glued-and-pegged TPU part instead of a raised pad. The solar window, PPG recess and engraving are all small enough to bridge. The cover prints front-face down; its 45° step at the neck base and 45° edge chamfers need no support. The logo pocket is in the first 0.8 mm, so a multi-material printer lays a truly flush two-colour logo.

## Reference electronics

| # | Component | Envelope (mm) | Where |
| --- | --- | --- | --- |
| 1 | Seeed **XIAO ESP32S3** (MCU, Li-ion charger, USB-C) | 21 × 17.8 | lower body, components facing the back, USB-C on the bottom edge |
| 2 | Seeed **Wio-SX1262** for XIAO (LoRa/LoRaWAN, u.FL) | 21 × 17.8 | stacked on the XIAO, towards the front |
| 3 | **LiPo 302535** 3.7 V ≈ 250 mAh incl. PCM | 35 × 25 × 3.0 | rear layer, on a foam pad over the solar cell |
| 4 | **Solar cell ANYSOLAR SM141K05L** (154 mW, Voc 3.4 V), or any ≤ 35 × 22 × 2.1 cell | 35 × 22 × 2.1 | bonded behind the 33 × 20 rear window |
| 5 | **Solar harvester**, BQ25570-class boost/MPPT charger | ≤ 14 × 9 × 3 | right of the stack |
| 6 | GNSS **ceramic patch** 18 × 18 × 4, u.FL | 18 × 18 × 4 | upper body, behind the logo, faces out |
| 7 | GNSS module **L76K / ATGM336H** class | ≤ 16 × 13 × 2.4 | under the patch |
| 8 | 6-axis **IMU** breakout (MPU-6050 class) | ≤ 12.7 × 12.7 × 2.0 | between the module and the patch |
| 9 | **MLX90614ESF** IR thermometer, TO-39 can | Ø9.2 | yoke, 8.3 mm left of centre |
| 10 | **MAX30102** mini module (HR + SpO₂) | ≤ 10 × 10 × 3.2 | yoke, under the pin |
| 11 | LoRa **FPC antenna** 915/923 MHz, u.FL | ≤ 40 × 8 × 0.2 | bent along the inside of the left wall and shoulder |

All pockets and positions are parameters at the top of the CAD script. If your modules differ, change the numbers and run it again; the interference check tells you if something no longer fits.

> **Firmware note.** This is the same electronics kit as the Shield, so the same port applies: the current firmware targets a LilyGO T-Beam (SX1276 + AXP192). Change the pin map in `config.h`, use RadioLib's `SX1262` class, and read the battery through an ADC divider. The harvester charges the cell on its own and needs no firmware; an optional GPIO can read its "power good" line. The firmware already reports a missing sensor as "not available", so a build without the PPG module still works.

## Printed parts

STL files in [`models/stl/`](models/stl) are already in print orientation, flat on the bed. STEP files in [`models/step/`](models/step) are in assembly position, plus a full assembly with named and coloured parts.

| File | Material | Qty | Notes |
| --- | --- | --- | --- |
| `01-rear-housing` | PETG / ASA | 1 | back face down, no supports; includes the whole neck |
| `02-front-cover` | PETG / ASA | 1 | front face down on textured PEI, no supports |
| `03a-logo-inlay-multimaterial` | PETG / ASA, green | 1 | load together with the cover as **one object, two parts**, then assign the green filament |
| `03b-logo-inlay-press-fit` | PETG / ASA, green | (1) | single-extruder option: 0.06 mm smaller, print flat, press in with a drop of CA glue |
| `04-pin-cap-TPU-grey` | TPU 95A, grey | 1 | snap-in "grommet" cap, hides the pin tip |
| `05-pin-lock-ring-TPU` | TPU 95A | 1 (+ spares) | light press fit in the neck; grips the arrow tip; replace whenever the tag is re-applied |
| `06-gasket-TPU` | TPU 95A | 1 | 0.8 mm, compressed to 0.6 mm |
| `07-usb-c-plug-TPU` | TPU 95A | 1 (+ spare) | flush plug with snap bead and pull groove (same as the Shield) |
| `08-ppg-window-clear` | clear PC / acrylic | 1 | 2 mm thick; best cut from 2 mm clear PC, because printed clear PETG scatters light |
| `09-sensor-yoke-TPU-grey` | TPU 95A, grey | 1 | contact face down; 2 pegs locate it in the neck |

**Recommended settings:** 0.4 mm nozzle, 0.16 mm layers, 5 perimeters (the 1.6–2.0 mm walls print solid), 6 top and bottom layers, 40 % gyroid inside the solid neck, ironing off. Use **ASA** for the longest UV life in the sun, or PETG. Avoid PLA: it creeps above about 50 °C, which a dark tag can reach in tropical sun. TPU parts: 25 mm/s, 100 % infill.

## Hardware

| Item | Qty |
| --- | --- |
| M2 × 14 countersunk screw, A2 stainless (DIN 965 / ISO 7046) | 2 |
| M2 × 3 brass heat-set insert (Ø3.2 mm hole) | 2 |
| Solar cell ANYSOLAR SM141K05L (or equivalent ≤ 35 × 22 × 2.1 mm) | 1 |
| Standard cattle tag **male button** (e.g. Allflex Global/Universal male, pin ≈ 19 mm) + applicator | 1 per animal |
| Clear neutral-cure silicone or UV epoxy (solar cell, sensor windows), flexible adhesive (yoke), Kapton tape, 0.4 mm foam pad | — |

## Assembly

1. Press the 2 heat-set inserts into the cover bosses with a soldering iron at 220 °C.
2. **Solar cell**: run a thin bead of clear silicone (or UV epoxy) round the inside of the rear window. Lay the cell face-down between the locating ribs and let it cure. This bond is part of the seal.
3. Fit the PPG window into its recess from the back (thin ring of clear epoxy or silicone around the edge); it stands 1 mm proud.
4. Fit the MLX90614 (can into the Ø8.4 aperture, flange on the ledge) and the MAX30102 module (sensor against the window). Seal both from the inside with silicone.
5. Press the TPU lock ring into the neck pocket through the cap opening until it seats at the bottom.
6. Place the battery on a 0.4 mm foam pad over the cell. Put the XIAO + Wio stack on it components-down, with USB-C in the port, and the harvester to its right. Fit the GNSS module, the IMU and the FPC antenna (along the left wall), and the GNSS patch into its frame in the cover.
7. Wire solar → harvester → battery (also to the XIAO battery pads), the I²C sensors and the GNSS UART. Flash and test on the bench (`pio run -t upload`, then `python -m terrava_iot decode …` on an uplink).
8. Lay the gasket on the housing lip. Hook the cover's tongue into the neck slot, swing the cover down, and drive the 2 screws from the back (snug, about 0.15 N·m).
9. Press in the USB plug. Fit the yoke: pegs into the neck holes, PPG window through its opening, a few dabs of flexible adhesive.

## Plug & use (field)

1. **Charge** over USB-C on the bottom edge: full in about 1.5 h.
2. **Seal**: press the TPU plug in flush.
3. **Register** the DevEUI in Terrava → Devices and pair it with the animal (same flow as [`iot/README.md`](../../README.md)).
4. **Load**: take the grey cap off, put the neck on the applicator's female spike, and put a male button on the pin. The body hangs free of the jaw; check that your applicator clears an 18 mm body.
5. **Apply**: logo out, yoke against the ear, in the middle third, 20–25 mm above the lower ear margin and below the lower cartilage rib. Disinfect, then press in one firm stroke.
6. **Cap & go**: snap the grey cap in. The tag joins LoRaWAN and reports within one interval, and the sun tops it up.

Removal: cut the male pin, pop the cap out, and fit a new lock ring.

## Power budget (estimate)

| Profile | Assumptions | Consumption | Runtime on 250 mAh (80 % usable), no sun |
| --- | --- | --- | --- |
| Firmware default | 5 min interval, 15 s awake at ~45 mA, GPS every 3rd cycle | ≈ 85 mAh/day | ≈ 2.5 days |
| **Field profile** | 15 min interval, ~6 s awake, IMU FIFO for activity, GPS hourly (hot start), sensors on a switched rail | ≈ 9 mAh/day | ≈ 22 days |
| Solar harvest | 154 mW cell, hanging tag ≈ 10 % of horizontal sun (≈ 4.8 kWh/m²·day in Indonesia), 75 % harvester efficiency | **+7 to +15 mAh/day** in open pasture, < 1 mAh/day in a barn | field profile is **energy-neutral or better outdoors** |
| Field + XIAO nRF52840 | same pocket, ~5 µA sleep, ~8 mA active | ≈ 3 mAh/day | ≈ 2 months without sun, indefinitely with it |

These are planning numbers. Measure on the real build with a current logger (for example a Nordic PPK2), and log the harvester output for a week on a real animal.

## Weight

Housing 11.1 g, cover 4.8 g, yoke 0.7 g, the other small parts 0.9 g, electronics ≈ 26.4 g (XIAO + LoRa 5.5 g, GNSS 5.5 g, battery 5.5 g, solar cell 3.2 g, the rest about 6.7 g), for **≈ 44 g** in total. It is slightly lighter than the Shield, but it hangs: the weight acts on the pin, not across the ear. Use it on growing and adult cattle (≥ 250 kg), and watch the ear on a pilot group.

## Validation checklist before field use

- [ ] Fit-check one printed housing and cover with your actual modules (pocket sizes are parameters)
- [ ] Hook + screws: the cover closes evenly and the gasket seam is closed all round, across the neck base too
- [ ] Male button fit: pass the arrow tip through the Ø7.2 bore and lock ring; pull-out force should exceed 100 N
- [ ] Submersion test, 1 m for 30 min, with a dry tissue inside (IP67 target); check the solar cell bond especially
- [ ] Solar: log harvester current in sun and shade; confirm the cell is not shaded by the yoke at your mounting height
- [ ] RF check: compare RSSI/SNR with the Shield's 40 mm FPC; trim the antenna run if needed
- [ ] Sensor calibration: IR offset (`TEMP_CAL_OFFSET_C`) against rectal temperature; PPG contact quality while the tag hangs
- [ ] Swing and drop: 1.5 m onto concrete, a 70 °C oven soak for 1 h (sun load), and a pull/snag test on the body
- [ ] Animal welfare: watch the ear daily for one week on a pilot group

## Regenerating everything

The Classic reuses the Shield's toolchain (helpers, studio lighting, drawing kit, fonts, traced logo), so both must be present.

```bash
cd iot/ear-tag-specifications/tv-et0-classic/cad
python -m venv .venv && .venv/Scripts/activate       # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python terrava_classic.py     # CAD + interference/mass checks -> models/ (STEP, STL, GLB)
python drawings_classic.py    # -> images/drawings/ (PNG + PDF)
python render_classic.py      # -> images/renders/ (Mitsuba 3, CPU; ~90 min at full quality)
python render_classic.py lineup   # -> ../../images/terrava-ear-tag-lineup.png (needs the Shield's meshes)
python compose_classic.py     # -> overview, concept-vs-CAD and family posters
python build_viewer.py        # -> terrava-classic-3d-viewer.html
```

`python terrava_classic.py --check` only prints the interference and mass report (`models/build-report.json`).

## Folder structure

```
ear-tag-specifications/tv-et0-classic/
├── README.md / README-ind.md
├── terrava-classic-3d-viewer.html     interactive model (offline-capable)
├── cad/                               parametric source + toolchain
│   ├── terrava_classic.py             CadQuery model, checks, exports
│   ├── render_classic.py · drawings_classic.py · compose_classic.py · build_viewer.py
│   └── viewer_template.html · requirements.txt
├── models/
│   ├── stl/                           print-ready parts
│   ├── step/                          parts + coloured assembly
│   ├── terrava-classic-assembly.glb
│   └── build-report.json              interference + mass report
└── images/
    ├── 00-terrava-classic-overview.png
    ├── 08-concept-vs-cad.png
    ├── renders/                       photoreal renders + catalogue views
    └── drawings/                      A3 drawing sheets (PNG + PDF)
```

## References

- 2025 Terrava concept and prototype: [`references/Prototype-Terrava-Ear-Tag-v1.png`](../references/Prototype-Terrava-Ear-Tag-v1.png)
- Oklahoma State University Extension, [Livestock tagging](https://extension.okstate.edu/fact-sheets/livestock-tagging): placement in the middle third, between the ribs
- SRUC, [Implication of smart ear tags' material, shape, weight and placement](https://pure.sruc.ac.uk/en/publications/implication-of-smart-ear-tags-material-shape-weight-and-placement/): lighter, compact tags reduce droop and loss
- ANYSOLAR [SM141K05L](https://www.digikey.com/en/products/detail/anysolar-ltd/SM141K05L/13401974): 35 × 22 × 2.1 mm, 154 mW monocrystalline cell
- Seeed Studio, [XIAO ESP32S3 & Wio-SX1262 kit](https://wiki.seeedstudio.com/wio_sx1262_with_xiao_esp32s3_kit/): 21 × 17.8 mm form factor
- Allflex, [Button Male (M1)](https://www.allflex.global/product/button-male-m1) and [ICAR test data](https://www.icar.org/?p=1687) for male pin lengths
