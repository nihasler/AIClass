import React from 'react';
import { Text, TextStyle, TextProps } from 'react-native';
import { colors } from '../../constants/colors';
import { fonts, fontSize } from '../../constants/typography';

type Variant = 'heading1' | 'heading2' | 'heading3' | 'body' | 'caption' | 'label' | 'hero';

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  children: React.ReactNode;
}

const variantStyles: Record<Variant, TextStyle> = {
  hero: { fontFamily: fonts.loraSemiBold, fontSize: fontSize.hero, lineHeight: fontSize.hero * 1.1 },
  heading1: { fontFamily: fonts.loraSemiBold, fontSize: fontSize.xxl, lineHeight: fontSize.xxl * 1.2 },
  heading2: { fontFamily: fonts.loraMedium, fontSize: fontSize.lg, lineHeight: fontSize.lg * 1.3 },
  heading3: { fontFamily: fonts.loraMedium, fontSize: fontSize.md, lineHeight: fontSize.md * 1.4 },
  body: { fontFamily: fonts.interRegular, fontSize: fontSize.md, lineHeight: fontSize.md * 1.6 },
  label: { fontFamily: fonts.interMedium, fontSize: fontSize.sm, lineHeight: fontSize.sm * 1.4 },
  caption: { fontFamily: fonts.interRegular, fontSize: fontSize.xs, lineHeight: fontSize.xs * 1.5 },
};

export default function AppText({ variant = 'body', color, style, children, ...props }: Props) {
  return (
    <Text
      style={[variantStyles[variant], { color: color ?? colors.textPrimary }, style]}
      {...props}
    >
      {children}
    </Text>
  );
}
