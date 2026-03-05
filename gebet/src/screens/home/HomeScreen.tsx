import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, MainTabParamList } from '../../types/navigation';
import { useStreakStore } from '../../store/useStreakStore';
import { useAnliegenStore } from '../../store/useAnliegenStore';
import { useJournalStore } from '../../store/useJournalStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { waehleSitzungsAnliegen } from '../../services/sitzungsAuswahl';
import StreakBadge from '../../components/home/StreakBadge';
import StreakCalendar from '../../components/home/StreakCalendar';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/layout';
import { getKategorieInfo } from '../../constants/categories';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const TAGES_INSPIRATIONEN = [
  '"Seid fröhlich in Hoffnung, geduldig in Trübsal, beharrlich im Gebet." – Röm 12,12',
  '"Betet ohne Unterlass." – 1 Thess 5,17',
  '"Der Herr ist nahe. Sorgt euch um nichts." – Phil 4,5-6',
  '"Rufe mich an in der Not, so will ich dich erretten." – Ps 50,15',
  '"Vertrau auf den Herrn von ganzem Herzen." – Spr 3,5',
];

function formatDauer(sek: number): string {
  const min = Math.round(sek / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

function startOfWeekISO(): string {
  const d = new Date();
  const day = d.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { aktuellerStreak, aktiveTage, sitzungen } = useStreakStore();
  const alleAnliegen = useAnliegenStore((s) => s.anliegen);
  const { eintraege } = useJournalStore();
  const { anzahlProSitzung, anzahlProKategorie } = useSettingsStore();

  const heutigeAnliegen = waehleSitzungsAnliegen(alleAnliegen, anzahlProSitzung, anzahlProKategorie);
  const tagIndex = new Date().getDay();
  const inspiration = TAGES_INSPIRATIONEN[tagIndex % TAGES_INSPIRATIONEN.length];

  const wocheStart = startOfWeekISO();
  const sitzungenDieseWoche = sitzungen.filter((s) => s.datum >= wocheStart);
  const wochenSekunden = sitzungenDieseWoche.reduce((sum, s) => sum + s.dauer_sek, 0);
  const durchschnittSek = sitzungen.length > 0
    ? Math.round(sitzungen.reduce((sum, s) => sum + s.dauer_sek, 0) / sitzungen.length)
    : 0;
  const rekordSek = sitzungen.length > 0
    ? Math.max(...sitzungen.map((s) => s.dauer_sek))
    : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <AppText variant="heading1" color={colors.terrakotta}>Gebet</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            {format(new Date(), 'EEEE, d. MMMM', { locale: de })}
          </AppText>
        </View>

        {/* Streak */}
        <AppCard style={styles.streakCard}>
          <StreakBadge streak={aktuellerStreak} />
          <StreakCalendar aktiveTage={aktiveTage} />
          {sitzungen.length > 0 && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <AppText variant="caption" color={colors.textDisabled}>Diese Woche</AppText>
                <AppText variant="label" color={colors.textSecondary}>{formatDauer(wochenSekunden)}</AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <AppText variant="caption" color={colors.textDisabled}>Ø / Sitzung</AppText>
                <AppText variant="label" color={colors.textSecondary}>{formatDauer(durchschnittSek)}</AppText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <AppText variant="caption" color={colors.textDisabled}>Rekord</AppText>
                <AppText variant="label" color={colors.textSecondary}>{formatDauer(rekordSek)}</AppText>
              </View>
            </View>
          )}
        </AppCard>

        {/* Inspirationsvers */}
        <AppCard style={styles.inspirationsCard}>
          <AppText variant="body" color={colors.textSecondary} style={styles.inspirationsText}>
            {inspiration}
          </AppText>
        </AppCard>

        {/* Gebets-Button */}
        <AppButton
          label="Jetzt beten"
          onPress={() => navigation.navigate('Gebetssitzung')}
          fullWidth
          style={styles.gebetsButton}
        />

        {/* Heutige Anliegen */}
        {heutigeAnliegen.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppText variant="heading2" style={styles.sectionTitel}>
                Heute beten für
              </AppText>
              <TouchableOpacity
                onPress={() => navigation.navigate('Einstellungen')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="settings-outline" size={18} color={colors.textDisabled} />
              </TouchableOpacity>
            </View>
            {heutigeAnliegen.map((a) => {
              const info = getKategorieInfo(a.kategorie);
              return (
                <TouchableOpacity
                  key={a.id}
                  style={styles.anliegenRow}
                  onPress={() =>
                    navigation.navigate('Anliegen', {
                      screen: 'AnliegenDetail',
                      params: { anliegenId: a.id },
                    })
                  }
                >
                  <View style={[styles.anliegenDot, { backgroundColor: info.farbe }]} />
                  <AppText variant="body" numberOfLines={1} style={styles.anliegenText}>
                    {a.titel}
                  </AppText>
                  <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Letzter Journaleintrag */}
        {eintraege.length > 0 && (
          <View style={styles.section}>
            <AppText variant="heading2" style={styles.sectionTitel}>
              Zuletzt notiert
            </AppText>
            <AppCard
              onPress={() =>
                navigation.navigate('Journal', {
                  screen: 'JournalDetail',
                  params: { eintragId: eintraege[0].id },
                })
              }
            >
              <AppText variant="label" color={colors.textSecondary}>
                {format(parseISO(eintraege[0].datum), 'd. MMMM', { locale: de })}
              </AppText>
              <AppText variant="body" numberOfLines={3} style={styles.journalExcerpt}>
                {eintraege[0].inhalt}
              </AppText>
            </AppCard>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.md,
  },
  streakCard: {
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  inspirationsCard: {
    backgroundColor: colors.terrakottaLight,
    marginBottom: spacing.md,
  },
  inspirationsText: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
  gebetsButton: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitel: {
    marginBottom: 0,
  },
  anliegenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  anliegenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  anliegenText: {
    flex: 1,
  },
  journalExcerpt: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
  },
});
