export function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

export type FormatLanguage = 'RU' | 'UA' | 'EN';

const locales: Record<FormatLanguage, string> = { RU: 'ru-RU', UA: 'uk-UA', EN: 'en-GB' };

export function formatNumber(value: number, language: FormatLanguage = 'RU') {
  return new Intl.NumberFormat(locales[language], { maximumFractionDigits: 0 }).format(value);
}

export function formatShortDate(iso: string, language: FormatLanguage = 'RU') {
  return new Intl.DateTimeFormat(locales[language], { weekday: 'short', day: 'numeric', month: 'long' })
    .format(new Date(iso))
    .replace('.', '');
}

export function formatToday(language: FormatLanguage = 'RU') {
  const text = new Intl.DateTimeFormat(locales[language], { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function pluralize(value: number, forms: [string, string, string] | [string, string], language: FormatLanguage) {
  if (language === 'EN') return forms[value === 1 ? 0 : 1];
  const slavicForms = forms as [string, string, string];
  const lastTwo = value % 100;
  const last = value % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return slavicForms[2];
  if (last === 1) return slavicForms[0];
  if (last >= 2 && last <= 4) return slavicForms[1];
  return slavicForms[2];
}
