import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../common/AppText';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/layout';

interface Props {
  streak: number;
}

export default function StreakBadge({ streak: streak }: Props) {
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 60,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      <Ionicons name="flame-sharp" size={48} color={streak > 0 ? colors.terrakotta : colors.textDisabled} />
      <AppText variant="hero" color={streak > 0 ? colors.terrakotta : colors.textDisabled} style={styles.zahl}>
        {streak}
      </AppText>
      <AppText variant="caption" color={colors.textSecondary} style={styles.label}>
        {streak === 1 ? 'Tag in Folge' : 'Tage in Folge'}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  zahl: {
    marginTop: spacing.xs,
  },
  label: {
    marginTop: spacing.xs / 2,
  },
});
