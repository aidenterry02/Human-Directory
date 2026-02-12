/**
 * Filter bar with tabs for All, Overdue, Week, Month
 */

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { borderRadius, fontSize, spacing } from '../utils/responsive';
import { getTheme } from '../utils/theme';

export type FilterType = 'all' | 'overdue' | 'week' | 'month';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  isDarkMode?: boolean;
}

const FILTER_OPTIONS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onFilterChange,
  isDarkMode = false,
}) => {
  const theme = getTheme(isDarkMode);
  const backgroundColor = theme.secondaryBg;
  const textColor = theme.primaryText;
  const inactiveTextColor = theme.tertiaryText;

  return (
    <View
      style={{
        backgroundColor,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: theme.primaryBorder,
      }}
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = activeFilter === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onFilterChange(option.value)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: borderRadius['2xl'],
              backgroundColor: isActive ? theme.primary : 'transparent',
              borderWidth: isActive ? 0 : 1,
              borderColor: theme.primaryBorder,
            }}
          >
            <Text
              style={{
                fontSize: fontSize.sm,
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#fff' : inactiveTextColor,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
