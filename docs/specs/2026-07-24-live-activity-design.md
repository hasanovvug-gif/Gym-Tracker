# Spec: iOS Live Activity для Gymbar (экран блокировки + Dynamic Island + кнопка «Готово» + звук)

**Дата:** 2026-07-24
**Проект:** `~/Documents/Projects/Gym-Tracker/mobile` (Expo SDK 54, React Native 0.81, expo-router, Zustand)
**Исполнитель:** Codex Sol (gpt-5.6-sol, reasoning=high)
**Платформа:** iOS-only (Android — не трогать, фича под флагом `Platform.OS === 'ios'`)

> **ВАЖНО (AGENTS.md проекта):** Expo сильно поменялся. Перед написанием кода сверяйся с точными версионными доками
> https://docs.expo.dev/versions/v54.0.0/ и с README `@bacons/apple-targets` актуальной версии. Не полагайся на память по API.

---

## 1. Проблема (зачем)

Пользователь тренируется с заблокированным телефоном. Сейчас:
1. **Таймер отдыха встаёт** — он на JS `setInterval` (`mobile/hooks/useNow.ts` → `mobile/app/workout-session.tsx:41`).
   iOS замораживает JS-поток через ~30 сек после блокировки, отсчёт останавливается.
2. **Звук конца отдыха не срабатывает** — `playRestDone()` (`mobile/hooks/useFeedback.ts:27`) вызывается только когда
   JS-таймер сам долетает до нуля внутри работающего приложения. При заблокированном экране JS спит → звука нет.

Цель: во время тренировки на экране блокировки видна живая карточка с прогрессом и обратным отсчётом отдыха,
который тикает нативно (без JS); в конце отдыха звучит сигнал даже на беззвучном/заблокированном телефоне;
кнопкой «Готово» с локскрина можно засчитать подход и запустить отдых, не открывая приложение.

## 2. Решение — почему именно так

- Официальный `expo-widgets` требует **Expo SDK 57** — проект на 54, апгрейд сейчас вне scope и рискован. **Не используем.**
- `software-mansion-labs/expo-live-activity` — заархивирован (июнь 2026), **не поддерживает App Intents** (кнопка «Готово»). **Не используем.**
- **Выбор:** свой native widget extension через **`@bacons/apple-targets`** (config plugin, добавляет таргет виджета
  без полного eject) — даёт полный контроль: SwiftUI Live Activity + Dynamic Island + `LiveActivityIntent` (App Intents) +
  тонкий native-мостик к JS. Работает на SDK 54, тестируется в custom dev client.

Обновление Live Activity — **локальное** (приложение обновляет свою активити через ActivityKit из foreground/при возврате).
Обратный отсчёт отдыха рисуется системой (`Text(timerInterval:)`), тикает без работающего JS и без push-сервера.
**Push-сервер не нужен.**

## 3. Архитектура — 4 слоя + звук

### Слой 1. Widget Extension (Swift/SwiftUI) — через `@bacons/apple-targets`
Файлы в новом таргете (напр. `mobile/targets/widget/`):
- **`GymbarActivityAttributes.swift`** — `ActivityAttributes` со static-частью (dayName) и `ContentState`:
  ```
  ContentState {
    exerciseName: String
    setCurrent: Int          // текущий подход (1-based)
    setTotal: Int            // plannedSets
    exerciseCurrent: Int     // индекс упражнения (1-based)
    exerciseTotal: Int
    phase: String            // "active" | "rest"
    restEndsAt: Date?        // null в active-фазе; для Text(timerInterval:)
  }
  ```
- **`GymbarLiveActivity.swift`** — `ActivityConfiguration`:
  - **Lock screen / banner:** название упражнения, «Подход N/M», «Упражнение i/k».
    В `phase == "rest"` — крупный отсчёт `Text(timerInterval: now...restEndsAt, countsDown: true)` + прогресс-бар/кольцо.
    В `phase == "active"` — статичная строка «Идёт подход» без таймера.
  - **Dynamic Island:** compact (иконка + секунды отдыха / «•» в active), expanded (упражнение + отсчёт + кнопка «Готово»),
    minimal (секунды).
  - Дизайн под тёмную тему приложения (`userInterfaceStyle: dark`, фон `#0B0C0E`, акцент — взять из
    `mobile/constants/` палитры; см. существующие цвета `c.accent`, `c.warning`).
- **`CompleteSetIntent.swift`** — `AppIntent` + `LiveActivityIntent`. См. Слой 4.

