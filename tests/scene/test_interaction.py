import pytest
from playwright.sync_api import expect

pytestmark = pytest.mark.browser


def position(page):
    return page.locator("#scene").evaluate(
        "c => [Number(c.dataset.playerX), Number(c.dataset.playerY)]"
    )


def walk(page, key, milliseconds):
    # Duration is the actual input being tested, not a sleep used to wait for readiness.
    page.keyboard.down(key)
    page.wait_for_timeout(milliseconds)
    page.keyboard.up(key)
    page.wait_for_function("document.querySelector('#scene').dataset.walking === 'false'")


def test_preparation_shot_and_inventory(scene_page):
    page = scene_page
    walk(page, "a", 470)
    walk(page, "w", 380)
    page.keyboard.press("e")
    expect(page.get_by_role("dialog", name="Перед выходом")).to_be_visible()
    page.get_by_role("button", name="Взять карту").click()
    expect(page.locator("#scene")).to_have_attribute("data-supplied", "true")
    page.keyboard.press("i")
    expect(page.get_by_role("button", name="Карта тракта", exact=True)).to_be_visible()
    page.get_by_role("button", name="Карта тракта", exact=True).click()
    expect(page.locator("#item-title")).to_have_text("Карта тракта")
    page.keyboard.press("Escape")
    walk(page, "s", 400)
    walk(page, "d", 1500)
    target = page.locator("#scene").evaluate(
        "c => [Number(c.dataset.targetX), Number(c.dataset.targetY)]"
    )
    page.mouse.click(*target)
    page.keyboard.press("Space")
    expect(page.locator("#hit-count")).to_have_text("1")
    expect(page.locator("#rounds")).to_have_text("5")
    page.keyboard.press("r")
    expect(page.locator("#rounds")).to_have_text("6")
    page.keyboard.press("i")
    expect(page.locator("#inventory-count")).to_have_text("4 предмета")


def test_dialog_and_focus_do_not_move_or_fire(scene_page):
    page = scene_page
    before = position(page)
    page.keyboard.press("i")
    expect(page.get_by_role("dialog", name="Дорожная сумка")).to_be_visible()
    walk(page, "d", 250)
    assert position(page) == before
    page.get_by_role("button", name="Фляга", exact=True).click()
    page.keyboard.press("Space")
    expect(page.locator("#hit-count")).to_have_text("0")
    page.keyboard.press("i")
    expect(page.get_by_role("dialog", name="Дорожная сумка")).not_to_be_visible()
    expect(page.get_by_role("button", name="Открыть сумку")).to_be_focused()
    walk(page, "d", 180)
    assert position(page)[0] > before[0] + 10


def test_canvas_blur_releases_held_movement(scene_page):
    page = scene_page
    page.keyboard.down("d")
    page.wait_for_function("Number(document.querySelector('#scene').dataset.playerX) > 1290")
    page.get_by_role("button", name="Открыть сумку").click()
    page.wait_for_function("document.querySelector('#scene').dataset.walking === 'false'")
    before = position(page)
    page.keyboard.press("Escape")
    # Observe longer than multiple actual animation frames while the physical key is held.
    page.wait_for_timeout(250)
    assert position(page) == before
    page.keyboard.up("d")


def test_requires_target_and_range(scene_page):
    page = scene_page
    page.keyboard.press("Space")
    expect(page.locator("#scene-message")).to_contain_text("Сначала выберите")
    page.keyboard.press("f")
    page.keyboard.press("Space")
    expect(page.locator("#scene-message")).to_contain_text("Слишком далеко")
    expect(page.locator("#hit-count")).to_have_text("0")
    expect(page.locator("#rounds")).to_have_text("6")


def test_collision_with_well(scene_page):
    page = scene_page
    walk(page, "w", 1800)
    x, y = position(page)
    assert 1230 < x < 1290
    assert 810 < y < 850  # Bottom of the visible well, not its roof.
    walk(page, "w", 350)
    assert abs(position(page)[1] - y) < 1
