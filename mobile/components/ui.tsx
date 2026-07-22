import { ReactNode, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts, Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

function useThemedStyles() {
  const c = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  return { c, styles };
}

export function Screen({ children, scroll = true, contentStyle }: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const { styles } = useThemedStyles();
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : content}
    </SafeAreaView>
  );
}

export function Heading({ children, size = 30, style }: {
  children: ReactNode;
  size?: number;
  style?: StyleProp<TextStyle>;
}) {
  const { styles } = useThemedStyles();
  return <Text style={[styles.heading, { fontSize: size }, style]}>{children}</Text>;
}

export function Card({ children, accent = false, warning = false, style }: {
  children: ReactNode;
  accent?: boolean;
  warning?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { styles } = useThemedStyles();
  return (
    <View style={[
      styles.card,
      accent && styles.cardAccent,
      warning && styles.cardWarning,
      style,
    ]}>
      {children}
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled = false, style }: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { styles } = useThemedStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.primaryButton, disabled && styles.disabled, pressed && styles.pressed, style]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function OutlineButton({ label, onPress, danger = false, style }: {
  label: string;
  onPress: () => void;
  danger?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { c, styles } = useThemedStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.outlineButton, danger && styles.outlineDanger, pressed && styles.pressed, style]}>
      <Text style={[styles.outlineButtonText, danger && { color: c.danger }]}>{label}</Text>
    </Pressable>
  );
}

export function ProgressBar({ progress, color, height = 6 }: {
  progress: number;
  color?: string;
  height?: number;
}) {
  const { c, styles } = useThemedStyles();
  const fillColor = color ?? c.accent;
  return (
    <View style={[styles.progressTrack, { height, borderRadius: height / 2 }]}>
      <View style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%`, height: '100%', backgroundColor: fillColor, borderRadius: height / 2 }} />
    </View>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { styles } = useThemedStyles();
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [styles.segment, selected && styles.segmentSelected, pressed && styles.pressed]}>
            <Text numberOfLines={1} style={[styles.segmentText, selected && styles.segmentTextSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Toggle({ value, onPress, label }: { value: boolean; onPress: () => void; label: string }) {
  const { styles } = useThemedStyles();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={[styles.toggle, value && styles.toggleOn]}>
      <View style={[styles.toggleKnob, value && styles.toggleKnobOn]} />
    </Pressable>
  );
}

const createStyles = (c: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  scrollContent: { flexGrow: 1 },
  content: { width: '100%', maxWidth: 540, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28, gap: 14 },
  heading: { color: c.textPrimary, fontFamily: fonts.heading, textTransform: 'uppercase', letterSpacing: 0.4, lineHeight: 38 },
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18, padding: 16 },
  cardAccent: { borderColor: c.accentInk },
  cardWarning: { borderColor: c.warning, backgroundColor: c.warningBg },
  primaryButton: { minHeight: 52, borderRadius: 16, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  primaryButtonText: { color: c.accentText, fontFamily: fonts.bodyExtraBold, fontSize: 16, textTransform: 'uppercase', letterSpacing: 0.9 },
  outlineButton: { minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: c.borderDashed, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  outlineDanger: { borderColor: c.danger },
  outlineButtonText: { color: c.textSecondary, fontFamily: fonts.bodyBold, fontSize: 13 },
  progressTrack: { width: '100%', backgroundColor: c.trackBg, overflow: 'hidden' },
  segmented: { flexDirection: 'row', gap: 4, backgroundColor: c.surface, padding: 4, borderRadius: 14 },
  segment: { flex: 1, minHeight: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 11, paddingHorizontal: 4 },
  segmentSelected: { backgroundColor: c.accent },
  segmentText: { color: c.textSecondary, fontFamily: fonts.bodySemiBold, fontSize: 11 },
  segmentTextSelected: { color: c.accentText, fontFamily: fonts.bodyExtraBold },
  toggle: { width: 46, height: 28, borderRadius: 14, padding: 2, backgroundColor: c.borderDashed, justifyContent: 'center' },
  toggleOn: { backgroundColor: c.accent },
  toggleKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: c.textSecondary },
  toggleKnobOn: { alignSelf: 'flex-end', backgroundColor: c.background },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.4 },
});
