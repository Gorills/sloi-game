"""Build the small catalog with TypeScript and native import maps, not a custom engine."""

import base64
import json
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def build() -> Path:
    version = subprocess.check_output(["tsc", "--version"], text=True).strip()
    if version != "Version 5.8.3":
        raise RuntimeError(f"Expected TypeScript 5.8.3, got {version}")
    with tempfile.TemporaryDirectory(prefix="sloi-build-") as temporary:
        subprocess.run(
            ["tsc", "-p", str(ROOT / "tsconfig.json"), "--outDir", temporary],
            check=True,
            timeout=60,
        )
        imports = {}
        for module in sorted(Path(temporary).rglob("*.js")):
            name = "@sloi/" + module.relative_to(temporary).with_suffix("").as_posix()
            encoded = base64.b64encode(module.read_bytes()).decode("ascii")
            imports[name] = "data:text/javascript;base64," + encoded
    tokens = json.loads((ROOT / "client/design/tokens.json").read_text())["tokens"]
    variables = ";".join(f"--{name}:{value}" for name, value in tokens.items())
    css = "\n".join(
        (ROOT / "client" / name).read_text(encoding="utf-8")
        for name in ("layout.css", "components.css")
    )
    scripts = '<script type="importmap">' + json.dumps({"imports": imports}) + "</script>"
    scripts += '<script type="module">import "@sloi/gallery";</script>'
    html = (ROOT / "client/index.html").read_text(encoding="utf-8")
    html = html.replace("<!-- STYLES -->", f"<style>:root{{{variables}}}{css}</style>")
    html = html.replace("<!-- MODULES -->", scripts)
    target = ROOT / "dist/index.html"
    target.parent.mkdir(exist_ok=True)
    target.write_text(html, encoding="utf-8")
    return target


if __name__ == "__main__":
    print(build())
