import React from 'react';
import { ScrollView, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KATEGORIEN } from '../../constants/categories';
import { useKategorienStore } from '../../store/useKategorienStore';
import AppText from '../common/AppText';
import { colors } from '../../constants/colors';
import { radius, spacing } from '../../constants/layout';

type FilterValue = string;

interface Props {
  aktiv: FilterValue;
  onChange: (filter: FilterValue) => void;
  onEditCategories?: () => void;
}

const STATUS_FILTER: { value: FilterValue; label: string }[] = [
  { value: 'offen', label: 'Offen' },
  { value: 'erhoert', label: 'Erhört' },
  { value: 'alle', label: 'Alle' },
];

export default function KategorieFilter({ aktiv, onChange, onEditCategories }: Props) {
  const customKategorien = useKategorienStore((s) => s.kategorien);

  return (
    <View style={styles.row}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {STATUS_FILTER.map((f) => (
          <FilterChip
            key={f.value}
            label={f.label}
            selected={aktiv === f.value}
            onPress={() => onChange(f.value)}
          />
        ))}
        <View style={styles.divider} />
        {KATEGORIEN.map((k) => (
          <FilterChip
            key={k.value}
            label={k.label}
            selected={aktiv === k.value}
            onPress={() => onChange(k.value)}
            color={k.farbe}
          />
        ))}
        {customKategorien.map((k) => (
          <FilterChip
            key={k.id}
            label={k.label}
            selected={aktiv === k.id}
            onPress={() => onChange(k.id)}
            color={k.farbe}
          />
        ))}
      </ScrollView>
      {onEditCategories && (
        <TouchableOpacity style={styles.editBtn} onPress={onEditCategories} activeOpacity={0.7}>
          <Ionicons name="pencil-outline" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
  color,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) {
  const bg = selected ? (color ?? colors.terrakotta) : colors.bgSubtle;
  const textColor = selected ? colors.white : colors.textSecondary;
  return (
    <TouchableOpacity
      style={[styles.chip, { backgroundColor: bg }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <AppText variant="caption" color={textColor}>{label}</AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.full,
    marginRight: spacing.xs,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  editBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    marginRight: spacing.xs,
  },
});
