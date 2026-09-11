"""Actual browser input; snapshot diagnostics are read-only and never drive the model."""

import os
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts"


def open_scene(page, url):
    mode = os.environ.get("BROWSER_BOOTSTRAP", "url")
    if mode == "url":
        page.goto(url + "/scene", wait_until="load")
    elif mode == "embedded":
        with urllib.request.urlopen(url + "/scene", timeout=5) as response:
            html = response.read().decode("utf-8")
        assert html == (ROOT / "dist/scene.html").read_text(encoding="utf-8")
        page.set_content(html, wait_until="load")
    else:
        raise ValueError("Select url or embedded explicitly")
    page.wait_for_function("document.documentElement.dataset.ready === 'true'")
    page.wait_for_function("window.sloiStudy.snapshot().drawMilliseconds.length > 2")


def snapshot(page):
    return page.evaluate("window.sloiStudy.snapshot()")


def walk_until(page, key, condition):
    page.locator("#world").focus()
    page.keyboard.down(key)
    try:
        page.wait_for_function(condition, timeout=8000)
    finally:
        page.keyboard.up(key)


def hold_for(page, key, seconds):
    """A real held-key duration, not a timing assumption about completion of network I/O."""
    page.locator("#world").focus()
    page.keyboard.down(key)
    try:
        until = time.monotonic() + seconds
        while time.monotonic() < until:
            page.wait_for_timeout(25)
    finally:
        page.keyboard.up(key)


def screenshot(page, name):
    page.screenshot(path=str(ARTIFACTS / name), timeout=8000)
