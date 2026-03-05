import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppCard from '../common/AppCard';
import AppText from '../common/AppText';
import KategorieChip from './KategorieChip';
import { Anliegen } from '../../types/prayer';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/layout';
import { getKategorieInfo } from '../../constants/categories';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface Props {
  anliegen: Anliegen;
  onPress: () => void;
}

export default function AnliegenCard({ anliegen, onPress }: Props) {
  const info = getKategorieInfo(anliegen.kategorie);
  const datum = format(parseISO(anliegen.erstelltAm), 'd. MMM yyyy', { locale: de });

  return (
    <AppCard onPress={onPress} style={styles.card}>
      <View style={[styles.leftBar, { backgroundColor: info.farbe }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <AppText variant="heading3" style={styles.titel} numberOfLines={2}>
            {anliegen.titel}
          </AppText>
          {anliegen.erhoert && (
            <View style={styles.erhoertBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.salbei} />
              <AppText variant="caption" color={colors.salbei} style={styles.erhoertText}>
                Erhört
              </AppText>
            </View>
          )}
        </View>
        {anliegen.beschreibung ? (
          <AppText variant="body" color={colors.textSecondary} numberOfLines={2} style={styles.beschreibung}>
            {anliegen.beschreibung}
          </AppText>
        ) : null}
        <View style={styles.footer}>
          <KategorieChip kategorie={anliegen.kategorie} size="sm" />
          <AppText variant="caption" color={colors.textDisabled}>{datum}</AppText>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  leftBar: {
    width: 4,
    borderRadius: radius.sm,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  titel: {
    flex: 1,
    marginRight: spacing.sm,
  },
  erhoertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.salbeiLight,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: spacing.sm,
  },
  erhoertText: {
    marginLeft: 2,
  },
  beschreibung: {
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
});
