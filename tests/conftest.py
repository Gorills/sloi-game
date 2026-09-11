import os
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import pytest
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"
pytest_plugins = ["tools.pytest_policy"]


@pytest.fixture(scope="session")
def server_url():
    ARTIFACTS.mkdir(exist_ok=True)
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        port = listener.getsockname()[1]
    url = f"http://127.0.0.1:{port}"
    with (ARTIFACTS / "catalog-server.log").open("w") as log:
        process = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "uvicorn",
                "server.app:app",
                "--host",
                "127.0.0.1",
                "--port",
                str(port),
            ],
            cwd=ROOT,
            stdout=log,
            stderr=log,
        )
        try:
            wait_for_server(url, process)
            yield url
        finally:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=5)


def wait_for_server(url, process):
    deadline = time.monotonic() + 10
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError("Catalog server exited; inspect artifacts/catalog-server.log")
        try:
            with urllib.request.urlopen(url + "/health", timeout=0.2) as response:
                if response.status == 200:
                    return
        except (urllib.error.URLError, TimeoutError):
            time.sleep(0.05)
    raise TimeoutError("Catalog server did not start")


@pytest.fixture
def catalog_page(server_url, request):
    mode = os.environ.get("BROWSER_BOOTSTRAP", "url")
    if mode not in {"url", "embedded"}:
        raise ValueError("BROWSER_BOOTSTRAP must be url or embedded")
    errors = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path=os.environ.get("CHROMIUM_EXECUTABLE") or None, headless=True
        )
        context = browser.new_context(
            viewport={"width": 1280, "height": 960}, device_scale_factor=2
        )
        context.tracing.start(screenshots=True, snapshots=True, sources=True)
        page = context.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        try:
            if mode == "url":
                page.goto(server_url + "/catalog", wait_until="load")
            else:
                with urllib.request.urlopen(server_url + "/catalog", timeout=5) as response:
                    html = response.read().decode("utf-8")
                assert html == (ROOT / "dist/index.html").read_text(encoding="utf-8")
                page.set_content(html, wait_until="load")
            yield page
            assert errors == [], errors
        finally:
            try:
                page.screenshot(
                    path=str(ARTIFACTS / f"{request.node.name}-{mode}.png"), full_page=True
                )
                context.tracing.stop(path=str(ARTIFACTS / f"{request.node.name}-{mode}-trace.zip"))
            finally:
                browser.close()
