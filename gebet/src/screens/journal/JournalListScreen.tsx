import React, { useState } from 'react';
import {
  View,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { JournalStackParamList } from '../../types/navigation';
import { useJournalStore } from '../../store/useJournalStore';
import { useAnliegenStore } from '../../store/useAnliegenStore';
import JournalCard from '../../components/journal/JournalCard';
import EmptyState from '../../components/common/EmptyState';
import AppText from '../../components/common/AppText';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/layout';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

type Props = NativeStackScreenProps<JournalStackParamList, 'JournalListe'>;
type FilterValue = 'alle' | 'gebete' | 'allgemein';

const FILTER_OPTIONS: { value: FilterValue; label: string }[] = [
  { value: 'alle', label: 'Alle' },
  { value: 'gebete', label: 'Gebete' },
  { value: 'allgemein', label: 'Allgemein' },
];

export default function JournalListScreen({ navigation }: Props) {
  const eintraegeNachMonat = useJournalStore((s) => s.eintraegeNachMonat);
  const anliegen = useAnliegenStore((s) => s.anliegen);
  const [filter, setFilter] = useState<FilterValue>('alle');

  const allSections = eintraegeNachMonat();
  const sections = allSections
    .map((s) => ({
      monat: s.monat,
      data: s.eintraege.filter((e) => {
        if (filter === 'gebete') return !!e.anliegenId;
        if (filter === 'allgemein') return !e.anliegenId;
        return true;
      }),
    }))
    .filter((s) => s.data.length > 0);

  const monatLabel = (monat: string) => {
    const [jahr, m] = monat.split('-');
    return format(new Date(Number(jahr), Number(m) - 1, 1), 'MMMM yyyy', { locale: de });
  };

  const totalEntries = sections.reduce((sum, s) => sum + s.data.length, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Filter bar */}
      <View style={styles.filterBar}>
        {FILTER_OPTIONS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[styles.filterChip, filter === f.value && styles.filterChipAktiv]}
            onPress={() => setFilter(f.value)}
          >
            <AppText
              variant="caption"
              color={filter === f.value ? colors.white : colors.textSecondary}
            >
              {f.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {totalEntries === 0 ? (
        allSections.length === 0 ? (
          <EmptyState
            icon="journal-outline"
            titel="Noch keine Einträge"
            text="Halte fest, was Gott dir zeigt."
            ctaLabel="Ersten Eintrag schreiben"
            onCta={() => navigation.navigate('JournalFormular', {})}
          />
        ) : (
          <EmptyState
            icon="filter-outline"
            titel="Keine Einträge"
            text={filter === 'gebete' ? 'Keine Gebetseindrücke vorhanden.' : 'Keine allgemeinen Einträge vorhanden.'}
          />
        )
      ) : (
        <SectionList
          sections={sections.map((s) => ({ title: s.monat, data: s.data }))}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const a = anliegen.find((a) => a.id === item.anliegenId);
            return (
              <JournalCard
                eintrag={item}
                anliegenTitel={a?.titel}
                anliegenKategorie={a?.kategorie}
                onPress={() => navigation.navigate('JournalDetail', { eintragId: item.id })}
              />
            );
          }}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <AppText variant="label" color={colors.textPrimary} style={styles.monatLabel}>
                {monatLabel(section.title)}
              </AppText>
              <AppText variant="caption" color={colors.textDisabled}>
                {section.data.length} {section.data.length === 1 ? 'Eintrag' : 'Einträge'}
              </AppText>
            </View>
          )}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('JournalFormular', {})}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.full,
    backgroundColor: colors.bgSubtle,
  },
  filterChipAktiv: {
    backgroundColor: colors.terrakotta,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgPrimary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  monatLabel: {
    letterSpacing: 0.3,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.terrakotta,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
