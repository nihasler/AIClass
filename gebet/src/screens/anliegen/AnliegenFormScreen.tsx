import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AnliegenStackParamList } from '../../types/navigation';
import { useAnliegenStore } from '../../store/useAnliegenStore';
import { useKategorienStore } from '../../store/useKategorienStore';
import { KATEGORIEN } from '../../constants/categories';
import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';
import AppText from '../../components/common/AppText';
import KategorieChip from '../../components/anliegen/KategorieChip';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/layout';

type Props = NativeStackScreenProps<AnliegenStackParamList, 'AnliegenFormular'>;

export default function AnliegenFormScreen({ navigation, route }: Props) {
  const { anliegenId } = route.params ?? {};
  const isEdit = !!anliegenId;

  const anliegen = useAnliegenStore((s) => s.anliegen).find((a) => a.id === anliegenId);
  const fuegeHinzu = useAnliegenStore((s) => s.fuegeHinzu);
  const aktualisiere = useAnliegenStore((s) => s.aktualisiere);
  const customKategorien = useKategorienStore((s) => s.kategorien);

  const [titel, setTitel] = useState(anliegen?.titel ?? '');
  const [beschreibung, setBeschreibung] = useState(anliegen?.beschreibung ?? '');
  const [kategorie, setKategorie] = useState<string>(anliegen?.kategorie ?? 'allgemein');
  const [loading, setLoading] = useState(false);
  const [fehler, setFehler] = useState('');

  useEffect(() => {
    navigation.setOptions({ title: isEdit ? 'Anliegen bearbeiten' : 'Neues Anliegen' });
  }, [isEdit]);

  const speichern = async () => {
    if (!titel.trim()) {
      setFehler('Bitte gib einen Titel ein.');
      return;
    }
    setFehler('');
    setLoading(true);
    try {
      if (isEdit && anliegenId) {
        await aktualisiere(anliegenId, { titel: titel.trim(), beschreibung: beschreibung.trim() || undefined, kategorie });
      } else {
        await fuegeHinzu({ titel: titel.trim(), beschreibung: beschreibung.trim() || undefined, kategorie });
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
          <AppInput
            label="Titel *"
            value={titel}
            onChangeText={setTitel}
            placeholder="Wofür möchtest du beten?"
            maxLength={120}
            error={fehler}
            autoFocus
          />

          <AppInput
            label="Beschreibung (optional)"
            value={beschreibung}
            onChangeText={setBeschreibung}
            placeholder="Mehr Details oder Hintergrund..."
            multiline
            numberOfLines={4}
            style={styles.multiline}
          />

          <AppText variant="label" color={colors.textSecondary} style={styles.kategorieLabel}>
            Kategorie
          </AppText>
          <View style={styles.kategorienGrid}>
            {KATEGORIEN.map((k) => (
              <KategorieChip
                key={k.value}
                kategorie={k.value}
                selected={kategorie === k.value}
                onPress={() => setKategorie(k.value)}
              />
            ))}
            {customKategorien.map((k) => (
              <KategorieChip
                key={k.id}
                kategorie={k.id}
                selected={kategorie === k.id}
                onPress={() => setKategorie(k.id)}
              />
            ))}
          </View>

          <AppButton
            label={isEdit ? 'Speichern' : 'Anliegen hinzufügen'}
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
  multiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  kategorieLabel: {
    marginBottom: spacing.sm,
  },
  kategorienGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  speichernBtn: {
    marginTop: spacing.md,
  },
});
