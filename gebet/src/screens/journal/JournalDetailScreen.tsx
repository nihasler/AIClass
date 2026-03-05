import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JournalStackParamList } from '../../types/navigation';
import { useJournalStore } from '../../store/useJournalStore';
import { useAnliegenStore } from '../../store/useAnliegenStore';
import { useKategorienStore } from '../../store/useKategorienStore';
import { getKategorieInfo } from '../../constants/categories';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';
import KategorieChip from '../../components/anliegen/KategorieChip';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/layout';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Stimmung } from '../../types/prayer';

const STIMMUNG_LABEL: Record<Stimmung, string> = {
  frieden: '☮️ Frieden',
  dankbar: '🙏 Dankbar',
  suchend: '🔍 Suchend',
  traurig: '😔 Traurig',
  hoffnungsvoll: '✨ Hoffnungsvoll',
};

type Props = NativeStackScreenProps<JournalStackParamList, 'JournalDetail'>;

export default function JournalDetailScreen({ navigation, route }: Props) {
  const { eintragId } = route.params;
  const { eintraege, loesche } = useJournalStore();
  const eintrag = eintraege.find((e) => e.id === eintragId);
  const anliegen = useAnliegenStore((s) => s.anliegen).find((a) => a.id === eintrag?.anliegenId);
  const customKategorien = useKategorienStore((s) => s.kategorien);

  const kategorieInfo = anliegen
    ? getKategorieInfo(anliegen.kategorie, customKategorien)
    : null;

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AppButton
          label="Bearbeiten"
          variant="ghost"
          onPress={() => navigation.navigate('JournalFormular', { eintragId })}
        />
      ),
    });
  }, []);

  if (!eintrag) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppText>Eintrag nicht gefunden.</AppText>
      </SafeAreaView>
    );
  }

  const handleLoeschen = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Eintrag löschen? Dieser Eintrag wird dauerhaft gelöscht.')) {
        loesche(eintragId).then(() => navigation.goBack());
      }
      return;
    }
    Alert.alert('Eintrag löschen?', 'Dieser Eintrag wird dauerhaft gelöscht.', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          await loesche(eintragId);
          navigation.goBack();
        },
      },
    ]);
  };

  const datum = format(parseISO(eintrag.datum), 'EEEE, d. MMMM yyyy', { locale: de });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Linked to prayer: show prayer banner */}
        {anliegen ? (
          <View style={[styles.anliegenBanner, { borderLeftColor: kategorieInfo?.farbe ?? colors.terrakotta }]}>
            <View style={styles.bannerTop}>
              <KategorieChip kategorie={anliegen.kategorie} size="sm" />
              <AppText variant="caption" color={colors.textDisabled}>{datum}</AppText>
            </View>
            <AppText variant="heading2" style={styles.anliegenTitel}>
              {anliegen.titel}
            </AppText>
          </View>
        ) : (
          /* Standalone entry header */
          <View style={styles.standaloneHeader}>
            <AppText variant="caption" color={colors.textDisabled}>{datum}</AppText>
            {eintrag.titel && (
              <AppText variant="heading1" style={styles.titel}>{eintrag.titel}</AppText>
            )}
          </View>
        )}

        {/* Mood */}
        {eintrag.stimmung && (
          <View style={styles.stimmungBadge}>
            <AppText variant="label" color={colors.terrakotta}>
              {STIMMUNG_LABEL[eintrag.stimmung]}
            </AppText>
          </View>
        )}

        {/* Content */}
        <AppText variant="body" style={styles.inhalt}>{eintrag.inhalt}</AppText>

        <AppButton
          label="Eintrag löschen"
          onPress={handleLoeschen}
          variant="ghost"
          style={styles.loeschenBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  // Prayer banner (linked entries)
  anliegenBanner: {
    borderLeftWidth: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  anliegenTitel: {
    marginTop: spacing.xs,
  },
  // Standalone header
  standaloneHeader: {
    marginBottom: spacing.md,
  },
  titel: {
    marginTop: spacing.sm,
  },
  // Mood
  stimmungBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.terrakottaLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
  },
  // Content
  inhalt: {
    lineHeight: 28,
    marginBottom: spacing.xl,
  },
  loeschenBtn: {
    marginTop: spacing.lg,
  },
});
