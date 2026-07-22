---
campaign: gym-tracker-mobile
status: active
started: 2026-07-22
updated: 2026-07-22 20:10
---

# Gym Tracker → Expo/React Native

## Где сейчас

Приложение полностью реализовано на Expo/RN (SDK 54): все экраны из дизайна, полный флоу
тренировки, добавки, история, настройки. Проверено визуально в симуляторе iPhone 17 Pro
и в браузере. **Всё влито в `main` и запушено** (`694d48b`) — работа идёт прямо в `main`.
Старый Vite-прототип в `src/` оставлен как есть — только референс.

## Next step

Всё закоммичено в `main` (`d3a4d5b`), **не запушено** — при желании `git push`.

Дальше по приоритету:
1. Заменить шрифт **Archivo** — в нём нет кириллицы, весь RU/UA текст рендерится
   системным fallback'ом. Кандидаты: Manrope, IBM Plex Sans. Заголовки (Oswald) — ок.
2. Прогнать флоу на реальном айфоне через Expo Go (`cd mobile && npx expo start`,
   в Expo Go открыть `exp://<LAN-IP>:8081`). Для симулятора нужен пароль Вугара:
   `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`.
3. Нативный share-sheet экспорта живьём не проверялся — только веб-скачивание.

## Done (recent first, max 10)

- 2026-07-22 — Онбординг: 4 экрана про неочевидное, свайп + кнопки, повтор из настроек.
  Codex Sol; пейджер переписан мной на Animated+PanResponder (индикатор опережал контент)
- 2026-07-22 — Сид-данные переводятся (`nameKey` + сброс ключа при ручной правке),
  бэкфилл ключей для уже сохранённого состояния, фикс переноса таб-бара на UA. Codex Sol

- 2026-07-22 — Переводы UA/EN: словари `i18n/{ru,ua,en}.ts`, `useT()` без библиотек,
  локали в `format.ts`, плюрализация по языку. Codex Terra в два захода, добито мной
- 2026-07-22 — Экспорт данных: JSON-конверт → `expo-file-system` 19 + `expo-sharing` →
  системный share-sheet, на вебе — скачивание. Codex Luna
- 2026-07-22 — Светлая тема: 25 токенов, `useTheme()` из стора, ноль хардкод-цветов. Codex Sol
- 2026-07-22 — `feat/mobile-expo-app` влита в `main` и запушена (`694d48b`, merge --no-ff)
- 2026-07-22 — Апгрейд Expo SDK 53 → 54, нативная сборка iOS проходит (`276d696`)
- 2026-07-22 — Полная реализация всех экранов и логики, сделана Codex Sol, верифицирована (`df76b0b`)
- 2026-07-22 — Скаффолд Expo + дизайн-система (цвета, Oswald/Archivo) + 5-табная навигация
- 2026-07-22 — Заведён `docs/state/`, кампания перенесена из чата в файл

## TODO (priority)

- [ ] Шрифт Archivo без кириллицы — RU/UA текст падает на системный fallback, нужна замена
- [ ] Запушить `d3a4d5b` в origin
- [ ] Прогнать полный флоу тренировки на реальном айфоне (Expo Go)
- [ ] Нативный share-sheet экспорта не проверен вживую — только веб-скачивание
- [ ] Drag-and-drop reorder в редакторе плана — сейчас кнопки ↑↓
- [ ] Иконка приложения и splash-графика под публикацию (сейчас дефолтные ассеты Expo)
- [ ] Публикация в App Store

## Decisions (non-obvious, durable)

- 2026-07-22: светлая палитра — `accent` (#C8F031) остаётся только **заливкой**, а как текст,
  граница и SVG-stroke идёт отдельный токен `accentInk` (#4C6B00 на светлой). Кислотный лайм
  на белом нечитаем — без этого разделения светлая тема разваливается.
- 2026-07-22: Ф5 (Fable 5) выпал из Pro-подписки, доступен только за деньги и держится
  в резерве. Дизайн-задачи теперь: палитру/токены задаю я, механику катит Codex Sol.
- 2026-07-22: имя в профиле — ключ `settings.name` (Вугар / Вугар / Vugar), аватар берёт
  первую букву. Не хардкод: критерий «ноль кириллицы в коде» иначе ломает русский UI.

- 2026-07-22: SDK 54 — не косметика, а обязательное условие. На SDK 53 (RN 0.79) нативная
  сборка падает на Xcode 26.6: старый `fmt` не компилируется новым Clang
  (`consteval ... is not a constant expression`). Откат на 53 = снова несобираемо.
- 2026-07-22: `mobile/ios/` и `mobile/android/` в `.gitignore` — генерируются `expo prebuild`.
  Один только `ios/Pods` весит 938 МБ, в репозиторий такое не кладём.
- 2026-07-22: skip vs end-early — два разных действия (фикс бага старого веба, где skip
  обнулял объём даже при частично сделанных подходах). `skipped` → объём 0;
  `ended_early` → сделанные подходы засчитываются в `totalVolume`.
- 2026-07-22: дни плана — упорядоченный список с полем `order`, привязки к дню недели нет.
  Осознанная замена старой модели `dayOfWeek` (редактор плана свободно двигает дни).
- 2026-07-22: персист — ручная гидрация из AsyncStorage + `subscribe` с guard'ом,
  а не `zustand/persist` middleware. Так обошли ошибку `import.meta` в Expo Web.
- 2026-07-22: Expo Go на iOS ставится только последней версии, откатить под старый SDK
  нельзя. Поэтому версия SDK проекта обязана совпадать с версией Expo Go на телефоне.
- 2026-07-22: AI-фичи (Gemini-советы, weekly-отчёт, чат) намеренно НЕ переносим —
  это была демо-фича AI Studio прототипа, в новом дизайне их нет.

## Links (single source for everything)

- **Дизайн (источник истины):** `design/claude-design-export/project/Gym Tracker.dc.html`
- **Инструкция handoff-бандла:** `design/claude-design-export/README.md`
- **Инструкции агентам:** `AGENTS.md` (корень), `mobile/AGENTS.md` (пин на докИ Expo v54)
- **Репозиторий:** https://github.com/hasanovvug-gif/Gym-Tracker
- **Knowledge:** `~/Documents/Projects/mission-control/knowledge/projects/gym-tracker.md`
- **Исходная задача по дизайну:** `~/Documents/Projects/mission-control/tasks/personal/gymtracker-design.md`

## Working state

- Branch: `main`, рабочее дерево чистое, локально на 1 коммит впереди origin
- Worktree: `~/Documents/Projects/Gym-Tracker`
- Last meaningful commit: `d3a4d5b` — светлая тема, i18n, экспорт, онбординг (не запушен)
- Приложение: `mobile/`, bundle id `com.vugarhasanov.gymtracker`
- Запуск: `cd mobile && npx expo start` · симулятор — `npx expo run:ios`
