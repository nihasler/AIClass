import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../constants/colors';
import { openDatabase } from '../db/database';
import { useAnliegenStore } from '../store/useAnliegenStore';
import { useJournalStore } from '../store/useJournalStore';
import { useStreakStore } from '../store/useStreakStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useKategorienStore } from '../store/useKategorienStore';
import {
  berechtigungAnfordern,
  erinnerungPlanen,
  notificationHandlerEinrichten,
} from '../services/notificationService';
import AppText from '../components/common/AppText';

type Props = NativeStackScreenProps<RootStackParamList, 'Laden'>;

export default function LoadingScreen({ navigation }: Props) {
  const ladeAnliegen = useAnliegenStore((s) => s.ladeAnliegen);
  const ladeEintraege = useJournalStore((s) => s.ladeEintraege);
  const ladeStreak = useStreakStore((s) => s.ladeStreak);
  const ladeSitzungen = useStreakStore((s) => s.ladeSitzungen);
  const ladeEinstellungen = useSettingsStore((s) => s.ladeEinstellungen);
  const ladeKategorien = useKategorienStore((s) => s.ladeKategorien);
  const settingsState = useSettingsStore();

  useEffect(() => {
    notificationHandlerEinrichten();
    init();
  }, []);

  async function init() {
    try {
      await openDatabase();
      await Promise.all([ladeAnliegen(), ladeEintraege(), ladeStreak(), ladeSitzungen(), ladeEinstellungen(), ladeKategorien()]);

      const berechtigt = await berechtigungAnfordern();
      if (berechtigt && settingsState.erinnerungAktiv) {
        await erinnerungPlanen(settingsState.erinnerungStunde, settingsState.erinnerungMinute);
      }
    } catch (e) {
      console.error('Init-Fehler:', e);
    } finally {
      navigation.replace('Haupt', {} as any);
    }
  }

  return (
    <View style={styles.container}>
      <AppText style={styles.logo}>🙏</AppText>
      <AppText variant="heading1" style={styles.titel}>Gebet</AppText>
      <ActivityIndicator color={colors.terrakotta} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 64,
    marginBottom: 8,
  },
  titel: {
    color: colors.terrakotta,
    marginBottom: 32,
  },
  spinner: {
    marginTop: 16,
  },
});
