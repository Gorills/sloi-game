PYTHON ?= python
export NODE_PATH := $(shell npm root -g)
export BROWSER_BOOTSTRAP ?= url

.PHONY: check lint build test browser serve

check:
	$(MAKE) lint
	$(MAKE) test
	$(MAKE) browser

lint:
	$(PYTHON) -m tools.check_repo
	node tools/check_ts.cjs
	$(PYTHON) -m ruff check .
	$(PYTHON) -m ruff format --check .

build:
	$(PYTHON) -m tools.build

test: build
	$(PYTHON) -m pytest -q -m "not browser" --junitxml=artifacts/unit.xml

browser: build
	$(PYTHON) -m pytest -q -m browser --junitxml=artifacts/browser.xml

serve: build
	$(PYTHON) -m uvicorn server.app:app --host 127.0.0.1 --port 8000
