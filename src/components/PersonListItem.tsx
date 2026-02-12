/**
 * Reusable component for displaying a person in a list
 */

import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDarkMode } from '../context/DarkModeContext';
import { Person } from '../types';
import {
    formatDate,
    getContactStatus,
} from '../utils/dateUtils';
import { borderRadius, fontSize, scale, spacing } from '../utils/responsive';
import { getTheme } from '../utils/theme';

interface PersonListItemProps {
  person: Person;
  onPress: () => void;
  onMarkContacted?: () => void;
}

export const PersonListItem: React.FC<PersonListItemProps> = ({
  person,
  onPress,
  onMarkContacted,
}) => {
  const { isDarkMode } = useDarkMode();
  const theme = getTheme(isDarkMode);
  const { isOverdue, daysSinceLastContact } = getContactStatus(
    person.lastContactDate,
    person.contactFrequencyDays
  );

  const formattedDate = formatDate(person.lastContactDate);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.secondaryBg, borderLeftColor: theme.primaryBorder },
        isOverdue && {
          borderLeftColor: theme.danger,
          backgroundColor: isDarkMode ? '#2a1714' : '#fde7e7',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: theme.primaryText }]}>{person.name}</Text>
          {isOverdue && (
            <View style={[styles.overdueBadge, { backgroundColor: theme.danger }]}
            >
              <Text style={styles.overdueBadgeText}>OVERDUE</Text>
            </View>
          )}
        </View>
        <Text style={[styles.lastContact, { color: theme.tertiaryText }]}>
          Last contact: {formattedDate} ({daysSinceLastContact}d ago)
        </Text>
        <Text style={[styles.frequency, { color: theme.tertiaryText }]}>
          Contact every {person.contactFrequencyDays} days
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.contactButton, { backgroundColor: theme.primary }]}
        onPress={onMarkContacted}
        activeOpacity={0.6}
      >
        <Text style={styles.contactButtonText}>✓</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: scale(4),
    borderLeftColor: '#e0e0e0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.05,
    shadowRadius: scale(4),
    elevation: 2,
  },
  containerOverdue: {
    borderLeftColor: '#ff6b6b',
    backgroundColor: '#fff5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  overdueBadge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  overdueBadgeText: {
    color: '#fff',
    fontSize: scale(10),
    fontWeight: '700',
  },
  lastContact: {
    fontSize: fontSize.sm,
    color: '#666',
    marginBottom: 2,
  },
  frequency: {
    fontSize: fontSize.sm,
    color: '#999',
  },
  contactButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
  },
});
