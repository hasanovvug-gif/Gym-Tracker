export type Palette = {
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceInset: string;
  border: string;
  borderDashed: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDim: string;
  accent: string;
  accentText: string;
  accentInk: string;
  warning: string;
  warningBg: string;
  danger: string;
  divider: string;
  trackBg: string;
  accentSurface: string;
  accentSurfaceStrong: string;
  pauseBackground: string;
  pauseSurface: string;
  inputBackground: string;
  backdrop: string;
  onAccentMuted: string;
};

export const darkColors: Palette = {
  background: '#0B0C0E',
  backgroundAlt: '#08090A',
  surface: '#141619',
  surfaceInset: '#0F1113',
  border: '#23262B',
  borderDashed: '#34383E',
  textPrimary: '#ECEEF0',
  textSecondary: '#8A9096',
  textMuted: '#6A7076',
  textDim: '#5A6066',
  accent: '#C8F031',
  accentText: '#0B0C0E',
  accentInk: '#C8F031',
  warning: '#F0A02E',
  warningBg: '#1A1208',
  danger: '#F05A5A',
  divider: '#1C1F24',
  trackBg: '#1C1F24',
  accentSurface: '#151A0E',
  accentSurfaceStrong: '#37401A',
  pauseBackground: '#101008',
  pauseSurface: '#16140D',
  inputBackground: '#16191D',
  backdrop: 'rgba(0,0,0,0.68)',
  onAccentMuted: 'rgba(11,12,14,0.7)',
};

export const lightColors: Palette = {
  background: '#F4F5F3',
  backgroundAlt: '#EBEDE8',
  surface: '#FFFFFF',
  surfaceInset: '#F0F1EE',
  border: '#DCDFD8',
  borderDashed: '#C3C7BE',
  textPrimary: '#14171A',
  textSecondary: '#5A6068',
  textMuted: '#7A8088',
  textDim: '#9AA0A6',
  accent: '#C8F031',
  accentText: '#0B0C0E',
  accentInk: '#4C6B00',
  warning: '#B26A00',
  warningBg: '#FFF3DE',
  danger: '#C93B3B',
  divider: '#E3E6E0',
  trackBg: '#E3E6E0',
  accentSurface: '#F2FADB',
  accentSurfaceStrong: '#DDEFA0',
  pauseBackground: '#FDF8EE',
  pauseSurface: '#FBF4E4',
  inputBackground: '#F7F8F5',
  backdrop: 'rgba(20,23,26,0.45)',
  onAccentMuted: 'rgba(11,12,14,0.7)',
};

export const palettes = {
  dark: darkColors,
  light: lightColors,
} as const;

export const fonts = {
  heading: 'Oswald_700Bold',
  headingSemiBold: 'Oswald_600SemiBold',
  headingMedium: 'Oswald_500Medium',
  body: 'Archivo_400Regular',
  bodyMedium: 'Archivo_500Medium',
  bodySemiBold: 'Archivo_600SemiBold',
  bodyBold: 'Archivo_700Bold',
  bodyExtraBold: 'Archivo_800ExtraBold',
} as const;
