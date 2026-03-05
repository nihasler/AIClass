import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAnliegenStore } from '../../store/useAnliegenStore';
import { useStreakStore } from '../../store/useStreakStore';
import { useJournalStore } from '../../store/useJournalStore';
import { useKategorienStore } from '../../store/useKategorienStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { waehleSitzungsAnliegen } from '../../services/sitzungsAuswahl';
import AppText from '../../components/common/AppText';
import AppButton from '../../components/common/AppButton';
import AppCard from '../../components/common/AppCard';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/layout';
import { getKategorieInfo } from '../../constants/categories';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GesendeterEindruck {
  id: string;
  inhalt: string;
  editMode: boolean;
  editText: string;
}

export default function PrayerSessionScreen() {
  const navigation = useNavigation<any>();
  const alleAnliegen = useAnliegenStore((s) => s.anliegen);
  const sitzungGebetet = useAnliegenStore((s) => s.sitzungGebetet);
  const zeichneAuf = useStreakStore((s) => s.zeichneGebetstagAuf);
  const speichereSitzung = useStreakStore((s) => s.speichereSitzung);
  const fuegeJournalHinzu = useJournalStore((s) => s.fuegeHinzu);
  const aktualisiereJournal = useJournalStore((s) => s.aktualisiere);
  const customKategorien = useKategorienStore((s) => s.kategorien);
  const { anzahlProSitzung, anzahlProKategorie } = useSettingsStore();

  const anliegen = waehleSitzungsAnliegen(alleAnliegen, anzahlProSitzung, anzahlProKategorie);

  const [index, setIndex] = useState(0);
  const [abgeschlossen, setAbgeschlossen] = useState(false);
  const [aktuellInput, setAktuellInput] = useState('');
  const [gesendete, setGesendete] = useState<GesendeterEindruck[]>([]);
  const translateX = useRef(new Animated.Value(0)).current;
  const sessionStartRef = useRef(Date.now());

  // Reset impression state when switching to a different prayer request
  useEffect(() => {
    setAktuellInput('');
    setGesendete([]);
  }, [index]);

  const sendeEindruck = async () => {
    const text = aktuellInput.trim();
    if (!text || !anliegen[index]) return;
    const id = await fuegeJournalHinzu({
      inhalt: text,
      anliegenId: anliegen[index].id,
      titel: undefined,
      stimmung: undefined,
    });
    setGesendete((prev) => [...prev, { id, inhalt: text, editMode: false, editText: '' }]);
    setAktuellInput('');
  };

  const starteBearbeitung = (id: string) => {
    setGesendete((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, editMode: true, editText: e.inhalt }
          : { ...e, editMode: false }
      )
    );
  };

  const speichereBearbeitung = async (id: string) => {
    const entry = gesendete.find((e) => e.id === id);
    if (!entry || !entry.editText.trim()) return;
    await aktualisiereJournal(id, { inhalt: entry.editText.trim() });
    setGesendete((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, inhalt: e.editText.trim(), editMode: false } : e
      )
    );
  };

  const naechstes = () => {
    if (index < anliegen.length - 1) {
      Animated.timing(translateX, {
        toValue: -SCREEN_WIDTH,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setIndex((i) => i + 1);
        translateX.setValue(SCREEN_WIDTH);
        Animated.timing(translateX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      });
    } else {
      abschliessen();
    }
  };

  const abschliessen = async () => {
    // Save any unsent impression still in the input
    if (aktuellInput.trim() && anliegen[index]) {
      await fuegeJournalHinzu({
        inhalt: aktuellInput.trim(),
        anliegenId: anliegen[index].id,
        titel: undefined,
        stimmung: undefined,
      });
    }
    const dauerSek = Math.round((Date.now() - sessionStartRef.current) / 1000);
    await Promise.all([
      zeichneAuf(),
      speichereSitzung(dauerSek),
      sitzungGebetet(anliegen.map((a) => a.id)),
    ]);
    setAbgeschlossen(true);
  };

  if (abgeschlossen) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.abschlussContainer}>
          <AppText style={styles.abschlussEmoji}>✨</AppText>
          <AppText variant="heading1" style={styles.abschlussTitel}>
            Gut gemacht!
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.abschlussText}>
            Du hast heute gebetet. Möchtest du noch einen Gesamteindruck aufschreiben?
          </AppText>
          <AppButton
            label="Eindruck notieren"
            onPress={() => {
              navigation.navigate('Haupt', {
                screen: 'Journal',
                params: { screen: 'JournalFormular', params: {} },
              });
            }}
            fullWidth
            style={styles.btn}
          />
          <AppButton
            label="Fertig"
            onPress={() => navigation.goBack()}
            variant="ghost"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  if (anliegen.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.leerContainer}>
          <AppText style={styles.abschlussEmoji}>🙏</AppText>
          <AppText variant="heading2" style={styles.abschlussTitel}>
            Keine Anliegen
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.abschlussText}>
            Füge zuerst Gebetsanliegen hinzu.
          </AppText>
          <AppButton
            label="Trotzdem beten"
            onPress={abschliessen}
            fullWidth
            style={styles.btn}
          />
        </View>
      </SafeAreaView>
    );
  }

  const aktuell = anliegen[index];
  const info = getKategorieInfo(aktuell.kategorie, customKategorien);
  const fortschritt = ((index + 1) / anliegen.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <AppText variant="label" color={colors.textSecondary}>
            {index + 1} / {anliegen.length}
          </AppText>
        </View>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${fortschritt}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ transform: [{ translateX }] }}>
            <AppCard style={[styles.anliegenCard, { borderTopColor: info.farbe }]}>
              <View style={[styles.kategorieBar, { backgroundColor: info.farbe }]}>
                <AppText variant="label" color={colors.white}>{info.label}</AppText>
              </View>
              <AppText variant="heading1" style={styles.anliegenTitel}>
                {aktuell.titel}
              </AppText>
              {aktuell.beschreibung ? (
                <AppText variant="body" color={colors.textSecondary} style={styles.beschreibung}>
                  {aktuell.beschreibung}
                </AppText>
              ) : null}
            </AppCard>
          </Animated.View>

          <AppText variant="caption" color={colors.textDisabled} style={styles.hinweis}>
            Nimm dir einen Moment und bringe dieses Anliegen vor Gott.
          </AppText>

          {/* Impression input + send button */}
          <View style={styles.eindruckContainer}>
            <AppText variant="label" color={colors.textSecondary} style={styles.eindruckLabel}>
              Eindruck notieren
            </AppText>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.eindruckInput}
                value={aktuellInput}
                onChangeText={setAktuellInput}
                placeholder="Was zeigt dir Gott bei diesem Anliegen?"
                placeholderTextColor={colors.textDisabled}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.sendenBtn, !aktuellInput.trim() && styles.sendenBtnDisabled]}
                onPress={sendeEindruck}
                disabled={!aktuellInput.trim()}
              >
                <Ionicons name="send" size={18} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sent impressions */}
          {gesendete.length > 0 && (
            <View style={styles.gesendeteContainer}>
              {gesendete.map((e) => (
                <View key={e.id} style={styles.gesendeterEindruck}>
                  {e.editMode ? (
                    <View style={styles.editRow}>
                      <TextInput
                        style={styles.editInput}
                        value={e.editText}
                        onChangeText={(t) =>
                          setGesendete((prev) =>
                            prev.map((x) => (x.id === e.id ? { ...x, editText: t } : x))
                          )
                        }
                        multiline
                        autoFocus
                        textAlignVertical="top"
                      />
                      <TouchableOpacity
                        style={styles.editSpeichernBtn}
                        onPress={() => speichereBearbeitung(e.id)}
                      >
                        <Ionicons name="checkmark" size={18} color={colors.white} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.gesendeterRow}>
                      <AppText variant="body" style={styles.gesendeterText}>{e.inhalt}</AppText>
                      <TouchableOpacity
                        onPress={() => starteBearbeitung(e.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="pencil-outline" size={16} color={colors.textDisabled} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <AppButton
            label={index < anliegen.length - 1 ? 'Nächstes Anliegen' : 'Gebet abschliessen'}
            onPress={naechstes}
            fullWidth
          />
          {index < anliegen.length - 1 && (
            <AppButton
              label="Sitzung beenden"
              onPress={abschliessen}
              variant="ghost"
              fullWidth
              style={styles.skipBtn}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  progressContainer: {
    height: 3,
    backgroundColor: colors.bgSubtle,
    marginHorizontal: spacing.md,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.terrakotta,
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    flexGrow: 1,
  },
  anliegenCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  kategorieBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  anliegenTitel: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  beschreibung: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  hinweis: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  eindruckContainer: {
    marginBottom: spacing.sm,
  },
  eindruckLabel: {
    marginBottom: spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  eindruckInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    minHeight: 72,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    backgroundColor: colors.bgSubtle,
  },
  sendenBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.terrakotta,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  sendenBtnDisabled: {
    backgroundColor: colors.textDisabled,
  },
  gesendeteContainer: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  gesendeterEindruck: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.terrakotta,
  },
  gesendeterRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  gesendeterText: {
    flex: 1,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  editInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.terrakotta,
    borderRadius: radius.sm,
    padding: spacing.xs,
    minHeight: 60,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    backgroundColor: colors.bgPrimary,
    textAlignVertical: 'top',
  },
  editSpeichernBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.salbei,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  skipBtn: {
    marginTop: spacing.xs,
  },
  abschlussContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  leerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  abschlussEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  abschlussTitel: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  abschlussText: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  btn: {
    marginBottom: spacing.sm,
  },
});
