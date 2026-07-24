import { Env, HttpError } from './env';
import { ScanRequest, runSupplementScan } from './scan';

const MAX_BODY_BYTES = 6_000_000;
const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 1_500_000;
const MAX_NOTE_CHARS = 500;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const LANGUAGES = new Set(['RU', 'EN', 'UA']);

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const fail = (error: HttpError) => json(error.status, { error: error.code, message: error.message });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === '/health') return json(200, { ok: true });
    if (pathname !== '/supplement-scan') return fail(new HttpError(404, 'not_found', 'Unknown endpoint'));
    if (request.method !== 'POST') return fail(new HttpError(405, 'method_not_allowed', 'POST only'));

    try {
      // Статический токен — не аутентификация, а дешёвый фильтр случайного мусора.
      if (!env.APP_TOKEN || request.headers.get('x-app-token') !== env.APP_TOKEN) {
        throw new HttpError(401, 'unauthorized', 'Bad or missing app token');
      }

      const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
      const [perIp, global] = await Promise.all([env.RL_IP.limit({ key: ip }), env.RL_GLOBAL.limit({ key: 'all' })]);
      if (!perIp.success || !global.success) {
        console.log(JSON.stringify({ event: 'rate_limited', scope: perIp.success ? 'global' : 'ip' }));
        throw new HttpError(429, 'rate_limited', 'Too many requests, try later');
      }

      const declared = Number(request.headers.get('content-length') ?? '0');
      if (declared > MAX_BODY_BYTES) throw new HttpError(413, 'payload_too_large', 'Request body too large');

      const raw = await request.text();
      if (raw.length > MAX_BODY_BYTES) throw new HttpError(413, 'payload_too_large', 'Request body too large');

      const started = Date.now();
      const result = await runSupplementScan(parseScanRequest(raw), env);
      console.log(JSON.stringify({ event: 'scan', status: result.status, ms: Date.now() - started }));
      return json(200, result);
    } catch (error) {
      if (error instanceof HttpError) return fail(error);
      console.log(JSON.stringify({ event: 'unhandled', message: String(error) }));
      return fail(new HttpError(500, 'internal_error', 'Unexpected error'));
    }
  },
};

function parseScanRequest(raw: string): ScanRequest {
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'bad_request', 'Body is not valid JSON');
  }
  if (typeof body !== 'object' || body === null) throw new HttpError(400, 'bad_request', 'Body must be an object');
  const { images, note, language } = body as Record<string, unknown>;

  if (!Array.isArray(images) || images.length === 0) throw new HttpError(400, 'bad_request', 'images must be a non-empty array');
  if (images.length > MAX_IMAGES) throw new HttpError(400, 'bad_request', `At most ${MAX_IMAGES} images`);

  const parsedImages = images.map((item) => {
    if (typeof item !== 'object' || item === null) throw new HttpError(400, 'bad_request', 'Each image must be an object');
    const { mimeType, data } = item as Record<string, unknown>;
    if (typeof mimeType !== 'string' || !ALLOWED_MIME.has(mimeType)) {
      throw new HttpError(400, 'bad_request', 'Image mimeType must be image/jpeg, image/png or image/webp');
    }
    if (typeof data !== 'string' || data.length === 0) throw new HttpError(400, 'bad_request', 'Image data must be base64 string');
    if (data.length > MAX_IMAGE_BYTES) throw new HttpError(413, 'payload_too_large', 'Single image too large');
    if (!/^[A-Za-z0-9+/=\s]+$/.test(data)) throw new HttpError(400, 'bad_request', 'Image data must be base64');
    return { mimeType, data };
  });

  if (note !== undefined && typeof note !== 'string') throw new HttpError(400, 'bad_request', 'note must be a string');
  if (typeof note === 'string' && note.length > MAX_NOTE_CHARS) {
    throw new HttpError(400, 'bad_request', `note is longer than ${MAX_NOTE_CHARS} characters`);
  }
  if (language !== undefined && (typeof language !== 'string' || !LANGUAGES.has(language))) {
    throw new HttpError(400, 'bad_request', 'language must be RU, EN or UA');
  }

  return { images: parsedImages, note: (note as string) ?? '', language: (language as 'RU' | 'EN' | 'UA') ?? 'RU' };
}
