import pytest
from playwright.sync_api import expect

pytestmark = pytest.mark.browser


def test_keyboard_dialog_and_focus(catalog_page):
    page = catalog_page
    opener = page.get_by_role("button", name="Показать управление")
    opener.click()
    expect(page.get_by_role("dialog")).to_be_visible()
    page.keyboard.press("Escape")
    expect(page.get_by_role("dialog")).not_to_be_visible()
    expect(opener).to_be_focused()
    page.keyboard.press("Space")
    expect(page.get_by_role("dialog")).to_be_visible()
    page.get_by_role("button", name="Вернуться", exact=True).click()
    expect(opener).to_be_focused()


def test_states_and_reduced_motion(catalog_page):
    page = catalog_page
    page.locator("#action-state").select_option("insufficient")
    expect(page.locator("#action-preview")).to_be_disabled()
    expect(page.locator("#action-reason")).to_contain_text("Не хватает осколков")
    page.locator("#action-state").select_option("ready")
    page.locator("#action-preview").click()
    expect(page.locator("#action-reason")).to_contain_text("ещё не реализован")
    page.locator("#connection-state").select_option("reconnecting")
    page.get_by_label("Уменьшить движение").check()
    expect(page.locator("html")).to_have_attribute("data-motion", "reduced")
    assert page.locator("#connection-message").evaluate(
        "element => getComputedStyle(element).animationName"
    ) == "none"


def test_narrow_large_text_and_canvas_dpr(catalog_page):
    page = catalog_page
    page.set_viewport_size({"width": 390, "height": 844})
    page.locator("#text-scale").select_option("200")
    expect(page.get_by_role("heading", name="Маршрут экспедиции")).to_be_visible()
    page.wait_for_function(
        "document.querySelector('#map').width === Math.round(document.querySelector('#map').getBoundingClientRect().width * devicePixelRatio)"
    )
    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
    assert page.locator("#map").evaluate(
        "canvas => new Set(canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data).size > 8"
    )
