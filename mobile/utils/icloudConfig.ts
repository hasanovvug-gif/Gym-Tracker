import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { GymbarICloudKV } from '@/modules/gymbar-icloud-kv';
import { useGymStore } from '@/store/useGymStore';
import { parseCloudConfig } from '@/utils/gymDataSchema';

const CLOUD_KEY = 'gymbar.config.v1';
const UPDATED_AT_KEY = 'gymbar.config.updatedAt';
const MAX_BLOB_SIZE = 900 * 1024;

type ICloudStatus = { available: boolean; lastSyncedAt: number | null };

let initialized = false;
let applyingFromCloud = false;
let localUpdatedAt = 0;
let lastSerializedConfig = '';
let writeTimer: ReturnType<typeof setTimeout> | null = null;
let status: ICloudStatus = { available: false, lastSyncedAt: null };
const statusListeners = new Set<() => void>();

function setStatus(next: ICloudStatus) {
  status = next;
  statusListeners.forEach((listener) => listener());
}

function serializeConfig(state = useGymStore.getState()) {
  return JSON.stringify({
    settings: state.settings,
    supplements: state.supplements,
    workoutDays: state.workoutDays,
  });
}

async function saveLocalUpdatedAt(updatedAt: number) {
  localUpdatedAt = updatedAt;
  await AsyncStorage.setItem(UPDATED_AT_KEY, String(updatedAt));
}

async function pushConfig() {
  writeTimer = null;
  if (!GymbarICloudKV || applyingFromCloud) return;
  try {
    const serialized = serializeConfig();
    if (serialized === lastSerializedConfig) return;
    const updatedAt = Date.now();
    const payload = JSON.stringify({ schemaVersion: 1, updatedAt, ...JSON.parse(serialized) });
    if (payload.length > MAX_BLOB_SIZE) return;
    GymbarICloudKV.setString(CLOUD_KEY, payload);
    GymbarICloudKV.synchronize();
    lastSerializedConfig = serialized;
    await saveLocalUpdatedAt(updatedAt);
    setStatus({ available: true, lastSyncedAt: Date.now() });
  } catch {
    // iCloud is optional: a failed write must never affect local data.
  }
}

function schedulePush() {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => { void pushConfig(); }, 3_000);
}

async function pullConfig() {
  if (!GymbarICloudKV) return;
  try {
    GymbarICloudKV.synchronize();
    const raw = GymbarICloudKV.getString(CLOUD_KEY);
    if (!raw) return;
    const blob: unknown = JSON.parse(raw);
    if (!blob || typeof blob !== 'object') return;
    const cloud = blob as { schemaVersion?: unknown; updatedAt?: unknown };
    if (cloud.schemaVersion !== 1 || typeof cloud.updatedAt !== 'number' || !Number.isFinite(cloud.updatedAt)) return;
    const config = parseCloudConfig(blob);
    if (!config || cloud.updatedAt <= localUpdatedAt) return;

    applyingFromCloud = true;
    useGymStore.setState(config);
    applyingFromCloud = false;
    lastSerializedConfig = serializeConfig();
    await saveLocalUpdatedAt(cloud.updatedAt);
    setStatus({ available: true, lastSyncedAt: Date.now() });
  } catch {
    applyingFromCloud = false;
  }
}

export function initializeICloudConfig() {
  if (initialized || !useGymStore.getState().hasHydrated) return;
  initialized = true;
  if (!GymbarICloudKV) return;

  try {
    if (!GymbarICloudKV.isAvailable()) return;
    setStatus({ available: true, lastSyncedAt: null });
    lastSerializedConfig = serializeConfig();
    void AsyncStorage.getItem(UPDATED_AT_KEY)
      .then((value) => { localUpdatedAt = Number(value) || 0; })
      .then(pullConfig)
      .catch(() => undefined);

    useGymStore.subscribe((state) => {
      if (applyingFromCloud || !state.hasHydrated || serializeConfig(state) === lastSerializedConfig) return;
      schedulePush();
    });
    GymbarICloudKV.addListener('onExternalChange', ({ key }) => {
      if (key === CLOUD_KEY) void pullConfig();
    });
    AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') void pullConfig();
    });
  } catch {
    setStatus({ available: false, lastSyncedAt: null });
  }
}

export function useICloudStatus(): ICloudStatus {
  return useSyncExternalStore(
    (listener) => {
      statusListeners.add(listener);
      return () => statusListeners.delete(listener);
    },
    () => status,
    () => status,
  );
}
