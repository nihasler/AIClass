import React from 'react';
import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts, fontSize } from '../../constants/typography';
import { radius, spacing } from '../../constants/layout';
import AppText from './AppText';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export default function AppInput({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.container}>
      {label && (
        <AppText variant="label" color={colors.textSecondary} style={styles.label}>
          {label}
        </AppText>
      )}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor={colors.textDisabled}
        {...props}
      />
      {error && (
        <AppText variant="caption" color={colors.error} style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontFamily: fonts.interRegular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    minHeight: 44,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    marginTop: spacing.xs,
  },
});