### Слой 2. Native-мостик (Expo module / Swift) → JS API
Тонкий модуль (свой local Expo module либо Swift-файл в основном таргете + `requireNativeModule`), экспортирует в JS:
```ts
startLiveActivity(state: ContentState): Promise<string /* activityId */>
updateLiveActivity(state: ContentState): Promise<void>
endLiveActivity(): Promise<void>
addCompleteSetListener(cb: () => void): Subscription   // событие тапа «Готово» из App Intent
```
Хранить текущий `Activity<GymbarActivityAttributes>` в Swift; `end` вызывать с `dismissalPolicy: .immediate`.
На не-iOS все функции — no-op (резолвятся сразу), чтобы Android/web не падали.

### Слой 3. App Group (общий контейнер приложение ↔ виджет)
- App Group id: `group.com.gymbar.app` (совпадает с bundle `com.gymbar.app`).
- Entitlement `com.apple.security.application-groups` на **обоих** таргетах (main + widget).
- В App Group хранить **очередь событий кнопки** (напр. массив timestamp'ов «complete-set» в shared `UserDefaults`):
  App Intent пишет событие → приложение при возврате в foreground вычитывает и проигрывает (см. Слой 4).

### Слой 4. App Intent «Готово» (интерактивная кнопка)
- `CompleteSetIntent: LiveActivityIntent` — выполняется системой при тапе на кнопку с локскрина, **без запуска RN**.
- В `perform()`:
  1. Прочитать текущий `ContentState` активити.
  2. **Оптимистично** обновить Live Activity: перевести в `phase = "rest"`, `restEndsAt = now + 90s`
     (дефолт отдыха = 90 сек, как в сторе `useGymStore.ts:186`). Если это был последний подход упражнения —
     перейти к след. упражнению в `active` (реплика ветки `completed` в `completeSet`). Логика минимальная: только
     то, что нужно для корректной карточки; полный пересчёт объёма делает RN при возврате.
  3. Записать событие `complete-set` (timestamp) в App Group очередь.
- **Reconciliation на стороне RN:** в `mobile/app/workout-session.tsx` подписаться на `AppState` `active` **и** на
  `addCompleteSetListener`. При возврате в foreground / событии — вычитать очередь из App Group и на каждое событие
  вызвать реальный `actions.completeSet()` (единственный источник правды для объёма/истории), затем `updateLiveActivity`
  привести карточку к состоянию стора (устранить возможный дрейф оптимистичного апдейта).
- Идемпотентность: события помечать consumed (чистить очередь после обработки), чтобы не задвоить подходы.

### Звук конца отдыха (чинит баг №2) — `expo-notifications`
- Установить `expo-notifications` (совместимую с SDK 54 версию — сверить по доке).
- При **старте отдыха** (в момент, когда `phase → 'rest'`, т.е. после `completeSet`, и из App Intent-ветки тоже —
  через reconciliation) планировать **локальное уведомление** с кастомным звуком на `restEndsAt`.
  Звук — существующий `mobile/assets/sounds/rest-done.wav` (добавить как notification sound в бандл).
- Отменять запланированное уведомление при: `endRest`, `addRestTime` (перепланировать на новый `restEndsAt`),
  `pauseWorkout`, `resolveExercise`, `finishWorkout`.
- Уважать настройку `settings.notifications.sound` (`useGymStore.ts:98`) — если выкл, не планировать звук
  (можно планировать тихое уведомление или не планировать вовсе).
- Запросить разрешение на уведомления при первом старте тренировки (или в онбординге) — мягко, без блокировки UX.
- `playRestDone()` из `useFeedback.ts` оставить как есть для foreground-случая (двойного звука избегать: если
  приложение активно в момент конца — уведомление можно не показывать/глушить; выбрать один путь, задокументировать).

## 4. Точки интеграции в существующий код

Машина состояний (`mobile/store/useGymStore.ts`) — **источник правды, не дублировать в Swift сверх минимума**:
- `startWorkout` (`:111`) → после старта: `startLiveActivity(state)` + запрос permission на нотификации.
- `completeSet` (`:157`) → ветка `completed` (перешли к след. упражнению, `phase:'active'`) и ветка отдыха
  (`phase:'rest'`, `restEndsAt = now+90s`, `:186`) → на каждую: `updateLiveActivity(state)`; в rest-ветке — план звука-нотификации.
- `endRest` (`:191`) → `updateLiveActivity(active)` + отмена звука.
- `addRestTime` (`:195`) → `updateLiveActivity` + перепланировать звук на новый `restEndsAt`.
- `pauseWorkout` / `resumeWorkout` → на паузе можно `updateLiveActivity` в нейтральное «Пауза», отменить звук;
  на resume — восстановить. (Минимально: хотя бы отменять/восстанавливать звук.)
- `finishWorkout` (`:282`) → `endLiveActivity()` + отмена звука.
- Экран `mobile/app/workout-session.tsx` — точка подписки на `AppState` + `addCompleteSetListener` (reconciliation).

Рекомендация по чистоте: вынести всю обвязку Live Activity + нотификаций в отдельный модуль
`mobile/hooks/useLiveActivity.ts` (или `mobile/utils/liveActivity.ts`), а стор дёргает его через существующий паттерн,
чтобы не размазывать side-effects по стору. Держать файлы сфокусированными.

## 5. Конфигурация (`mobile/app.json`)

- `ios.infoPlist.NSSupportsLiveActivities = true`.
- App Groups entitlement на main app: `com.apple.security.application-groups = ["group.com.gymbar.app"]`.
- Подключить config plugin `@bacons/apple-targets` (или его механизм) для widget-таргета; таргету — свой
  entitlement с той же App Group + `NSSupportsLiveActivities`.
- Плагин `expo-notifications` с настройкой звука (`sounds: ["./assets/sounds/rest-done.wav"]`).
- Минимальная iOS-версия ≥ 16.2 (Live Activities). Проверить/поднять `deploymentTarget` при необходимости.
- Codex: сверить точные ключи/формат под Expo 54 — API config-плагинов чувствителен к версии.

## 6. Фазы реализации (каждая с критерием проверки)

**Фаза 1 — карточка только для чтения:**
Widget extension + attributes + мостик start/update/end + интеграция в стор (start/complete/endRest/finish).
Нативный отсчёт отдыха.
*Критерий:* запустил тренировку → на локскрине карточка; ушёл в отдых → отсчёт тикает при заблокированном экране;
завершил тренировку → карточка исчезла.

**Фаза 2 — звук:**
`expo-notifications` + план/отмена локального уведомления со звуком на `restEndsAt`, привязка к настройке `sound`.
*Критерий:* заблокировал телефон на беззвучном режиме во время отдыха → в конце отдыха звучит сигнал.

**Фаза 3 — кнопка «Готово»:**
`CompleteSetIntent` (App Intent) + App Group очередь событий + reconciliation в `workout-session.tsx`.
*Критерий:* закончил подход, телефон заблокирован → тап «Готово» на карточке → пошёл отдых (отсчёт), приложение
не открывалось; при следующем открытии стор консистентен (подход засчитан один раз, объём верный).

## 7. Acceptance criteria (общие)

- [ ] Все три фазы реализованы; фича строго `iOS-only`, Android/web не сломаны (no-op мостик).
- [ ] Источник правды по объёму/истории — `useGymStore.completeSet`; App Intent не дублирует бизнес-логику сверх
      минимума для карточки; reconciliation не задваивает подходы (идемпотентность).
- [ ] Отсчёт отдыха на локскрине нативный (не зависит от JS).
- [ ] Звук в конце отдыха срабатывает на заблокированном/беззвучном телефоне; уважает `settings.notifications.sound`;
      корректно отменяется/перепланируется при endRest/addRestTime/pause/finish.
- [ ] `app.json` собран корректно (entitlements, App Group, NSSupportsLiveActivities, notifications sound).
- [ ] `cd mobile && npx tsc --noEmit` (или `npm run lint`) — чисто. Свежий `npx expo-doctor` без новых ошибок.
- [ ] README/AGENTS: краткая заметка «как собрать dev-build и проверить Live Activity».

## 8. Что Codex НЕ может сам (нужен Вугар / физическое устройство)

- Live Activity **нельзя проверить в Expo Go и толком в симуляторе** — нужен custom dev client на **реальном iPhone**.
- Требуются: пересборка dev-client (`npx expo prebuild` + `expo run:ios` / EAS build), новый provisioning profile с
  App Groups + Push (ActivityKit) capability на аккаунте `vugarapple`. Это Вугар/King делают с Apple-credentials.
- Фича попадёт в **новую сборку App Store (build #3+)**, не в тот build #2, что сейчас на ревью.
- Codex: написать код + компилируемость/типы, оставить в брифе точный чек-лист ручной проверки на устройстве и
  список неопределённостей (что не удалось проверить без железа).

## 9. Формат сдачи (Codex → King)

Codex по завершении пишет краткий отчёт: что сделано по фазам, какие файлы созданы/изменены, результат `tsc`/`expo-doctor`,
список ручных шагов для Вугара (build/capabilities/device-тест) и явный список неопределённостей/допущений (особенно по
точным API Expo 54 / apple-targets / App Intents reconciliation). Тесты, где применимо. Self-review перед сдачей.
