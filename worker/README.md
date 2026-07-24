# gymbar-ai-proxy

Единственная серверная часть Gymbar. Держит `GEMINI_API_KEY` у себя — в приложении ключа нет.

## Эндпоинты

| Метод | Путь | Что делает |
|-------|------|------------|
| `GET` | `/health` | `{"ok":true}` |
| `POST` | `/supplement-scan` | фото упаковки + заметка → Gemini → структурированная карточка добавки |

Запрос:

```json
{
  "images": [{ "mimeType": "image/jpeg", "data": "<base64>" }],
  "note": "купил у X",
  "language": "RU"
}
```

Заголовок `x-app-token: <APP_TOKEN>` обязателен.

Ответ — `{ schemaVersion, status, card, regimenDraft, warnings, missingFields }`; каждое распознанное поле
это `{ value, source: label|user_note|inferred, confidence }` либо `null`. Коды ошибок:
`unauthorized` (401), `bad_request` (400), `payload_too_large` (413), `rate_limited` (429),
`upstream_error` / `invalid_ai_response` (502), `upstream_timeout` (504).

## Защита

- **Токен `x-app-token`** — не аутентификация (вынимается из IPA), а дешёвый фильтр случайного мусора.
- **Лимиты запроса:** тело ≤ 6 МБ, ≤ 3 картинок, ≤ 1.5 МБ на картинку, заметка ≤ 500 символов,
  mime только jpeg/png/webp, таймаут к Gemini 30 с.
- **Rate limit:** 10 запросов/мин на IP + 40/мин глобально (bindings `RL_IP`, `RL_GLOBAL`).
- **Модель и промпт зафиксированы на сервере** — произвольного проксирования в Gemini нет.
- **Ответ модели не источник истины:** воркер повторно валидирует его по бизнес-правилам
  (длины, диапазоны чисел, единицы измерения, `HH:mm`, `https://`), лишние поля выбрасывает,
  невалидные — обнуляет и перечисляет в `missingFields`. ID генерирует клиент, не модель.
- **Заметка пользователя** передаётся в `<user_note>` как данные, с прямым запретом исполнять инструкции из неё.
- **Логи** — только событие, статус, длительность и число токенов. Ни фото, ни текст промпта не логируются.

## Деплой

```bash
cd worker
npm install
npx wrangler login                       # разовая авторизация Cloudflare
npx wrangler secret put GEMINI_API_KEY   # ключ ОТДЕЛЬНОГО Gemini-проекта
npx wrangler secret put APP_TOKEN        # любая длинная случайная строка
npx wrangler deploy
```

**Spend cap обязателен** (иначе утечка токена = чужие расходы):

1. Google AI Studio → биллинг отдельного проекта под Gymbar → лимит расходов.
2. Cloudflare AI Gateway → создать gateway, выставить spend limit, затем поменять в `wrangler.jsonc`
   `GEMINI_BASE_URL` на `https://gateway.ai.cloudflare.com/v1/<account_id>/<gateway>/google-ai-studio/v1beta`
   и задеплоить заново. Логи и расход тогда видны в дашборде Gateway.

## Локальная разработка

```bash
cp .dev.vars.example .dev.vars   # заполнить GEMINI_API_KEY и APP_TOKEN
npm run dev                      # http://localhost:8787
npm run typecheck
```

Чтобы гонять локально без реального Gemini — добавить в `.dev.vars` строку
`GEMINI_BASE_URL="http://127.0.0.1:8788/v1beta"` и поднять любую заглушку, отвечающую в формате
`generateContent`.
