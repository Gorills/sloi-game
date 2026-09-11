# Основания инженерных и дизайн-решений

Status: reference

Проверено по открытым первичным источникам 2026-09-11. Это desk research по документации
и описаниям разработчиков, не собственный плейтест коммерческих игр и не рейтинг рынка.
2027 — срок целевого развития; будущие вкусы игроков не выдаются за установленный факт.
Проектные пороги, раскладка управления и палитра — наши гипотезы, не требования источников.

## Референс → вывод → ограничение → проверка

| Референс | Что подтверждает источник | Что предлагаем для «Слоёв» | Чего не копируем / проверка |
|---|---|---|---|
| Core Keeper [G1] | Исследование биомов, сбор, развитие базы и кооперативные занятия | Чередовать опасную экспедицию и содержательную подготовку дома | Не весь survival-каталог. Плейтест: есть ли разные полезные задачи для участников |
| Albion Online [G2] | Игроко-ориентированная экономика, создание предметов и classless equipment | Сделать добычу/снабжение причиной путешествий, а снаряжение — частью подготовки | Не переносить автоматически PvP и потери. Проверить, не заменяет ли торговля все остальные решения |
| Guild Wars 2 [G3] | Совместные события и индивидуальное вознаграждение без борьбы за loot | Присоединение помощника не ухудшает награду; общий итог виден в поселении | Не MMO-масштаб. Уникальный груз имеет одного владельца, награда участия — отдельное правило |
| Riot / League [G4] | Иерархия сигналов, силуэты, соответствие эффектов hitbox, минимум шума | Угроза важнее декора; эффект объясняет область/направление действия | Не копировать MOBA HUD. Проверять сцену со всеми эффектами и разными фонами |

Таким образом, ориентир качества — связный цикл, полезная кооперация, читаемая опасность,
управление без борьбы с интерфейсом и предсказуемое восстановление после сетевого сбоя.
«Современность» не обосновывает ни лишние bloom-эффекты, ни обязательные ежедневные задания.

## Инженерная база

[S1] [OpenAI: AGENTS.md](https://developers.openai.com/codex/guides/agents-md).
Иерархия инструкций и ограничения размера контекста: короткий корневой договор,
дальше точечные ссылки. Файл инструкций не является механизмом контроля Git.

[S2] [OpenAI: Skills](https://developers.openai.com/codex/skills) и
[Agent Skills specification](https://agentskills.io/specification).
Чёткие триггеры, `name`/`description`, progressive disclosure. Навыки ниже написаны для
этого репозитория по документации, не скопированы из непроверенной коллекции.

[S3] [GitHub: repository instructions](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions)
и [Claude: memory/imports](https://code.claude.com/docs/en/memory).
Адаптеры указывают на одну политику. Наличие адаптера не доказывает чтение любым агентом.

[S4] [Playwright: best practices](https://playwright.dev/docs/best-practices),
[Python browser contexts](https://playwright.dev/python/docs/browser-contexts),
[set_content](https://playwright.dev/python/docs/api/class-page#page-set-content).
Изоляция, наблюдаемое поведение, ожидание состояния, traces. Embedded-профиль —
локальная адаптация среды, не рекомендация заменять URL-проверки.

[S5] [TypeScript strict](https://www.typescriptlang.org/tsconfig/strict.html),
[Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API).
Строгие типы не валидируют входящий JSON; небольшой AST-check добавляет локальные пороги.

[S6] [MDN: Canvas optimization](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
и [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame).
Разделять отрисовку/состояние, учитывать DPR и измерять до добавления кэшей/слоёв.

[S7] [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/),
[lifespan](https://fastapi.tiangolo.com/advanced/events/),
[Python sqlite3](https://docs.python.org/3.13/library/sqlite3.html),
[SQLite transactions](https://www.sqlite.org/transactional.html).
Один владелец состояния, явный lifecycle и транзакции. Пример ConnectionManager в
учебнике не является готовой многопроцессной архитектурой постоянного мира.

[S8] [OWASP WebSocket Security](https://cheatsheetseries.owasp.org/cheatsheets/WebSocket_Security_Cheat_Sheet.html).
WSS при публикации, проверка Origin, авторизация каждой команды, лимиты, безопасные логи.
Самодельный token в прототипе не объявляется production-аутентификацией.

[S9] [GitHub rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets).
Required checks и PR защищают ветку только после активации ruleset.
CODEOWNERS сам по себе не требует approval и не запрещает прямой push.

[S10] [Diátaxis](https://diataxis.fr/).
Разделены запуск/how-to, справочники контрактов, объяснения решений и будущие walkthrough.
Не строим отдельный documentation portal до потребности.

[S11] [Ruff configuration](https://docs.astral.sh/ruff/configuration/),
[complexity C901](https://docs.astral.sh/ruff/rules/complex-structure/).
Автоматический lint/format и локально выбранный порог сложности. Числа не гарантируют хороший дизайн.

## Дизайн и доступность: первичные источники

[G1] [Pugstorm: Core Keeper](https://store.steampowered.com/app/1621690/Core_Keeper/).
Использовано описание игры от разработчика/издателя, не отзывы/цены/рейтинг.

[G2] [Sandbox Interactive: Albion Online](https://store.steampowered.com/app/761890/Albion_Online/).
Использовано описание экономики и системы экипировки, не оценка пригодности для нашей аудитории.

[G3] [ArenaNet: Dynamic Events](https://www.guildwars2.com/en/the-game/dynamic-events/).

[G4] [Riot: Clarity in League, 2021-03-12](https://www.leagueoflegends.com/en-us/news/dev/clarity-in-league/).
Это фундаментальный принцип, не новость 2026 года.

[G5] [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/),
[Xbox XAG 101: text](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/101),
[Xbox XAG 107: input](https://learn.microsoft.com/en-us/xbox/accessibility/xbox-accessibility-guidelines/107).
WCAG — web-критерии; XAG — игровое руководство. Не смешивать размеры CSS px и console px.

## Обновление

Перед изменением зависимости — её версия, changelog и официальная документация.
Перед фиксацией арт-стиля — реальные сцены и просмотренные кадры, затем плейтест.
Добавлять источник с конкретным поддерживаемым выводом, не список ссылок «для солидности».
