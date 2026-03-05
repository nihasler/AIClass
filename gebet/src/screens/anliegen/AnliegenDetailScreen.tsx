import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Animated,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AnliegenStackParamList } from '../../types/navigation';
import { useAnliegenStore } from '../../store/useAnliegenStore';
import { useJournalStore } from '../../store/useJournalStore';
import { useKategorienStore } from '../../store/useKategorienStore';
import JournalCard from '../../components/journal/JournalCard';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import KategorieChip from '../../components/anliegen/KategorieChip';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/layout';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { getKategorieInfo } from '../../constants/categories';

type Props = NativeStackScreenProps<AnliegenStackParamList, 'AnliegenDetail'>;

export default function AnliegenDetailScreen({ navigation, route }: Props) {
  const { anliegenId } = route.params;
  const anliegen = useAnliegenStore((s) => s.anliegen).find((a) => a.id === anliegenId);
  const markiereAlsErhoert = useAnliegenStore((s) => s.markiereAlsErhoert);
  const archiviere = useAnliegenStore((s) => s.archiviere);
  const aktualisiere = useAnliegenStore((s) => s.aktualisiere);
  const { eintraege } = useJournalStore();
  const customKategorien = useKategorienStore((s) => s.kategorien);
  const verknuepfteEintraege = eintraege.filter((e) => e.anliegenId === anliegenId);

  const celebrationScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (anliegen) {
      navigation.setOptions({
        title: anliegen.titel,
        headerRight: () => (
          <AppButton
            label="Bearbeiten"
            variant="ghost"
            onPress={() => navigation.navigate('AnliegenFormular', { anliegenId })}
          />
        ),
      });
    }
  }, [anliegen?.titel]);

  if (!anliegen) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppText>Anliegen nicht gefunden.</AppText>
      </SafeAreaView>
    );
  }

  const info = getKategorieInfo(anliegen.kategorie, customKategorien);

  const handleErhoert = () => {
    Alert.prompt(
      'Als erhört markieren',
      'Wie hat Gott geantwortet? (optional)',
      async (notiz) => {
        await markiereAlsErhoert(anliegenId, notiz || undefined);
        Animated.sequence([
          Animated.spring(celebrationScale, { toValue: 1.2, useNativeDriver: true }),
          Animated.spring(celebrationScale, { toValue: 1, useNativeDriver: true }),
        ]).start();
      },
      'plain-text',
      '',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppCard style={[styles.headerCard, { borderTopColor: info.farbe, borderTopWidth: 4 }]}>
          <View style={styles.headerRow}>
            <KategorieChip kategorie={anliegen.kategorie} />
            {anliegen.erhoert && (
              <Animated.View style={[styles.erhoertBadge, { transform: [{ scale: celebrationScale }] }]}>
                <Ionicons name="checkmark-circle" size={16} color={colors.salbei} />
                <AppText variant="label" color={colors.salbei} style={styles.erhoertText}>
                  Erhört
                </AppText>
              </Animated.View>
            )}
          </View>

          <AppText variant="heading1" style={styles.titel}>{anliegen.titel}</AppText>

          {anliegen.beschreibung ? (
            <AppText variant="body" color={colors.textSecondary} style={styles.beschreibung}>
              {anliegen.beschreibung}
            </AppText>
          ) : null}

          <AppText variant="caption" color={colors.textDisabled} style={styles.datum}>
            Seit {format(parseISO(anliegen.erstelltAm), 'd. MMMM yyyy', { locale: de })}
          </AppText>

          {anliegen.erhoertAm && (
            <AppText variant="caption" color={colors.salbei}>
              Erhört am {format(parseISO(anliegen.erhoertAm), 'd. MMMM yyyy', { locale: de })}
            </AppText>
          )}
          {anliegen.notizErhoert && (
            <AppText variant="body" color={colors.textSecondary} style={styles.notizErhoert}>
              {anliegen.notizErhoert}
            </AppText>
          )}

          {!anliegen.erhoert && !anliegen.archiviert && (
            <View style={styles.sitzungsRow}>
              <View style={styles.sitzungsInfo}>
                <AppText variant="label">In Sitzungen einschließen</AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {anliegen.inSitzung ? 'Erscheint in Gebetssitzungen' : 'Ausgeblendet – wird übersprungen'}
                </AppText>
              </View>
              <Switch
                value={anliegen.inSitzung}
                onValueChange={(v) => aktualisiere(anliegenId, { inSitzung: v })}
                trackColor={{ true: colors.terrakotta, false: colors.border }}
                thumbColor={colors.white}
              />
            </View>
          )}
        </AppCard>

        {!anliegen.erhoert && (
          <AppButton
            label="Als erhört markieren ✓"
            onPress={handleErhoert}
            variant="secondary"
            fullWidth
            style={styles.erhoertBtn}
          />
        )}

        <AppButton
          label="Journal schreiben"
          onPress={() =>
            navigation.getParent()?.navigate('Journal', {
              screen: 'JournalFormular',
              params: { anliegenId },
            })
          }
          variant="ghost"
          fullWidth
          style={styles.journalBtn}
        />

        {verknuepfteEintraege.length > 0 && (
          <View style={styles.section}>
            <AppText variant="heading2" style={styles.sectionTitel}>
              Journaleinträge ({verknuepfteEintraege.length})
            </AppText>
            {verknuepfteEintraege.map((e) => (
              <JournalCard
                key={e.id}
                eintrag={e}
                anliegenTitel={anliegen.titel}
                anliegenKategorie={anliegen.kategorie}
                onPress={() =>
                  navigation.getParent()?.navigate('Journal', {
                    screen: 'JournalDetail',
                    params: { eintragId: e.id },
                  })
                }
              />
            ))}
          </View>
        )}

        {!anliegen.archiviert && (
          <AppButton
            label="Archivieren"
            onPress={() => {
              Alert.alert('Archivieren?', 'Dieses Anliegen wird archiviert.', [
                { text: 'Abbrechen', style: 'cancel' },
                {
                  text: 'Archivieren',
                  style: 'destructive',
                  onPress: async () => {
                    await archiviere(anliegenId);
                    navigation.goBack();
                  },
                },
              ]);
            }}
            variant="ghost"
            fullWidth
            style={styles.archivBtn}
          />
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
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titel: {
    marginBottom: spacing.sm,
  },
  beschreibung: {
    marginBottom: spacing.sm,
  },
  datum: {
    marginTop: spacing.sm,
  },
  notizErhoert: {
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  erhoertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.salbeiLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
  },
  erhoertText: {
    marginLeft: 4,
  },
  sitzungsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sitzungsInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  erhoertBtn: {
    marginBottom: spacing.sm,
  },
  journalBtn: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitel: {
    marginBottom: spacing.sm,
  },
  archivBtn: {
    marginTop: spacing.lg,
  },
});
