import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { JournalStackParamList } from '../../types/navigation';
import { useJournalStore } from '../../store/useJournalStore';
import { useAnliegenStore } from '../../store/useAnliegenStore';
import { useKategorienStore } from '../../store/useKategorienStore';
import { Stimmung } from '../../types/prayer';
import { getKategorieInfo } from '../../constants/categories';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppText from '../../components/common/AppText';
import KategorieChip from '../../components/anliegen/KategorieChip';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/layout';

type Props = NativeStackScreenProps<JournalStackParamList, 'JournalFormular'>;

const STIMMUNGEN: { value: Stimmung; emoji: string; label: string }[] = [
  { value: 'frieden', emoji: '☮️', label: 'Frieden' },
  { value: 'dankbar', emoji: '🙏', label: 'Dankbar' },
  { value: 'suchend', emoji: '🔍', label: 'Suchend' },
  { value: 'traurig', emoji: '😔', label: 'Traurig' },
  { value: 'hoffnungsvoll', emoji: '✨', label: 'Hoffnungsvoll' },
];

export default function JournalFormScreen({ navigation, route }: Props) {
  const { anliegenId: vorausgefuelltesAnliegenId, eintragId } = route.params ?? {};
  const isEdit = !!eintragId;

  const { eintraege, fuegeHinzu, aktualisiere } = useJournalStore();
  const anliegen = useAnliegenStore((s) => s.anliegen).filter((a) => !a.archiviert);
  const customKategorien = useKategorienStore((s) => s.kategorien);
  const vorhandenerEintrag = eintraege.find((e) => e.id === eintragId);

  const [titel, setTitel] = useState(vorhandenerEintrag?.titel ?? '');
  const [inhalt, setInhalt] = useState(vorhandenerEintrag?.inhalt ?? '');
  const [stimmung, setStimmung] = useState<Stimmung | undefined>(vorhandenerEintrag?.stimmung);
  const [gewaehltesAnliegenId, setGewaehltesAnliegenId] = useState<string | undefined>(
    vorhandenerEintrag?.anliegenId ?? vorausgefuelltesAnliegenId
  );
  const [loading, setLoading] = useState(false);
  const [fehler, setFehler] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Eintrag bearbeiten' : 'Neuer Eintrag' });
  }, [isEdit]);

  // Reset form when route params change (React Navigation caches the screen)
  useEffect(() => {
    const entry = eintraege.find((e) => e.id === eintragId);
    setTitel(entry?.titel ?? '');
    setInhalt(entry?.inhalt ?? '');
    setStimmung(entry?.stimmung);
    setGewaehltesAnliegenId(entry?.anliegenId ?? vorausgefuelltesAnliegenId);
  }, [eintragId, vorausgefuelltesAnliegenId]);

  const isLinked = !!gewaehltesAnliegenId;
  const gewaehltesAnliegen = anliegen.find((a) => a.id === gewaehltesAnliegenId);
  const kategorieInfo = gewaehltesAnliegen
    ? getKategorieInfo(gewaehltesAnliegen.kategorie, customKategorien)
    : null;

  const speichern = async () => {
    if (!inhalt.trim()) {
      setFehler('Bitte schreibe etwas.');
      return;
    }
    setFehler('');
    setLoading(true);
    try {
      if (isEdit && eintragId) {
        await aktualisiere(eintragId, {
          titel: isLinked ? undefined : (titel.trim() || undefined),
          inhalt: inhalt.trim(),
          stimmung,
          anliegenId: gewaehltesAnliegenId,
        });
      } else {
        await fuegeHinzu({
          titel: isLinked ? undefined : (titel.trim() || undefined),
          inhalt: inhalt.trim(),
          stimmung,
          anliegenId: gewaehltesAnliegenId,
        });
      }
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* LINKED MODE: prayer context banner */}
          {isLinked && gewaehltesAnliegen ? (
            <View style={[styles.anliegenBanner, { borderLeftColor: kategorieInfo?.farbe ?? colors.terrakotta }]}>
              <View style={styles.bannerTop}>
                <KategorieChip kategorie={gewaehltesAnliegen.kategorie} size="sm" />
                <TouchableOpacity
                  style={styles.unlinkBtn}
                  onPress={() => setGewaehltesAnliegenId(undefined)}
                >
                  <Ionicons name="close-circle-outline" size={16} color={colors.textSecondary} />
                  <AppText variant="caption" color={colors.textSecondary}> aufheben</AppText>
                </TouchableOpacity>
              </View>
              <AppText variant="heading3" style={styles.bannerTitel} numberOfLines={2}>
                {gewaehltesAnliegen.titel}
              </AppText>
            </View>
          ) : (
            /* STANDALONE MODE: optional title */
            <AppInput
              label="Überschrift (optional)"
              value={titel}
              onChangeText={setTitel}
              placeholder="Titel des Eintrags..."
              maxLength={80}
            />
          )}

          {/* Main content — always visible */}
          <AppInput
            label={isLinked ? 'Eindruck / Notiz *' : 'Was hat Gott dir gezeigt? *'}
            value={inhalt}
            onChangeText={setInhalt}
            placeholder={
              isLinked
                ? 'Was hat Gott dir bei diesem Anliegen gezeigt?'
                : 'Schreibe deine Gedanken, Eindrücke oder Gebetsantworten auf...'
            }
            multiline
            numberOfLines={8}
            style={styles.multiline}
            error={fehler}
            autoFocus={!isEdit}
          />

          {/* Mood */}
          <AppText variant="label" color={colors.textSecondary} style={styles.sectionLabel}>
            Wie geht es deiner Seele?
          </AppText>
          <View style={styles.stimmungRow}>
            {STIMMUNGEN.map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[styles.stimmungChip, stimmung === s.value && styles.stimmungChipAktiv]}
                onPress={() => setStimmung(stimmung === s.value ? undefined : s.value)}
              >
                <AppText style={styles.stimmungEmoji}>{s.emoji}</AppText>
                <AppText
                  variant="caption"
                  color={stimmung === s.value ? colors.terrakotta : colors.textSecondary}
                >
                  {s.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>

          {/* STANDALONE MODE: optional prayer link */}
          {!isLinked && anliegen.length > 0 && (
            <>
              <AppText variant="label" color={colors.textSecondary} style={styles.sectionLabel}>
                Mit Anliegen verknüpfen (optional)
              </AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.anliegenScroll}
              >
                {anliegen.map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    style={[
                      styles.anliegenChip,
                      gewaehltesAnliegenId === a.id && styles.anliegenChipAktiv,
                    ]}
                    onPress={() =>
                      setGewaehltesAnliegenId(
                        gewaehltesAnliegenId === a.id ? undefined : a.id
                      )
                    }
                  >
                    <AppText
                      variant="caption"
                      color={
                        gewaehltesAnliegenId === a.id
                          ? colors.terrakotta
                          : colors.textSecondary
                      }
                      numberOfLines={1}
                    >
                      {a.titel}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          <AppButton
            label={isEdit ? 'Speichern' : 'Eintrag speichern'}
            onPress={speichern}
            loading={loading}
            fullWidth
            style={styles.speichernBtn}
          />
        </ScrollView>
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
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  // Linked mode: prayer banner
  anliegenBanner: {
    borderLeftWidth: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  bannerTitel: {
    marginTop: spacing.xs,
  },
  unlinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Multiline input
  multiline: {
    height: 180,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  // Mood
  stimmungRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  stimmungChip: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    minWidth: 70,
  },
  stimmungChipAktiv: {
    borderColor: colors.terrakotta,
    backgroundColor: colors.terrakottaLight,
  },
  stimmungEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  // Prayer link (standalone mode)
  anliegenScroll: {
    marginBottom: spacing.lg,
  },
  anliegenChip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.xs,
  },
  anliegenChipAktiv: {
    borderColor: colors.terrakotta,
    backgroundColor: colors.terrakottaLight,
  },
  speichernBtn: {
    marginTop: spacing.md,
  },
});
