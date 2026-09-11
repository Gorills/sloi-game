# Запуск и разработка

Status: accepted

## Инструменты

Python 3.13, Node.js 22, TypeScript 5.8.3. Версии Python-пакетов зафиксированы в
[requirements-dev.txt](../requirements-dev.txt). Это проверяемый набор прототипа,
не обещание, что каждая версия — новейшая. Обновления зависимостей — отдельный PR.

```sh
python3.13 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements-dev.txt
npm install --global typescript@5.8.3
python -m playwright install chromium
make build
make serve
```

Установка требует сети и выполняется один раз на окружение. Скрипты проверки не
скачивают зависимости и не запускают `curl | sh`. Сервер слушает только loopback.
TypeScript здесь отдельный закреплённый build-tool, runtime npm-зависимостей нет.

| Команда | Назначение |
|---|---|
| `make build` | Строгая TS-сборка, токены → CSS variables, автономный `dist/index.html` |
| `make serve` | FastAPI на `127.0.0.1:8000` |
| `make lint` | Ruff check/format и проектные ограничения |
| `make test` | Unit/integration основы, без браузера |
| `make browser` | Каталог через настоящую URL-навигацию |
| `make check` | Lint + build + unit/integration + browser, без пропуска этапов |

При уже установленном Chromium можно явно задать `CHROMIUM_EXECUTABLE=/usr/bin/chromium`.
Не подменять браузер Python-клиентом. Системный Chromium и bundled Chromium фиксируются
отдельно в отчёте; совпадение версий не предполагается.

## Ограниченное окружение

```sh
BROWSER_BOOTSTRAP=embedded CHROMIUM_EXECUTABLE=/usr/bin/chromium make browser
```

Этот профиль получает HTML реальным HTTP-запросом и загружает именно полученный HTML
через `page.set_content`. Он не проверяет URL-навигацию, origin/cookies, CSP и production
доставку ресурсов. По умолчанию и в GitHub Actions используется `url`; автоматического fallback нет.
Для будущей игры транспорт остаётся настоящим WebSocket. Никакие browser policies не меняются.

Артефакты браузерного прогона записываются в `artifacts/`, не коммитятся.
`dist/` пересобирается. Не публикуйте корень репозитория универсальным HTTP file server:
могут стать доступны служебные файлы. Приложение отдаёт только собранный HTML.
