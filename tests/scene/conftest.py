"""Real browser for the client-only art study; no simulation/WS assertions are implied."""

import os
import urllib.request
from pathlib import Path

import pytest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
ARTIFACTS = ROOT / "artifacts" / "scene"


def load_study(page, server_url):
    mode = os.environ.get("BROWSER_BOOTSTRAP", "url")
    if mode not in {"url", "embedded"}:
        raise ValueError("Choose url or embedded explicitly")
    if mode == "url":
        page.goto(server_url + "/scene", wait_until="load")
    else:
        with urllib.request.urlopen(server_url + "/scene", timeout=5) as response:
            html = response.read().decode("utf-8")
        assert html == (ROOT / "dist/scene.html").read_text(encoding="utf-8")
        page.set_content(html, wait_until="load")
    page.wait_for_function("document.querySelector('#scene').dataset.ready === 'true'")
    page.wait_for_function("document.querySelector('#scene').dataset.playerX !== undefined")


@pytest.fixture
def scene_page(server_url, request):
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    errors = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path=os.environ.get("CHROMIUM_EXECUTABLE") or None,
            headless=True,
        )
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1,
            record_video_dir=str(ARTIFACTS / "videos"),
            record_video_size={"width": 1440, "height": 900},
        )
        context.tracing.start(screenshots=True, snapshots=True, sources=True)
        page = context.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        try:
            load_study(page, server_url)
            yield page
            assert errors == [], errors
        finally:
            try:
                page.screenshot(path=str(ARTIFACTS / f"{request.node.name}.png"))
                context.tracing.stop(path=str(ARTIFACTS / f"{request.node.name}-trace.zip"))
            finally:
                context.close()
                browser.close()
