import os

import pytest
from playwright.sync_api import expect, sync_playwright

from tests.scene_browser_support import (
    ARTIFACTS,
    hold_for,
    open_scene,
    screenshot,
    snapshot,
    walk_until,
)

pytestmark = pytest.mark.browser


@pytest.fixture
def scene_page(server_url, request):
    errors = []
    mode = os.environ.get("BROWSER_BOOTSTRAP", "url")
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path=os.environ.get("CHROMIUM_EXECUTABLE") or None, headless=True
        )
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1,
        )
        context.tracing.start(screenshots=False, snapshots=False, sources=True)
        page = context.new_page()
        page.set_default_timeout(8000)
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on(
            "console",
            lambda message: errors.append(message.text) if message.type == "error" else None,
        )
        try:
            open_scene(page, server_url)
            yield page
            assert errors == [], errors
        finally:
            try:
                screenshot(page, f"{request.node.name}-{mode}.png")
                context.tracing.stop(path=str(ARTIFACTS / f"{request.node.name}-{mode}.zip"))
            finally:
                context.close()
                browser.close()


def test_study_walk_supplies_inventory_shoot_and_reload(scene_page):
    page = scene_page
    screenshot(page, "scene-arrival.png")
    walk_until(page, "KeyA", "window.sloiStudy.snapshot().player.x < 995")
    expect(page.locator("#context")).to_be_visible()
    page.keyboard.press("KeyE")
    expect(page.locator("#reserve")).to_have_text("18")
    page.keyboard.press("KeyE")
    expect(page.locator("#reserve")).to_have_text("18")
    expect(page.locator("#notice")).to_contain_text("уже получены")
    page.get_by_role("button", name="Открыть инвентарь").click()
    expect(page.get_by_role("dialog", name="Снаряжение")).to_be_visible()
    expect(page.locator("#inventory-ammo")).to_have_text("18")
    screenshot(page, "scene-inventory.png")
    page.get_by_role("button", name="Закрыть инвентарь").click()
    expect(page.get_by_role("button", name="Открыть инвентарь")).to_be_focused()
    walk_until(page, "KeyD", "window.sloiStudy.snapshot().player.x > 1290")
    page.keyboard.press("KeyF")
    page.keyboard.press("Space")
    expect(page.locator("#hit-count")).to_have_text("Попаданий: 1")
    expect(page.locator("#ammo")).to_have_text("5")
    screenshot(page, "scene-shot.png")
    page.keyboard.press("KeyR")
    expect(page.locator("#ammo")).to_have_text("6")
    expect(page.locator("#reserve")).to_have_text("17")
    assert snapshot(page)["hits"] == 1


def test_study_focus_collision_and_no_action_leak(scene_page):
    page = scene_page
    walk_until(page, "KeyW", "window.sloiStudy.snapshot().player.y < 764")
    # The wall's near edge is y=740 plus player radius=13. Held movement must not cross it.
    hold_for(page, "KeyW", 0.4)
    position = snapshot(page)["player"]
    assert 752 <= position["y"] <= 765
    page.keyboard.down("KeyD")
    page.get_by_role("button", name="Открыть инвентарь").click()
    expect(page.get_by_role("dialog", name="Снаряжение")).to_be_visible()
    position = snapshot(page)["player"]
    page.keyboard.press("Space")
    page.keyboard.up("KeyD")
    expect(page.locator("#ammo")).to_have_text("6")
    assert snapshot(page)["player"] == position
    page.keyboard.press("Escape")
    expect(page.get_by_role("button", name="Открыть инвентарь")).to_be_focused()
    page.locator("#world").focus()
    page.keyboard.down("KeyD")
    page.get_by_role("button", name="Открыть настройки").focus()
    position = snapshot(page)["player"]
    page.keyboard.up("KeyD")
    page.locator("#world").focus()
    page.wait_for_function("!window.sloiStudy.snapshot().walking")
    assert snapshot(page)["player"] == position


def test_study_dpr_pointer_and_small_layout(scene_page):
    page = scene_page
    page.set_viewport_size({"width": 1280, "height": 720})
    page.wait_for_function("window.sloiStudy.snapshot().view.width === 1280")
    view = snapshot(page)["view"]
    page.mouse.click((1560 - view["x"]) * view["scale"], (860 - 70 - view["y"]) * view["scale"])
    expect(page.locator("#target-status")).to_be_visible()
    page.get_by_role("button", name="Карта местности").click()
    expect(page.get_by_role("dialog", name="Южная дорога")).to_be_visible()
    page.keyboard.press("Escape")
    page.get_by_role("button", name="Открыть настройки").click()
    page.get_by_label("Размер текста").select_option("200")
    page.get_by_label("Уменьшить движение").check()
    assert snapshot(page)["reduced"]
    page.set_viewport_size({"width": 390, "height": 844})
    assert page.locator("#settings").evaluate("el => el.scrollWidth <= el.clientWidth")
    expect(page.get_by_label("Размер текста")).to_be_visible()
    page.keyboard.press("Escape")
    expect(page.locator("#ammo")).to_be_visible()
    screenshot(page, "scene-large-text.png")
    page.get_by_role("button", name="Открыть инвентарь").click()
    assert page.locator("#inventory").evaluate("el => el.scrollWidth <= el.clientWidth")
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")


def test_study_empty_ammo_and_ui_click(scene_page):
    page = scene_page
    walk_until(page, "KeyD", "window.sloiStudy.snapshot().player.x > 1280")
    page.keyboard.press("KeyF")
    for i in range(6):
        # Cooldown is actual interaction timing; no game clocks or state are replaced.
        page.wait_for_timeout(560)
        page.get_by_role("button", name="Выстрел по выбранной мишени").click()
        expect(page.locator("#ammo")).to_have_text(str(5 - i))
    page.wait_for_timeout(560)
    page.get_by_role("button", name="Выстрел по выбранной мишени").click()
    expect(page.locator("#notice")).to_contain_text("Барабан пуст")
    expect(page.locator("#hit-count")).to_have_text("Попаданий: 6")
    page.get_by_role("button", name="Перезарядить").click()
    expect(page.locator("#ammo")).to_have_text("6")
    expect(page.locator("#reserve")).to_have_text("6")
