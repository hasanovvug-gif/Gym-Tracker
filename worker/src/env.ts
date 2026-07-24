export type RateLimiter = { limit(options: { key: string }): Promise<{ success: boolean }> };

export interface Env {
  GEMINI_API_KEY: string;
  APP_TOKEN: string;
  GEMINI_MODEL: string;
  GEMINI_BASE_URL: string;
  RL_IP: RateLimiter;
  RL_GLOBAL: RateLimiter;
}

export class HttpError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
  }
}
