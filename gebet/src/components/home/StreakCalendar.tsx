import React from 'react';
import { View, StyleSheet } from 'react-native';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import AppText from '../common/AppText';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/layout';
import { wochentageFuerAktuelleWoche } from '../../services/streakService';

const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

interface Props {
  aktiveTage: string[];
}

export default function StreakCalendar({ aktiveTage: aktiveTage }: Props) {
  const aktivSet = new Set(aktiveTage);
  const woche = wochentageFuerAktuelleWoche();
  const heute = format(new Date(), 'yyyy-MM-dd');

  return (
    <View style={styles.container}>
      {woche.map((tag, i) => {
        const istAktiv = aktivSet.has(tag.datum);
        const istHeute = tag.datum === heute;
        const istZukunft = tag.datum > heute;

        return (
          <View key={tag.datum} style={styles.tagContainer}>
            <AppText variant="caption" color={colors.textDisabled} style={styles.label}>
              {WOCHENTAGE[i]}
            </AppText>
            <View
              style={[
                styles.punkt,
                istAktiv && styles.punktAktiv,
                istHeute && !istAktiv && styles.punktHeute,
                istZukunft && styles.punktZukunft,
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tagContainer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: 10,
  },
  punkt: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.bgSubtle,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  punktAktiv: {
    backgroundColor: colors.terrakotta,
    borderColor: colors.terrakotta,
  },
  punktHeute: {
    borderColor: colors.terrakotta,
    borderWidth: 2,
  },
  punktZukunft: {
    opacity: 0.3,
  },
});
