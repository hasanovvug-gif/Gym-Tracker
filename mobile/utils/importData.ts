import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

import { AppLanguage, translate } from '@/i18n';
import { useGymStore } from '@/store/useGymStore';
import { parseGymData } from '@/utils/gymDataSchema';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const BACKUP_PREFIX = 'gym-tracker-mobile-backup-';
const STORAGE_KEY = 'gym-tracker-mobile-v2';

function showError(language: AppLanguage, key: 'settings.importErrorFormat' | 'settings.importErrorSize' | 'settings.importErrorInvalid' | 'settings.importErrorNotReady' | 'settings.importError', message?: string) {
  Alert.alert(translate(language, 'settings.import'), translate(language, key, message ? { message } : {}));
}

function confirmReplace(language: AppLanguage, message: string): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${translate(language, 'settings.import')}\n\n${message}`));
  return new Promise((resolve) => {
    Alert.alert(translate(language, 'settings.import'), message, [
      { text: translate(language, 'common.cancel'), style: 'cancel', onPress: () => resolve(false) },
      { text: translate(language, 'settings.importReplace'), style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

async function saveBackup() {
  const current = await AsyncStorage.getItem(STORAGE_KEY);
  if (current) await AsyncStorage.setItem(`${BACKUP_PREFIX}${Date.now()}`, current);
  const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith(BACKUP_PREFIX)).sort();
  await Promise.all(keys.slice(0, -3).map((key) => AsyncStorage.removeItem(key)));
}

export async function importGymData(language: AppLanguage): Promise<void> {
  if (!useGymStore.getState().hasHydrated) {
    showError(language, 'settings.importErrorNotReady');
    return;
  }

  try {
    const result = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset || (asset.size !== undefined && asset.size > MAX_FILE_SIZE)) {
      showError(language, 'settings.importErrorSize');
      return;
    }
    const raw = await new File(asset.uri).text();
    if (raw.length > MAX_FILE_SIZE) {
      showError(language, 'settings.importErrorSize');
      return;
    }
    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      showError(language, 'settings.importErrorFormat');
      return;
    }
    if (!payload || typeof payload !== 'object') {
      showError(language, 'settings.importErrorFormat');
      return;
    }
    const envelope = payload as { app?: unknown; version?: unknown; data?: unknown };
    if (envelope.app !== 'gym-tracker') {
      showError(language, 'settings.importErrorFormat');
      return;
    }
    switch (envelope.version) {
      case 1:
        break;
      default:
        showError(language, 'settings.importErrorFormat');
        return;
    }
    const data = parseGymData(envelope.data);
    if (!data) {
      showError(language, 'settings.importErrorInvalid');
      return;
    }
    const preview = translate(language, 'settings.importPreview', {
      workouts: data.history.length,
      supplements: data.supplements.length,
      days: data.workoutDays.length,
    });
    if (!await confirmReplace(language, preview)) return;
    await saveBackup();
    await Notifications.cancelAllScheduledNotificationsAsync();
    useGymStore.setState({ ...data, activeSession: null, recentSessionId: null });
    Alert.alert(translate(language, 'settings.import'), translate(language, 'settings.importSuccess', { workouts: data.history.length }));
  } catch (error) {
    showError(language, 'settings.importError', error instanceof Error ? error.message : String(error));
  }
}
