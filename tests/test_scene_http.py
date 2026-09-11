from pathlib import Path

from fastapi.testclient import TestClient

from server.app import create_app

ROOT = Path(__file__).resolve().parents[1]


def test_scene_only_serves_compiled_surface():
    with TestClient(create_app()) as client:
        result = client.get("/scene")
        assert result.status_code == 200
        assert result.text == (ROOT / "dist/scene.html").read_text(encoding="utf-8")
        assert result.headers["cache-control"] == "no-store"
        assert "Локальная сцена · без сохранений и сетевых игроков" in result.text
        for path in ("/scene/../../AGENTS.md", "/client/scene/index.html", "/artifacts/"):
            assert client.get(path).status_code == 404


def test_missing_scene_build_is_explicit(tmp_path):
    with TestClient(create_app(scene_path=tmp_path / "absent.html")) as client:
        assert client.get("/scene").status_code == 503
