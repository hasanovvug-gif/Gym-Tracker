import { useCallback } from 'react';
import { useGymStore } from '@/store/useGymStore';
import { ReasonTag } from '@/types/workout';
import { en } from './en';
import { ru } from './ru';
import { ua } from './ua';

export type Dict = typeof ru;
type Section = keyof Dict;
export type TranslationKey = { [S in Section]: `${S}.${Extract<keyof Dict[S], string>}` }[Section];
type Params = Record<string, string | number>;
export type AppLanguage = 'RU' | 'UA' | 'EN';
const dictionaries: Record<AppLanguage, Dict> = { RU: ru as Dict, UA: ua as Dict, EN: en as Dict };

export function translate(language: AppLanguage, key: TranslationKey, params: Params = {}) {
  const [section, item] = key.split('.') as [Section, string];
  const value = dictionaries[language][section][item as keyof Dict[Section]] as string;
  return value.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`));
}

export function useT() {
  const language = useGymStore((state) => state.settings.language);
  const t = useCallback((key: TranslationKey, params?: Params) => translate(language, key, params), [language]);
  return { t, language };
}

const reasonKeys: Record<ReasonTag, TranslationKey> = { 'Устал': 'session.reasonTired', 'Отвлёкся': 'session.reasonDistracted', 'Не хватило времени': 'session.reasonNoTime', 'Дискомфорт': 'session.reasonDiscomfort' };
export const translateReason = (language: AppLanguage, reason?: ReasonTag) => reason ? translate(language, reasonKeys[reason]) : '';
