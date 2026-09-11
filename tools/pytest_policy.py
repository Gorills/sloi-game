"""A green required suite must contain no skipped, xfailed or unexpectedly passed tests."""

import pytest


def pytest_sessionfinish(session: pytest.Session) -> None:
    reporter = session.config.pluginmanager.get_plugin("terminalreporter")
    if reporter is None:
        return
    if any(reporter.stats.get(outcome) for outcome in ("skipped", "xfailed", "xpassed")):
        reporter.write_line("Required checks cannot be skipped or expected to fail.", red=True)
        session.exitstatus = pytest.ExitCode.TESTS_FAILED
