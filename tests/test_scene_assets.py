import base64
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from fastapi.testclient import TestClient

from server.app import create_app

ROOT = Path(__file__).resolve().parents[1]


def test_study_delivery_and_self_contained_artwork():
    html = (ROOT / "dist/scene.html").read_text(encoding="utf-8")
    with TestClient(create_app()) as client:
        assert client.get("/").text == html
        assert client.get("/scene").text == html
        assert client.get("/catalog").text != html
        assert client.get("/client/art/house.svg").status_code == 404
    match = re.search(r'<script id="scene-assets" type="application/json">(.*?)</script>', html)
    assert match
    manifest = json.loads(match[1])
    assert len(manifest) == 16
    for name, data_url in manifest.items():
        actual = base64.b64decode(data_url.split(",", 1)[1])
        assert actual == (ROOT / "client/art" / f"{name}.svg").read_bytes()
        tree = ET.fromstring(actual)
        assert int(tree.attrib["width"]) > 0 and int(tree.attrib["height"]) > 0
        assert not tree.findall(".//{http://www.w3.org/2000/svg}script")
        assert "http" not in actual.decode().replace("http://www.w3.org/2000/svg", "")
    assert "<!--" not in html


def test_missing_scene_build_is_503(tmp_path):
    with TestClient(create_app(tmp_path / "index.html")) as client:
        assert client.get("/scene").status_code == 503
        assert client.get("/").status_code == 503
