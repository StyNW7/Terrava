# Terrava Smart Ear Tag: two 3D-printable designs

[🇮🇩 Bahasa Indonesia](README-ind.md)

Terrava has two smart ear tag enclosures. Both are sealed, print without supports, carry the same electronics kit and run the same firmware and LoRaWAN payload. They differ in how they sit on the ear.

<p align="center"><img src="images/00-terrava-ear-tag-family.png" alt="Terrava ear tag family: TV-ET1 Shield and TV-ET0 Classic" width="100%"></p>

| | [**TV-ET0 Classic**](tv-et0-classic/README.md) | [**TV-ET1 Shield**](tv-et1-shield/README.md) |
| --- | --- | --- |
| Origin | the original 2025 Terrava design ([references](references/Prototype-Terrava-Ear-Tag-v1.png)), rebuilt | new compact design (2026) |
| Form | dangle tag: round-top neck, shoulders, wide body | flat "shield", clamped flat on the ear |
| Envelope | 42 × 66 × 18 mm | 46 × 68 × 14 mm |
| Weight (complete) | ≈ 44 g | ≈ 48 g |
| Battery | LiPo 302535 ≈ 250 mAh | LiPo 602535 ≈ 500 mAh |
| Solar | 154 mW cell on the back, standard | optional 32 × 17 mm front cell (solar edition) |
| Body sensors | PPG + IR in a soft TPU yoke under the pin | PPG + IR either side of the pin |
| Shell | housing + cover, neck hook + 2 × M2 | rear + front shell, 4 × M2 |
| Runtime, field profile | ≈ 22 days without sun, energy-neutral outdoors | ≈ 45 days |
| Choose it for | the familiar tag look, solar top-up on pasture | the lowest profile, the longest battery life, most stable sensor contact |

**Shared by both**

- **Electronics:** Seeed XIAO ESP32S3 + Wio-SX1262 (LoRaWAN AS923-2), MLX90614 IR thermometer, MAX30102 PPG, 6-axis IMU, L76K-class GNSS with an 18 mm patch, LoRa FPC antenna, USB-C behind a flush TPU plug.
- **Mounting:** a standard two-piece cattle tag male button, locked by a replaceable TPU ring, in the middle third of the ear.
- **Print and seal:** PETG or ASA plus TPU 95A, a two-colour flush logo inlay, a lap joint with a TPU gasket. Both have an IP67 design target that still needs testing.
- **Firmware:** both need the same port from the LilyGO T-Beam (SX1276) to the XIAO + SX1262. It is described in each spec sheet; the payload and backend stay unchanged.

Each design folder has the same set of deliverables:

- a parametric CadQuery source with an interference and mass check;
- print-ready STLs and STEP files with a coloured assembly;
- photoreal renders;
- three A3 drawing sheets (PNG + PDF);
- an offline 3D viewer;
- a full spec sheet in English and Indonesian.

## Folder structure

```
ear-tag-specifications/
├── README.md / README-ind.md        this index
├── images/                          family poster + side-by-side render
├── references/                      2025 concept renders and prototype photos (source of the Classic)
├── tv-et0-classic/                  TV-ET0 Classic: README, cad/, models/, images/, 3D viewer
└── tv-et1-shield/                   TV-ET1 Shield: README, cad/, models/, images/, 3D viewer
```

The Classic's scripts reuse the Shield's CAD helpers, studio lighting, drawing kit, fonts and traced logo from `tv-et1-shield/cad/`, so keep both folders together.
