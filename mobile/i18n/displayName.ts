import { type TranslationKey } from '@/i18n';

type Translate = (key: TranslationKey) => string;

const resolve = (fallback: string, key: string | undefined, t: Translate) =>
  key ? t(key as TranslationKey) : fallback;

export const resolveName = (item: { name: string; nameKey?: string }, t: Translate) =>
  resolve(item.name, item.nameKey, t);

export const resolveMuscleGroup = (item: { muscleGroup: string; muscleGroupKey?: string }, t: Translate) =>
  resolve(item.muscleGroup, item.muscleGroupKey, t);

export const resolveDose = (item: { dose: string; doseKey?: string }, t: Translate) =>
  resolve(item.dose, item.doseKey, t);

export const resolveStockUnit = (item: { stockUnit: string; stockUnitKey?: string }, t: Translate) =>
  resolve(item.stockUnit, item.stockUnitKey, t);

export const resolveExerciseName = (item: { exerciseName: string; exerciseNameKey?: string }, t: Translate) =>
  resolve(item.exerciseName, item.exerciseNameKey, t);

export const resolveDayName = (item: { dayName: string; dayNameKey?: string }, t: Translate) =>
  resolve(item.dayName, item.dayNameKey, t);
