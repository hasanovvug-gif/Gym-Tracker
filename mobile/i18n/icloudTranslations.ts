import { en } from './en';
import { ru } from './ru';
import { ua } from './ua';

Object.assign(ru.settings, {
  icloudSynced: 'iCloud: синхронизировано · {time}',
  icloudUnavailable: 'iCloud: недоступен',
  icloudNever: 'iCloud: ожидает синхронизации',
});

Object.assign(en.settings, {
  icloudSynced: 'iCloud: synced · {time}',
  icloudUnavailable: 'iCloud: unavailable',
  icloudNever: 'iCloud: waiting to sync',
});

Object.assign(ua.settings, {
  icloudSynced: 'iCloud: синхронізовано · {time}',
  icloudUnavailable: 'iCloud: недоступний',
  icloudNever: 'iCloud: очікує синхронізації',
});
