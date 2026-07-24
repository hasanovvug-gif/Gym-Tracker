import { ua } from './ua';

Object.assign(ua.settings, {
  import: 'Імпорт',
  importPreview: 'Тренувань: {workouts} · Добавок: {supplements} · Днів плану: {days}\n\nПоточні дані буде замінено. Перед цим створимо резервну копію.',
  importReplace: 'Замінити',
  importSuccess: 'Імпортовано: {workouts} тренувань.',
  importErrorFormat: 'Це не файл Gym Tracker або його версія не підтримується.',
  importErrorSize: 'Файл занадто великий.',
  importErrorInvalid: 'У файлі є некоректні дані.',
  importErrorNotReady: 'Дані ще завантажуються. Спробуйте трохи пізніше.',
  importError: 'Не вдалося імпортувати дані: {message}',
});
