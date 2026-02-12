/**
 * Beautiful card component for displaying a person with interaction level
 */

import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useDarkMode } from '../context/DarkModeContext';
import { Person } from '../types';
import {
    enrichPersonWithStatus,
    formatDate
} from '../utils/dateUtils';
import { borderRadius, fontSize, scale, shadows, spacing } from '../utils/responsive';
import { getTheme } from '../utils/theme';

interface PersonCardProps {
  person: Person;
  onPress: () => void;
  onMarkContacted?: () => void;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  onPress,
  onMarkContacted,
}) => {
  const { isDarkMode } = useDarkMode();
  const theme = getTheme(isDarkMode);
  const enriched = enrichPersonWithStatus(person);
  const { isOverdue, daysSinceLastContact } = enriched;
  const formattedDate = formatDate(person.lastContactDate);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: enriched.cardColor },
        isOverdue && styles.cardOverdue,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Background gradient effect */}
      <View style={[styles.cardContent, { backgroundColor: theme.secondaryBg }]}>
        {/* Top Section: Name and Level */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.name, { color: theme.primaryText }]}>{person.name}</Text>
            <Text style={[styles.frequency, { color: theme.tertiaryText }]}>
              Every {person.contactFrequencyDays}d
            </Text>
          </View>
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: theme.tertiaryBg, borderColor: theme.primaryBorder },
            ]}
          >
            <Text style={styles.levelEmoji}>{enriched.cardEmoji}</Text>
            <Text style={[styles.levelText, { color: theme.primaryText }]}>
              L{enriched.interactionLevel}
            </Text>
          </View>
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: theme.tertiaryText }]}>Last contact</Text>
            <Text style={[styles.statusValue, { color: theme.primaryText }]}>
              {daysSinceLastContact}d ago
            </Text>
          </View>
          <View style={[styles.statusDot, { backgroundColor: theme.primaryBorder }]} />
          <View style={styles.statusItem}>
            <Text style={[styles.statusLabel, { color: theme.tertiaryText }]}>Interactions</Text>
            <Text style={[styles.statusValue, { color: theme.primaryText }]}>
              {person.interactionCount || 0}
            </Text>
          </View>
        </View>

        {/* Notes Preview (if exists) */}
        {person.notes && (
          <Text
            style={[
              styles.notesPreview,
              { color: theme.tertiaryText, borderTopColor: theme.primaryBorder },
            ]}
            numberOfLines={1}
          >
            {person.notes}
          </Text>
        )}

        {/* Bottom Section: Status & Action */}
        <View style={[styles.bottom, { borderTopColor: theme.primaryBorder }]}>
          {isOverdue ? (
            <View
              style={[
                styles.overdueBadge,
                { backgroundColor: isDarkMode ? '#2a1714' : '#fde7e7' },
              ]}
            >
              <Text style={[styles.overdueBadgeText, { color: theme.danger }]}
              >
                🔔 Due for contact
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.onTimeBadge,
                { backgroundColor: isDarkMode ? '#133126' : '#e7f4ee' },
              ]}
            >
              <Text style={[styles.onTimeBadgeText, { color: theme.success }]}
              >
                ✓ All caught up
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
            onPress={onMarkContacted}
            activeOpacity={0.6}
          >
            <Text style={styles.contactButtonText}>↗</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.base,
  },
  cardOverdue: {
    opacity: 0.95,
  },
  cardContent: {
    padding: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(10px)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: spacing.xs,
  },
  frequency: {
    fontSize: fontSize.sm,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  levelBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  levelEmoji: {
    fontSize: fontSize['2xl'],
    marginBottom: 2,
  },
  levelText: {
    fontSize: scale(10),
    fontWeight: '700',
    color: '#2c3e50',
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  statusItem: {
    flex: 1,
  },
  statusLabel: {
    fontSize: scale(11),
    color: '#95a5a6',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statusValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#2c3e50',
  },
  statusDot: {
    width: scale(4),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: '#bdc3c7',
    marginHorizontal: spacing.md,
  },
  notesPreview: {
    fontSize: fontSize.sm,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginVertical: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  overdueBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: '#FFE5E5',
    flex: 1,
    marginRight: spacing.xs,
  },
  overdueBadgeText: {
    color: '#D32F2F',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  onTimeBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: '#E8F5E9',
    flex: 1,
    marginRight: spacing.xs,
  },
  onTimeBadgeText: {
    color: '#388E3C',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  contactButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.3,
    shadowRadius: scale(4),
    elevation: 3,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: fontSize['2xl'],
    fontWeight: '700',
  },
});
