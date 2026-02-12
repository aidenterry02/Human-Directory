/**
 * Header component with soft, inviting design
 */

import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useDarkMode } from '../context/DarkModeContext';
import { fontSize, scale, spacing } from '../utils/responsive';
import { getTheme } from '../utils/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { isDarkMode } = useDarkMode();
  const theme = getTheme(isDarkMode);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.secondaryBg, borderBottomColor: theme.primaryBorder },
      ]}
    >
      <View style={[styles.orb, styles.orbOne, { backgroundColor: theme.warning }]} />
      <View style={[styles.orb, styles.orbTwo, { backgroundColor: theme.info }]} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.primaryText }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.tertiaryText }]}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.18,
  },
  orbOne: {
    width: scale(140),
    height: scale(140),
    top: scale(-30),
    right: scale(-40),
  },
  orbTwo: {
    width: scale(120),
    height: scale(120),
    bottom: scale(-50),
    left: scale(-30),
  },
  content: {
    marginTop: spacing.md,
  },
  title: {
    fontSize: fontSize['4xl'],
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    letterSpacing: -0.3,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    letterSpacing: 0.3,
  },
});
