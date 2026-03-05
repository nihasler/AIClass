import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import AppButton from './AppButton';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/layout';

interface Props {
  icon?: keyof typeof Ionicons.glyphMap;
  titel: string;
  text: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export default function EmptyState({ icon = 'leaf-outline', titel, text, ctaLabel, onCta }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={colors.textDisabled} style={styles.icon} />
      <AppText variant="heading2" style={styles.titel}>{titel}</AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.text}>{text}</AppText>
      {ctaLabel && onCta && (
        <AppButton label={ctaLabel} onPress={onCta} style={styles.cta} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  icon: {
    marginBottom: spacing.lg,
  },
  titel: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  text: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  cta: {},
});
