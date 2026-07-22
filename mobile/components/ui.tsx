import { ReactNode, useEffect, useMemo } from 'react';
import {
  Pressable,
  PressableProps,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  interpolateColor,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts, Palette } from '@/constants/theme';
import { haptics } from '@/hooks/useFeedback';
import { useTheme } from '@/hooks/useTheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Ход костяшки тоггла: ширина 46 − padding 2×2 − костяшка 24. */
const TOGGLE_TRAVEL = 18;

/** Мягкое появление контента экрана. */
function useEnter() {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(1, { duration: 280 });
  }, [progress]);
  return useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 14 }],
  }));
}

/** Кнопка «проседает» под пальцем и отдаёт тактильный отклик. Базис всего интерактива. */
export function Tappable({
  children,
  onPress,
  haptic = 'light',
  scaleTo = 0.96,
  disabled = false,
  style,
  ...rest
}: {
  children: ReactNode;
  onPress: () => void;
  haptic?: keyof typeof haptics | 'none';
  scaleTo?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
} & Omit<PressableProps, 'onPress' | 'style' | 'children' | 'disabled'>) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={() => {
        scale.value = withTiming(scaleTo, { duration: 90 });
        opacity.value = withTiming(0.85, { duration: 90 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 320, mass: 0.5 });
        opacity.value = withTiming(1, { duration: 140 });
      }}
      onPress={() => {
        if (haptic !== 'none') haptics[haptic]();
        onPress();
      }}
      style={[animated, disabled && styles0.disabled, style]}
      {...rest}>
      {children}
    </AnimatedPressable>
  );
}

const styles0 = StyleSheet.create({ disabled: { opacity: 0.4 } });

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
  const enter = useEnter();
  const content = (
    <Animated.View style={[styles.content, enter, contentStyle]}>
      {children}
    </Animated.View>
  );
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
    <Animated.View
      layout={LinearTransition.duration(220)}
      style={[
        styles.card,
        accent && styles.cardAccent,
        warning && styles.cardWarning,
        style,
      ]}>
      {children}
    </Animated.View>
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
    <Tappable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      haptic="tap"
      onPress={onPress}
      style={[styles.primaryButton, style]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Tappable>
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
    <Tappable
      accessibilityRole="button"
      accessibilityLabel={label}
      haptic={danger ? 'warn' : 'light'}
      onPress={onPress}
      style={[styles.outlineButton, danger && styles.outlineDanger, style]}>
      <Text style={[styles.outlineButtonText, danger && { color: c.danger }]}>{label}</Text>
    </Tappable>
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
          <Tappable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            haptic="select"
            scaleTo={0.94}
            onPress={() => onChange(option.value)}
            style={styles.segmentWrap}>
            <View style={[styles.segment, selected && styles.segmentSelected]}>
              <Text numberOfLines={1} style={[styles.segmentText, selected && styles.segmentTextSelected]}>{option.label}</Text>
            </View>
          </Tappable>
        );
      })}
    </View>
  );
}

export function Toggle({ value, onPress, label }: { value: boolean; onPress: () => void; label: string }) {
  const { c, styles } = useThemedStyles();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 200 });
  }, [progress, value]);

  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [c.borderDashed, c.accent]),
  }));
  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * TOGGLE_TRAVEL }],
    backgroundColor: interpolateColor(progress.value, [0, 1], [c.textSecondary, c.background]),
  }));

  return (
    <Tappable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      haptic="select"
      scaleTo={0.92}
      onPress={onPress}>
      <Animated.View style={[styles.toggle, track]}>
        <Animated.View style={[styles.toggleKnob, knob]} />
      </Animated.View>
    </Tappable>
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
  segmentWrap: { flex: 1 },
  segment: { minHeight: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 11, paddingHorizontal: 4 },
  segmentSelected: { backgroundColor: c.accent },
  segmentText: { color: c.textSecondary, fontFamily: fonts.bodySemiBold, fontSize: 11 },
  segmentTextSelected: { color: c.accentText, fontFamily: fonts.bodyExtraBold },
  toggle: { width: 46, height: 28, borderRadius: 14, padding: 2, justifyContent: 'center' },
  toggleKnob: { width: 24, height: 24, borderRadius: 12 },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.4 },
});
