"""Build two self-contained surfaces with native import maps and the pinned compiler."""

import base64
import json
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def compile_modules() -> dict[str, str]:
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
    return imports


def write_page(
    imports: dict[str, str], source: str, styles: tuple[str, ...], entry: str, output: str
) -> Path:
    tokens = json.loads((ROOT / "client/design/tokens.json").read_text())["tokens"]
    variables = ";".join(f"--{name}:{value}" for name, value in tokens.items())
    css = "\n".join((ROOT / "client" / name).read_text(encoding="utf-8") for name in styles)
    scripts = '<script type="importmap">' + json.dumps({"imports": imports}) + "</script>"
    scripts += f'<script type="module">import "@sloi/{entry}";</script>'
    html = (ROOT / "client" / source).read_text(encoding="utf-8")
    html = html.replace("<!-- STYLES -->", f"<style>:root{{{variables}}}{css}</style>")
    html = html.replace("<!-- MODULES -->", scripts)
    target = ROOT / "dist" / output
    target.parent.mkdir(exist_ok=True)
    target.write_text(html, encoding="utf-8")
    return target


def build() -> Path:
    imports = compile_modules()
    catalog = write_page(
        imports, "index.html", ("layout.css", "components.css"), "gallery", "index.html"
    )
    write_page(
        imports, "scene/index.html", ("scene/scene.css", "scene/panels.css"), "scene/main", "scene.html"
    )
    return catalog


if __name__ == "__main__":
    print(build())
