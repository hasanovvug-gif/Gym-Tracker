import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

import { useGymStore } from '@/store/useGymStore';
import { AppLanguage, translate } from '@/i18n';

export async function exportGymData(language: AppLanguage): Promise<void> {
  try {
    const { workoutDays, history, supplements, supplementLogs, settings } = useGymStore.getState();
    const payload = {
      app: 'gym-tracker',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: { workoutDays, history, supplements, supplementLogs, settings },
    };
    const json = JSON.stringify(payload, null, 2);
    const filename = `gym-tracker-${new Date().toISOString().slice(0, 10)}.json`;

    if (Platform.OS === 'web') {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      return;
    }

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert(translate(language, 'settings.export'), translate(language, 'settings.exportUnavailable'));
      return;
    }

    const file = new File(Paths.cache, filename);
    file.create({ overwrite: true });
    file.write(json);
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    Alert.alert(translate(language, 'settings.export'), translate(language, 'settings.exportError', { message }));
  }
}
