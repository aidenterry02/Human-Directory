/**
 * Quick stats card showing key metrics
 */

import React from 'react';
import { Platform, Text, View } from 'react-native';
import { borderRadius, fontSize, scale, spacing } from '../utils/responsive';
import { getTheme } from '../utils/theme';

interface StatsCardProps {
  totalPeople: number;
  overdue: number;
  contactedThisWeek: number;
  isDarkMode?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  totalPeople,
  overdue,
  contactedThisWeek,
  isDarkMode = false,
}) => {
  const theme = getTheme(isDarkMode);
  const backgroundColor = theme.secondaryBg;
  const textColor = theme.primaryText;
  const subtitleColor = theme.tertiaryText;
  const borderColor = theme.primaryBorder;
  const numberFont = Platform.select({ ios: 'Georgia', android: 'serif' });

  return (
    <View
      style={{
        backgroundColor,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scale(2) },
        shadowOpacity: isDarkMode ? 0.3 : 0.08,
        shadowRadius: scale(8),
        elevation: 3,
      }}
    >
      <Text
        style={{
          fontSize: fontSize.base,
          color: subtitleColor,
          fontWeight: '600',
          letterSpacing: 0.5,
          marginBottom: spacing.lg,
        }}
      >
        QUICK STATS
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* Total People */}
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: fontSize['4xl'],
              fontWeight: 'bold',
              color: theme.primary,
              fontFamily: numberFont,
              marginBottom: spacing.xs,
            }}
          >
            {totalPeople}
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: subtitleColor }}>Total</Text>
        </View>

        {/* Overdue */}
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: fontSize['4xl'],
              fontWeight: 'bold',
              color: theme.danger,
              fontFamily: numberFont,
              marginBottom: spacing.xs,
            }}
          >
            {overdue}
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: subtitleColor }}>Overdue</Text>
        </View>

        {/* Contacted This Week */}
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              fontSize: fontSize['4xl'],
              fontWeight: 'bold',
              color: theme.success,
              fontFamily: numberFont,
              marginBottom: spacing.xs,
            }}
          >
            {contactedThisWeek}
          </Text>
          <Text style={{ fontSize: fontSize.sm, color: subtitleColor }}>This Week</Text>
        </View>
      </View>
    </View>
  );
};
