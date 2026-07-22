import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { translateReason, useT } from '@/i18n';
import { REASON_TAGS, ReasonTag } from '@/types/workout';
import { PrimaryButton } from './ui';

export function ReasonPickerModal({ visible, title, selected, onSelect, onConfirm, onClose }: {
  visible: boolean;
  title: string;
  selected?: ReasonTag;
  onSelect: (reason?: ReasonTag) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const c = useTheme();
  const styles = useMemo(() => createStyles(c), [c]);
  const { t, language } = useT();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('common.cancel')} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{t('common.reasonOptional')}</Text>
        <View style={styles.tags}>
          {REASON_TAGS.map((reason) => {
            const active = selected === reason;
            return (
              <Pressable
                key={reason}
                onPress={() => onSelect(active ? undefined : reason)}
                style={[styles.tag, active && styles.tagActive]}>
                <Text style={[styles.tagText, active && styles.tagTextActive]}>{translateReason(language, reason)}</Text>
              </Pressable>
            );
          })}
        </View>
        <PrimaryButton label={t('common.done')} onPress={onConfirm} />
        <Pressable onPress={onClose} style={styles.cancel}><Text style={styles.cancelText}>{t('common.cancel')}</Text></Pressable>
      </View>
    </Modal>
  );
}

const createStyles = (c: Palette) => StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: c.backdrop },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: c.surface, borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, borderColor: c.border, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30, gap: 14 },
  handle: { width: 42, height: 4, borderRadius: 2, backgroundColor: c.borderDashed, alignSelf: 'center', marginBottom: 6 },
  title: { color: c.textPrimary, fontFamily: fonts.heading, fontSize: 26, textTransform: 'uppercase', textAlign: 'center' },
  subtitle: { color: c.textMuted, fontFamily: fonts.bodyMedium, fontSize: 12, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  tag: { minHeight: 42, borderWidth: 1, borderColor: c.borderDashed, borderRadius: 21, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  tagActive: { backgroundColor: c.warning, borderColor: c.warning },
  tagText: { color: c.textSecondary, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  tagTextActive: { color: c.accentText, fontFamily: fonts.bodyBold },
  cancel: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: c.textSecondary, fontFamily: fonts.bodySemiBold, fontSize: 14 },
});
