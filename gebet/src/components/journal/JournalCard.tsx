import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import AppText from '../common/AppText';
import { JournalEintrag, Stimmung } from '../../types/prayer';
import { colors } from '../../constants/colors';
import { spacing, radius, shadow } from '../../constants/layout';
import { getKategorieInfo } from '../../constants/categories';
import { useKategorienStore } from '../../store/useKategorienStore';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const STIMMUNG_EMOJI: Record<Stimmung, string> = {
  frieden: '☮️',
  dankbar: '🙏',
  suchend: '🔍',
  traurig: '😔',
  hoffnungsvoll: '✨',
};

interface Props {
  eintrag: JournalEintrag;
  anliegenTitel?: string;
  anliegenKategorie?: string;
  onPress: () => void;
}

export default function JournalCard({ eintrag, anliegenTitel, anliegenKategorie, onPress }: Props) {
  const customKategorien = useKategorienStore((s) => s.kategorien);
  const datum = format(parseISO(eintrag.datum), 'd. MMM', { locale: de });
  const isLinked = !!anliegenTitel;
  const moodEmoji = eintrag.stimmung ? STIMMUNG_EMOJI[eintrag.stimmung as Stimmung] : null;

  const categoryInfo = anliegenKategorie
    ? getKategorieInfo(anliegenKategorie, customKategorien)
    : null;
  const accentColor = categoryInfo?.farbe ?? colors.terrakotta;

  if (isLinked) {
    return (
      <TouchableOpacity
        style={[styles.card, { borderLeftWidth: 3.5, borderLeftColor: accentColor }]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <View style={styles.topRow}>
          <View style={[styles.katBadge, { backgroundColor: accentColor + '25' }]}>
            <AppText variant="caption" style={{ color: accentColor }}>
              {categoryInfo?.label ?? anliegenKategorie}
            </AppText>
          </View>
          <View style={styles.metaRight}>
            {moodEmoji && <AppText style={styles.emoji}>{moodEmoji}</AppText>}
            <AppText variant="caption" color={colors.textDisabled}>{datum}</AppText>
          </View>
        </View>
        <AppText variant="heading3" numberOfLines={1} style={styles.anliegenTitel}>
          {anliegenTitel}
        </AppText>
        <AppText variant="body" color={colors.textSecondary} numberOfLines={2}>
          {eintrag.inhalt}
        </AppText>
      </TouchableOpacity>
    );
  }

  // Standalone entry
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.topRow}>
        <View style={styles.flex}>
          {eintrag.titel ? (
            <AppText variant="heading3" numberOfLines={1}>{eintrag.titel}</AppText>
          ) : (
            <AppText variant="caption" color={colors.textDisabled}>{datum}</AppText>
          )}
        </View>
        <View style={styles.metaRight}>
          {moodEmoji && <AppText style={styles.emoji}>{moodEmoji}</AppText>}
          {eintrag.titel && (
            <AppText variant="caption" color={colors.textDisabled}>{datum}</AppText>
          )}
        </View>
      </View>
      <AppText
        variant="body"
        color={colors.textSecondary}
        numberOfLines={eintrag.titel ? 2 : 3}
        style={styles.inhaltPreview}
      >
        {eintrag.inhalt}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  flex: {
    flex: 1,
    marginRight: spacing.sm,
  },
  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  katBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  emoji: {
    fontSize: 15,
  },
  anliegenTitel: {
    marginBottom: spacing.xs,
  },
  inhaltPreview: {
    marginTop: spacing.xs,
  },
});
