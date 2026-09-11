"""Small, explicit project rules. Not a general-purpose linter or security scanner."""

import ast
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

import yaml

SOURCE_SUFFIXES = {".py", ".ts", ".js", ".cjs", ".css", ".html"}
PRIVATE_SUFFIXES = {".docx", ".pdf", ".db", ".sqlite", ".sqlite3"}
LINK = re.compile(r"\[[^\]]*\]\(([^\s)]+)\)")


def code_errors(path: Path, text: str) -> list[str]:
    errors = []
    limit = 400 if "tests" in path.parts else 300
    if path.suffix in SOURCE_SUFFIXES and len(text.splitlines()) > limit:
        errors.append(f"{path}: exceeds {limit} physical lines")
    if path.suffix != ".py":
        return errors
    try:
        tree = ast.parse(text)
    except SyntaxError as exc:
        return errors + [f"{path}: {exc}"]
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if (node.end_lineno or node.lineno) - node.lineno + 1 > 60:
                errors.append(f"{path}:{node.lineno}: function exceeds 60 lines")
        if "tests" in path.parts and isinstance(node, ast.Call):
            if isinstance(node.func, ast.Attribute) and node.func.attr in {"skip", "skipif", "xfail"}:
                errors.append(f"{path}:{node.lineno}: skipped required checks are forbidden")
    return errors


def local_links(path: Path, text: str) -> list[Path]:
    links = []
    for target in LINK.findall(text):
        parsed = urlsplit(target)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        links.append((path.parent / unquote(parsed.path)).resolve())
    return links


def skill_errors(path: Path, text: str) -> list[str]:
    if not text.startswith("---\n") or "\n---\n" not in text[4:]:
        return [f"{path}: missing skill frontmatter"]
    header = text.split("---", 2)[1]
    try:
        metadata = yaml.safe_load(header)
    except yaml.YAMLError as exc:
        return [f"{path}: invalid YAML: {exc}"]
    if not isinstance(metadata, dict):
        return [f"{path}: skill metadata must be a mapping"]
    name = metadata.get("name")
    description = metadata.get("description")
    errors = []
    if not isinstance(name, str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name):
        errors.append(f"{path}: invalid skill name")
    elif len(name) > 64 or name != path.parent.name:
        errors.append(f"{path}: skill name must match folder and fit 64 characters")
    if not isinstance(description, str) or not 1 <= len(description.strip()) <= 1024:
        errors.append(f"{path}: invalid description")
    if len(text.splitlines()) > 150:
        errors.append(f"{path}: skill exceeds local 150-line budget")
    if "docs/research.md" not in text:
        errors.append(f"{path}: missing source reference")
    return errors
