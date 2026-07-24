import { NativeModule, requireOptionalNativeModule } from 'expo';

type ICloudKVEvents = {
  onExternalChange(event: { key: string }): void;
};

declare class GymbarICloudKVNativeModule extends NativeModule<ICloudKVEvents> {
  isAvailable(): boolean;
  getString(key: string): string | null;
  setString(key: string, value: string): void;
  synchronize(): boolean;
}

export const GymbarICloudKV =
  requireOptionalNativeModule<GymbarICloudKVNativeModule>('GymbarICloudKV');
