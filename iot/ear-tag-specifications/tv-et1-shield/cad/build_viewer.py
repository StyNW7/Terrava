"""Bundle the assembly GLB into a single offline-friendly viewer page.

    python build_viewer.py   ->  ../terrava-ear-tag-3d-viewer.html
"""

import base64
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
MODELS = HERE.parent / "models"

glb = (MODELS / "terrava-ear-tag-assembly.glb").read_bytes()
mass = json.loads((MODELS / "build-report.json").read_text())["mass"]["total_g"]
html = (HERE / "viewer_template.html").read_text(encoding="utf-8")
html = html.replace("__GLB_BASE64__", base64.b64encode(glb).decode()).replace("__MASS__", f"{mass:.0f}")
out = HERE.parent / "terrava-ear-tag-3d-viewer.html"
out.write_text(html, encoding="utf-8")
print(f"wrote {out} ({out.stat().st_size / 1e6:.1f} MB)")
