"""Check committed and untracked non-ignored files; fail closed on repository errors."""

import re
import subprocess
from pathlib import Path

from tools.repo_rules import PRIVATE_SUFFIXES, code_errors, local_links, skill_errors

ROOT = Path(__file__).resolve().parents[1]


def repository_files(root: Path) -> list[Path]:
    output = subprocess.check_output(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"], cwd=root
    )
    return sorted({root / name.decode("utf-8") for name in output.split(b"\0") if name})


def inspect_file(root: Path, path: Path) -> tuple[list[str], list[Path]]:
    relative = path.relative_to(root)
    errors = []
    if (
        path.suffix.lower() in PRIVATE_SUFFIXES
        or path.name == ".env"
        or (path.name.startswith(".env.") and path.name != ".env.example")
        or any(path.name.endswith(suffix + ending) for suffix in PRIVATE_SUFFIXES
               for ending in ("-wal", "-shm", "-journal"))
    ):
        errors.append(f"{relative}: private source/database must not be published")
    if not path.is_file():
        return errors, []
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return errors, []
    errors += code_errors(relative, text)
    links = local_links(path, text) if path.suffix == ".md" else []
    for target in links:
        if not target.is_relative_to(root) or not target.exists():
            errors.append(f"{relative}: missing/outside local link {target}")
    if relative.parts[0] == "docs" and path.suffix == ".md":
        if not re.search(r"^Status: (accepted|draft|reference|template)$", text, re.MULTILINE):
            errors.append(f"{relative}: missing document status")
    if path.name == "SKILL.md":
        errors += skill_errors(path, text)
    if relative.as_posix() == "AGENTS.md":
        if len(text.splitlines()) > 120 or len(text.encode()) > 12000:
            errors.append("AGENTS.md: exceeds 120 lines / 12000 bytes")
    return errors, links


def check(root: Path) -> list[str]:
    paths = repository_files(root)
    errors = []
    graph = {}
    for path in paths:
        findings, links = inspect_file(root, path)
        errors.extend(findings)
        graph[path.resolve()] = links
    pending = [root / "README.md", root / "AGENTS.md"]
    visited = set()
    while pending:
        path = pending.pop().resolve()
        if path not in visited:
            visited.add(path)
            pending.extend(graph.get(path, []))
    for path in paths:
        if path.is_relative_to(root / "docs") and path.suffix == ".md" and path not in visited:
            errors.append(f"{path.relative_to(root)}: document is not reachable from indexes")
    return errors


if __name__ == "__main__":
    findings = check(ROOT)
    print("\n".join(findings) if findings else "Repository rules: PASS")
    raise SystemExit(bool(findings))
