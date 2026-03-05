import React from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../constants/colors';
import { spacing, radius } from '../../constants/layout';
import { useSettingsStore } from '../../store/useSettingsStore';
import AppText from './AppText';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
}: Props) {
  const haptikAktiv = useSettingsStore((s) => s.haptikAktiv);

  const handlePress = () => {
    if (haptikAktiv) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const containerStyle: (ViewStyle | undefined | false)[] = [
    styles.base,
    styles[variant],
    fullWidth ? styles.fullWidth : undefined,
    disabled ? styles.disabled : undefined,
    style,
  ];

  const textColor =
    variant === 'primary' || variant === 'danger'
      ? colors.white
      : variant === 'secondary'
      ? colors.terrakotta
      : colors.textSecondary;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={containerStyle}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <AppText variant="label" color={textColor}>
          {label}
        </AppText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  primary: {
    backgroundColor: colors.terrakotta,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.terrakotta,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: colors.error,
  },
  disabled: {
    opacity: 0.4,
  },
});
