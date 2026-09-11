import subprocess
import sys
from pathlib import Path

import pytest

from tools.check_repo import check, inspect_file
from tools.repo_rules import code_errors, local_links, skill_errors

ROOT = Path(__file__).resolve().parents[1]


def test_current_repository():
    assert check(ROOT) == []


def test_rejects_oversized_source_and_function():
    assert code_errors(Path("client/oversized.ts"), "// line\n" * 301)
    source = "def oversized():\n" + "    value = 1\n" * 60
    assert any("function" in error for error in code_errors(Path("server/test.py"), source))


def test_comments_and_strings_are_not_skipped_tests():
    assert code_errors(Path("tests/test_example.py"), 'value = "pytest.skip()"\n') == []
    assert code_errors(Path("tests/test_example.py"), "import pytest\npytest.skip('hidden')")


def test_missing_local_link(tmp_path):
    page = tmp_path / "page.md"
    page.write_text("[Broken](absent.md)\n", encoding="utf-8")
    errors, links = inspect_file(tmp_path, page)
    assert errors and links == [tmp_path / "absent.md"]
    assert local_links(page, "[External](https://example.com)") == []


@pytest.mark.parametrize("name", ["book.docx", "book.DOCX", ".env.production", "save.sqlite-wal"])
def test_private_files_are_rejected_even_if_tracked(tmp_path, name):
    private = tmp_path / name
    private.write_bytes(b"not-a-document")
    errors, _ = inspect_file(tmp_path, private)
    assert any("private" in error for error in errors)


@pytest.mark.parametrize("name,description", [("BAD", "good"), ("valid", ""), ("other", "good")])
def test_skill_metadata_rejects_invalid_inputs(name, description):
    content = f"---\nname: {name}\ndescription: '{description}'\n---\ndocs/research.md\n"
    assert skill_errors(Path("valid/SKILL.md"), content)


def test_typescript_gate_detects_any_and_long_function(tmp_path):
    sample = tmp_path / "bad.ts"
    sample.write_text("function tooLong(value: any) {\n" + "  value++;\n" * 60 + "}\n")
    result = subprocess.run(
        ["node", "tools/check_ts.cjs", str(sample)], cwd=ROOT, capture_output=True, text=True
    )
    assert result.returncode == 1
    assert "explicit any" in result.stdout and "function exceeds" in result.stdout


def test_runtime_skip_alias_cannot_make_suite_green(tmp_path):
    sample = tmp_path / "test_alias.py"
    sample.write_text("from pytest import skip as defer\ndef test_hidden():\n    defer('hidden')\n")
    result = subprocess.run(
        [sys.executable, "-m", "pytest", "-q", "-p", "tools.pytest_policy", str(sample)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    assert result.returncode == 1
    assert "Required checks cannot be skipped" in result.stdout
