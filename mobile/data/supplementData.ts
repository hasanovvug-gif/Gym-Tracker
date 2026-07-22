import { Supplement, SupplementLog } from '@/types/supplement';

export const INITIAL_SUPPLEMENTS: Supplement[] = [
  { id: 'd3', name: 'Витамин D3', nameKey: 'seed.supplementVitaminD3', dose: '2000 МЕ', doseKey: 'seed.doseVitaminD3', stock: 58, capacity: 90, stockUnit: 'капс', stockUnitKey: 'seed.stockUnitCapsules', unitsPerDose: 1, schedule: ['morning'] },
  { id: 'omega', name: 'Омега-3', nameKey: 'seed.supplementOmega3', dose: '2 капс', doseKey: 'seed.doseOmega3', stock: 9, capacity: 90, stockUnit: 'капс', stockUnitKey: 'seed.stockUnitCapsules', unitsPerDose: 2, schedule: ['morning'] },
  { id: 'creatine', name: 'Креатин', nameKey: 'seed.supplementCreatine', dose: '5 г', doseKey: 'seed.doseCreatine', stock: 4, capacity: 60, stockUnit: 'порции', stockUnitKey: 'seed.stockUnitServings', unitsPerDose: 1, schedule: ['pre_workout'] },
  { id: 'caffeine', name: 'Кофеин', nameKey: 'seed.supplementCaffeine', dose: '200 мг', doseKey: 'seed.doseCaffeine', stock: 45, capacity: 80, stockUnit: 'табл', stockUnitKey: 'seed.stockUnitTablets', unitsPerDose: 1, schedule: ['pre_workout'] },
  { id: 'magnesium', name: 'Магний', nameKey: 'seed.supplementMagnesium', dose: '400 мг', doseKey: 'seed.doseMagnesium', stock: 34, capacity: 90, stockUnit: 'капс', stockUnitKey: 'seed.stockUnitCapsules', unitsPerDose: 1, schedule: ['evening'] },
  { id: 'zinc', name: 'Цинк', nameKey: 'seed.supplementZinc', dose: '25 мг', doseKey: 'seed.doseZinc', stock: 80, capacity: 90, stockUnit: 'табл', stockUnitKey: 'seed.stockUnitTablets', unitsPerDose: 1, schedule: ['evening'] },
];

export function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createInitialSupplementLogs(): SupplementLog[] {
  const logs: SupplementLog[] = [];
  for (let offset = 14; offset >= 1; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const taken: Record<string, boolean> = {};
    INITIAL_SUPPLEMENTS.forEach((supplement) => {
      supplement.schedule.forEach((slot) => {
        taken[`${supplement.id}:${slot}`] = true;
      });
    });
    logs.push({ date: dateKey(date), taken });
  }
  logs.push({
    date: dateKey(),
    taken: { 'd3:morning': true, 'omega:morning': true, 'creatine:pre_workout': true },
  });
  return logs;
}
