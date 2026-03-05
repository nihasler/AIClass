import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AnliegenStackParamList } from '../../types/navigation';
import { useAnliegenStore } from '../../store/useAnliegenStore';
import { useKategorienStore } from '../../store/useKategorienStore';
import AnliegenCard from '../../components/anliegen/AnliegenCard';
import KategorieFilter from '../../components/anliegen/KategorieFilter';
import EmptyState from '../../components/common/EmptyState';
import AppText from '../../components/common/AppText';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/layout';

type Props = NativeStackScreenProps<AnliegenStackParamList, 'AnliegenListe'>;

export default function AnliegenListScreen({ navigation }: Props) {
  const { aktiverFilter, setzeFilter, gefilterteAnliegen } = useAnliegenStore();
  const { kategorien, fuegeHinzu, loesche } = useKategorienStore();
  const anliegen = gefilterteAnliegen();

  const [modalSichtbar, setModalSichtbar] = useState(false);
  const [neueKatLabel, setNeueKatLabel] = useState('');

  const neueKategorieHinzufuegen = async () => {
    const label = neueKatLabel.trim();
    if (!label) return;
    await fuegeHinzu(label);
    setNeueKatLabel('');
  };

  const kategorieLoeschen = async (id: string) => {
    if (aktiverFilter === id) setzeFilter('offen');
    await loesche(id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KategorieFilter
        aktiv={aktiverFilter}
        onChange={setzeFilter}
        onEditCategories={() => setModalSichtbar(true)}
      />

      {anliegen.length === 0 ? (
        <EmptyState
          icon="list-outline"
          titel="Keine Anliegen"
          text="Halte fest, wofür du beten möchtest."
          ctaLabel="Erstes Anliegen hinzufügen"
          onCta={() => navigation.navigate('AnliegenFormular', {})}
        />
      ) : (
        <FlatList
          data={anliegen}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AnliegenCard
              anliegen={item}
              onPress={() => navigation.navigate('AnliegenDetail', { anliegenId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AnliegenFormular', {})}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>

      {/* Category management modal */}
      <Modal
        visible={modalSichtbar}
        transparent
        animationType="slide"
        onRequestClose={() => setModalSichtbar(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalSichtbar(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKAV}
          >
            <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
              {/* Handle */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.modalHeader}>
                <AppText variant="heading2">Kategorien verwalten</AppText>
                <TouchableOpacity onPress={() => setModalSichtbar(false)}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
                {/* Custom categories list */}
                {kategorien.length === 0 ? (
                  <AppText variant="body" color={colors.textDisabled} style={styles.leerText}>
                    Noch keine eigenen Kategorien.
                  </AppText>
                ) : (
                  kategorien.map((k) => (
                    <View key={k.id} style={styles.katRow}>
                      <View style={[styles.katFarbe, { backgroundColor: k.farbe }]} />
                      <AppText variant="body" style={styles.katLabel}>{k.label}</AppText>
                      <TouchableOpacity
                        onPress={() => kategorieLoeschen(k.id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.textDisabled} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}

                {/* Divider */}
                <View style={styles.divider} />

                {/* Add new category */}
                <AppText variant="label" color={colors.textSecondary} style={styles.addLabel}>
                  Neue Kategorie
                </AppText>
                <View style={styles.addRow}>
                  <TextInput
                    style={styles.addInput}
                    value={neueKatLabel}
                    onChangeText={setNeueKatLabel}
                    placeholder="Kategoriename..."
                    placeholderTextColor={colors.textDisabled}
                    returnKeyType="done"
                    onSubmitEditing={neueKategorieHinzufuegen}
                  />
                  <TouchableOpacity
                    style={[styles.addBtn, !neueKatLabel.trim() && styles.addBtnDisabled]}
                    onPress={neueKategorieHinzufuegen}
                    disabled={!neueKatLabel.trim()}
                  >
                    <Ionicons name="add" size={20} color={colors.white} />
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalKAV: {
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.bgPrimary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.xl,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  leerText: {
    paddingVertical: spacing.md,
    textAlign: 'center',
  },
  katRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  katFarbe: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  katLabel: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  addLabel: {
    marginBottom: spacing.sm,
  },
  addRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  addInput: {
    flex: 1,
    height: 42,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    backgroundColor: colors.bgSubtle,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    backgroundColor: colors.terrakotta,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    backgroundColor: colors.textDisabled,
  },
});
