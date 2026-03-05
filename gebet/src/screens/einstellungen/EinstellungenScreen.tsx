import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Switch,
  Platform,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSettingsStore } from '../../store/useSettingsStore';
import AppText from '../../components/common/AppText';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/layout';

const ANZAHL_OPTIONEN = [
  { label: 'Alle', wert: 0 },
  { label: '3', wert: 3 },
  { label: '5', wert: 5 },
  { label: '7', wert: 7 },
  { label: '10', wert: 10 },
];

const KATEGORIE_OPTIONEN = [
  { label: 'Kein Limit', wert: 0 },
  { label: '1', wert: 1 },
  { label: '2', wert: 2 },
  { label: '3', wert: 3 },
];

export default function EinstellungenScreen() {
  const {
    erinnerungAktiv,
    erinnerungStunde,
    erinnerungMinute,
    haptikAktiv,
    anzahlProSitzung,
    anzahlProKategorie,
    speichereErinnerung,
    speichereHaptik,
    speichereSitzungsKonfiguration,
  } = useSettingsStore();

  const [showTimePicker, setShowTimePicker] = useState(false);

  const erinnerungsZeit = new Date();
  erinnerungsZeit.setHours(erinnerungStunde, erinnerungMinute, 0, 0);

  const zeitFormatiert = `${String(erinnerungStunde).padStart(2, '0')}:${String(erinnerungMinute).padStart(2, '0')} Uhr`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="heading1" style={styles.pageTitle}>Einstellungen</AppText>

        {/* Gebetssitzung */}
        <View style={styles.section}>
          <AppText variant="heading2" style={styles.sectionTitel}>Gebetssitzung</AppText>

          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <AppText variant="body">Anliegen pro Sitzung</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Wie viele Anliegen pro Gebetssitzung erscheinen
              </AppText>
            </View>
          </View>
          <View style={styles.chipRow}>
            {ANZAHL_OPTIONEN.map((opt) => (
              <TouchableOpacity
                key={opt.wert}
                style={[styles.chip, anzahlProSitzung === opt.wert && styles.chipAktiv]}
                onPress={() => speichereSitzungsKonfiguration(opt.wert, anzahlProKategorie)}
              >
                <AppText
                  variant="label"
                  color={anzahlProSitzung === opt.wert ? colors.white : colors.textSecondary}
                >
                  {opt.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.row, { marginTop: spacing.sm }]}>
            <View style={styles.rowInfo}>
              <AppText variant="body">Pro Kategorie max.</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Maximale Anzahl Anliegen pro Kategorie
              </AppText>
            </View>
          </View>
          <View style={styles.chipRow}>
            {KATEGORIE_OPTIONEN.map((opt) => (
              <TouchableOpacity
                key={opt.wert}
                style={[styles.chip, anzahlProKategorie === opt.wert && styles.chipAktiv]}
                onPress={() => speichereSitzungsKonfiguration(anzahlProSitzung, opt.wert)}
              >
                <AppText
                  variant="label"
                  color={anzahlProKategorie === opt.wert ? colors.white : colors.textSecondary}
                >
                  {opt.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Erinnerungen */}
        <View style={styles.section}>
          <AppText variant="heading2" style={styles.sectionTitel}>Gebetserinnerung</AppText>

          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <AppText variant="body">Tägliche Erinnerung</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Erinnert dich täglich ans Beten
              </AppText>
            </View>
            <Switch
              value={erinnerungAktiv}
              onValueChange={(v) => speichereErinnerung(v, erinnerungStunde, erinnerungMinute)}
              trackColor={{ true: colors.terrakotta, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>

          {erinnerungAktiv && (
            <TouchableOpacity
              style={styles.row}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.rowInfo}>
                <AppText variant="body">Uhrzeit</AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  Benachrichtigung um {zeitFormatiert}
                </AppText>
              </View>
              <AppText variant="body" color={colors.terrakotta}>{zeitFormatiert}</AppText>
            </TouchableOpacity>
          )}

          {showTimePicker && (
            <DateTimePicker
              value={erinnerungsZeit}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                setShowTimePicker(Platform.OS === 'ios');
                if (date) {
                  speichereErinnerung(erinnerungAktiv, date.getHours(), date.getMinutes());
                }
              }}
            />
          )}
        </View>

        {/* Haptik */}
        <View style={styles.section}>
          <AppText variant="heading2" style={styles.sectionTitel}>Feedback</AppText>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <AppText variant="body">Haptisches Feedback</AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                Vibration bei Interaktionen
              </AppText>
            </View>
            <Switch
              value={haptikAktiv}
              onValueChange={speichereHaptik}
              trackColor={{ true: colors.terrakotta, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Über die App */}
        <View style={styles.section}>
          <AppText variant="heading2" style={styles.sectionTitel}>Über Gebet</AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.about}>
            Gebet ist eine persönliche Gebets-App für mehr Konstanz und Tiefe im Gebet.
            Alle Daten werden lokal auf deinem Gerät gespeichert.
          </AppText>
          <AppText variant="caption" color={colors.textDisabled} style={styles.version}>
            Version 1.0.0
          </AppText>
        </View>
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
  pageTitle: {
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitel: {
    marginBottom: spacing.md,
    color: colors.terrakotta,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  rowInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipAktiv: {
    backgroundColor: colors.terrakotta,
    borderColor: colors.terrakotta,
  },
  about: {
    backgroundColor: colors.bgCard,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  version: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
