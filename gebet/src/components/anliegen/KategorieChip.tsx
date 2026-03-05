import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getKategorieInfo } from '../../constants/categories';
import { useKategorienStore } from '../../store/useKategorienStore';
import AppText from '../common/AppText';
import { radius, spacing } from '../../constants/layout';
import { colors } from '../../constants/colors';

interface Props {
  kategorie: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
}

export default function KategorieChip({ kategorie, selected, onPress, size = 'md' }: Props) {
  const customKategorien = useKategorienStore((s) => s.kategorien);
  const info = getKategorieInfo(kategorie, customKategorien);
  const bg = selected ? info.farbe : colors.bgSubtle;
  const textColor = selected ? colors.white : colors.textSecondary;

  const chipStyle: ViewStyle[] = [
    styles.chip,
    size === 'sm' ? styles.chipSm : {},
    { backgroundColor: bg },
  ];

  const inner = (
    <>
      <Ionicons name={info.icon as any} size={size === 'sm' ? 10 : 12} color={textColor} style={styles.icon} />
      <AppText variant="caption" color={textColor}>{info.label}</AppText>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={chipStyle} onPress={onPress} activeOpacity={0.75}>
        {inner}
      </TouchableOpacity>
    );
  }
  return <View style={chipStyle}>{inner}</View>;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginRight: spacing.xs,
  },
  chipSm: {
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
  },
  icon: {
    marginRight: 3,
  },
});
