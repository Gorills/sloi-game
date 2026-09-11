import json
from pathlib import Path

from fastapi.testclient import TestClient

from server.app import create_app

ROOT = Path(__file__).resolve().parents[1]


def test_health_and_built_catalog():
    with TestClient(create_app()) as client:
        assert client.get("/health").json() == {"status": "ok", "surface": "design-catalog"}
        response = client.get("/")
        assert response.status_code == 200
        assert response.text == (ROOT / "dist/index.html").read_text(encoding="utf-8")
        assert client.get("/AGENTS.md").status_code == 404
        assert client.get("/.env").status_code == 404


def test_missing_build_is_explicit_failure(tmp_path):
    with TestClient(create_app(tmp_path / "missing.html")) as client:
        assert client.get("/").status_code == 503


def luminance(color):
    channels = [int(color[index : index + 2], 16) / 255 for index in (1, 3, 5)]
    linear = [
        value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4
        for value in channels
    ]
    return sum(
        value * weight for value, weight in zip(linear, (0.2126, 0.7152, 0.0722), strict=True)
    )


def test_declared_token_contrast():
    design = json.loads((ROOT / "client/design/tokens.json").read_text())
    tokens = design["tokens"]
    for foreground, background, minimum in design["contrast"]:
        values = sorted([luminance(tokens[foreground]), luminance(tokens[background])])
        assert (values[1] + 0.05) / (values[0] + 0.05) >= minimum, foreground
