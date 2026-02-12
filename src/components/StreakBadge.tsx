/**
 * Badge displaying streak count
 */

import React from 'react';
import { Text, View } from 'react-native';
import { borderRadius, fontSize, spacing } from '../utils/responsive';
import { getTheme } from '../utils/theme';

interface StreakBadgeProps {
  streak: number;
  isDarkMode?: boolean;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
  streak,
  isDarkMode = false,
}) => {
  if (streak === 0) {
    return null;
  }

  const theme = getTheme(isDarkMode);
  const backgroundColor = isDarkMode ? '#3a2f1a' : '#fff1c6';
  const textColor = theme.primaryText;

  return (
    <View
      style={{
        backgroundColor,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
      }}
    >
      <Text style={{ fontSize: fontSize.lg }}>🔥</Text>
      <Text
        style={{
          fontSize: fontSize.sm,
          fontWeight: 'bold',
          color: textColor,
        }}
      >
        {streak} day{streak !== 1 ? 's' : ''}
      </Text>
    </View>
  );
};
