"""Pure TypeScript model checks use Node, not a second Python implementation of the rules."""

import base64
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture(scope="module")
def compiled_model(tmp_path_factory):
    directory = tmp_path_factory.mktemp("study-ts")
    subprocess.run(
        ["tsc", "-p", str(ROOT / "tsconfig.json"), "--outDir", str(directory)],
        check=True,
        capture_output=True,
        timeout=30,
    )
    world = (directory / "scene/world.js").read_text()
    model = (directory / "scene/model.js").read_text()
    return world, model


def data_module(source):
    return "data:text/javascript;base64," + base64.b64encode(source.encode()).decode()


def run_model(sources, script):
    world, model = sources
    world_url = data_module(world)
    model_url = data_module(model.replace("@sloi/scene/world", world_url))
    program = (
        "import assert from 'node:assert/strict';\n"
        f"import * as w from '{world_url}';\n"
        f"import * as m from '{model_url}';\n" + script
    )
    return subprocess.run(
        ["node", "--input-type=module", "-e", program],
        capture_output=True,
        text=True,
        timeout=10,
    )


def test_movement_is_bounded_and_diagonal_is_not_faster(compiled_model):
    result = run_model(
        compiled_model,
        """
const a = m.createState(), b = m.createState();
m.move(a, 1, 0, .05); m.move(b, 1, 1, .05);
assert.ok(Math.abs(w.distance(a.player, w.START) - w.distance(b.player, w.START)) < 1e-8);
m.move(a, 1, 0, 100);
assert.ok(w.distance(a.player, w.START) <= 22.00001);
const before = {...a.player}; m.move(a, 1, 0, -5); assert.deepEqual(a.player, before);
a.player = {x:1080, y:755}; m.move(a, 0, -1, .05); assert.ok(a.player.y >= 753);
a.panel = 'inventory'; const paused = {...a.player}; m.move(a, 1, 0, .05);
assert.deepEqual(a.player, paused);
""",
    )
    assert result.returncode == 0, result.stderr


def test_pickup_regression_and_mutant_sensitivity(compiled_model):
    script = """
const s = m.createState(); m.interact(s); assert.equal(s.reserve, 12);
s.player = {x:w.CACHE.x, y:w.CACHE.y + 50};
m.interact(s); assert.equal(s.reserve, 18);
m.interact(s); assert.equal(s.reserve, 18);
"""
    assert run_model(compiled_model, script).returncode == 0
    world, model = compiled_model
    broken = model.replace("state.suppliesTaken = true;", "")
    assert broken != model
    result = run_model((world, broken), script)
    assert result.returncode != 0 and "24 !== 18" in result.stderr


def test_weapon_denials_cooldown_reload_and_line_of_sight(compiled_model):
    result = run_model(
        compiled_model,
        """
const s = m.createState(); assert.equal(m.shoot(s, 1), false);
s.selected = true; s.player = {x:100, y:100}; assert.equal(m.shoot(s, 2), false);
s.player = {x:1300, y:880}; assert.equal(m.shoot(s, 3), true);
assert.equal(s.ammo, 5); assert.equal(m.shoot(s, 3.1), false);
m.reload(s, 4); assert.equal(m.shoot(s, 4.5), false);
m.advance(s, 5.2); assert.equal(s.ammo, 6); assert.equal(s.reserve, 11);
s.ammo = 0; assert.equal(m.shoot(s, 6), false);
s.panel = 'inventory'; m.reload(s, 7); assert.equal(s.reloadUntil, 0);
assert.equal(w.clearShot({x:1080,y:900},{x:1080,y:650}), false);
""",
    )
    assert result.returncode == 0, result.stderr
