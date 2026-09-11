"""Build the study and catalog with TypeScript and native import maps."""

import base64
import json
import subprocess
import tempfile
from pathlib import Path

from tools.foliage import build_foliage

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
    build_scene(imports, variables)
    return target


def build_scene(imports: dict[str, str], variables: str) -> None:
    """Package authored SVG assets and the independent study without runtime fetches."""
    build_foliage()
    sources = {
        asset.stem: "data:image/svg+xml;base64," + base64.b64encode(asset.read_bytes()).decode()
        for asset in sorted((ROOT / "client/art").glob("*.svg"))
    }
    css = "\n".join(
        (ROOT / "client/scene" / name).read_text(encoding="utf-8")
        for name in ("scene.css", "panels.css")
    )
    html = (ROOT / "client/scene/index.html").read_text(encoding="utf-8")
    scripts = '<script type="importmap">' + json.dumps({"imports": imports}) + "</script>"
    scripts += '<script type="module">import "@sloi/scene/main";</script>'
    html = html.replace("<!-- STYLES -->", f"<style>:root{{{variables}}}{css}</style>")
    html = html.replace("<!-- MODULES -->", scripts)
    manifest = '<script id="scene-assets" type="application/json">' + json.dumps(sources) + "</script>"
    html = html.replace("<!-- ASSETS -->", manifest)
    (ROOT / "dist/scene.html").write_text(html, encoding="utf-8")


if __name__ == "__main__":
    print(build())
