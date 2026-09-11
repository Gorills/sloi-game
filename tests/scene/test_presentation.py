import pytest
from playwright.sync_api import expect

pytestmark = pytest.mark.browser


def test_viewport_resize_and_large_text(scene_page):
    page = scene_page
    page.set_viewport_size({"width": 1280, "height": 720})
    page.get_by_role("button", name="Настройки и управление").click()
    page.get_by_label("Размер текста").select_option("2")
    page.get_by_label("Уменьшить движение").check()
    expect(page.locator("html")).to_have_attribute("data-motion", "reduced")
    page.keyboard.press("Escape")
    page.keyboard.press("i")
    expect(page.get_by_role("dialog", name="Дорожная сумка")).to_be_visible()
    page.wait_for_function(
        "document.querySelector('#scene').width === Math.round(document.querySelector('#scene').clientWidth * Math.min(devicePixelRatio, 2))"
    )
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
    panel = page.locator("#inventory").bounding_box()
    assert panel and panel["x"] >= 0 and panel["y"] >= 0
    assert panel["width"] <= 1280 and panel["height"] <= 720
    page.get_by_role("button", name="Закрыть сумку").click()
    for button in page.locator(".actionbar button").all():
        label = button.locator("span").bounding_box()
        bounds = button.bounding_box()
        assert label and bounds
        assert label["x"] >= bounds["x"] - 1
        assert label["x"] + label["width"] <= bounds["x"] + bounds["width"] + 1
    message = page.locator("#scene-message").bounding_box()
    actions = page.locator(".actionbar").bounding_box()
    assert message and actions
    assert message["y"] + message["height"] <= actions["y"]


def test_art_scene_renders_and_map_opens(scene_page):
    page = scene_page
    assert page.locator("#scene").evaluate(
        "canvas => { const p=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data; const s=new Set(); for(let i=0;i<p.length;i+=64) s.add(`${p[i]},${p[i+1]},${p[i+2]}`); return s.size>500; }"
    )
    page.keyboard.press("m")
    expect(page.get_by_role("dialog", name="Окрестности")).to_be_visible()
    expect(page.locator(".map-legend")).to_contain_text("Манекен")
    page.keyboard.press("m")
    expect(page.get_by_role("dialog", name="Окрестности")).not_to_be_visible()
