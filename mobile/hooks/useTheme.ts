import { palettes, Palette } from '@/constants/theme';
import { useGymStore } from '@/store/useGymStore';

export function useTheme(): Palette {
  const theme = useGymStore((state) => state.settings.theme);
  return palettes[theme];
}
