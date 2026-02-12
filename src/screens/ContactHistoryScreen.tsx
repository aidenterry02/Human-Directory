/**
 * Contact History Screen - Shows all contact dates for a person
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Header } from '../components/Header';
import { useDarkMode } from '../context/DarkModeContext';
import { usePeople } from '../context/PeopleContext';
import { formatDate, getDaysSince } from '../utils/dateUtils';
import { borderRadius, fontSize, scale, spacing } from '../utils/responsive';
import { getTheme } from '../utils/theme';
import { RootStackParamList } from './types';

type ContactHistoryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ContactHistory'
>;

export const ContactHistoryScreen: React.FC<ContactHistoryScreenProps> = ({
  route,
  navigation,
}) => {
  const { id } = route.params;
  const { people } = usePeople();
  const { isDarkMode } = useDarkMode();
  const theme = getTheme(isDarkMode);

  const person = people.find((p) => p.id === id);

  if (!person) {
    return (
      <SafeAreaView style={{ ...styles.container, backgroundColor: theme.primaryBg }}>
        <Header title="Contact History" subtitle={''} />
        <View style={styles.centerContent}>
          <Text style={{ ...styles.emptyText, color: theme.primaryText }}>
            Person not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const contactHistory = person.contactHistory || [person.lastContactDate];
  const sortedDates = [...contactHistory].sort().reverse();

  // Group by month/year
  const groupedDates = sortedDates.reduce(
    (acc, date) => {
      const dateObj = new Date(date);
      const monthYear = dateObj.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(date);
      return acc;
    },
    {} as Record<string, string[]>
  );

  const sections = Object.entries(groupedDates)
    .map(([title, data]) => ({
      title,
      data,
    }))
    .sort((a, b) => {
      const dateA = new Date(b.data[0]);
      const dateB = new Date(a.data[0]);
      return dateA.getTime() - dateB.getTime();
    });

  const containerStyle = {
    ...styles.container,
    backgroundColor: theme.primaryBg,
  };

  return (
    <SafeAreaView style={containerStyle}>
      <Header
        title="Contact History"
        subtitle={`${person.name} • ${contactHistory.length} contacts`}
      />

      {sortedDates.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={{ ...styles.emptyText, color: theme.primaryText }}>
            No contact history
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={({ item }) => {
            const daysSince = getDaysSince(item);
            const dateObj = new Date(item);
            const formatted = formatDate(item);

            let relativeTime = '';
            if (daysSince === 0) {
              relativeTime = 'Today';
            } else if (daysSince === 1) {
              relativeTime = 'Yesterday';
            } else if (daysSince < 7) {
              relativeTime = `${daysSince} days ago`;
            } else if (daysSince < 30) {
              const weeks = Math.floor(daysSince / 7);
              relativeTime = `${weeks} week${weeks > 1 ? 's' : ''} ago`;
            } else {
              const months = Math.floor(daysSince / 30);
              relativeTime = `${months} month${months > 1 ? 's' : ''} ago`;
            }

            return (
              <View
                style={{
                  ...styles.contactItem,
                  backgroundColor: theme.secondaryBg,
                  borderColor: theme.primaryBorder,
                }}
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={{
                      ...styles.contactDate,
                      color: theme.primaryText,
                    }}
                  >
                    {formatted}
                  </Text>
                  <Text
                    style={{
                      fontSize: fontSize.sm,
                      color: theme.tertiaryText,
                      marginTop: spacing.xs,
                    }}
                  >
                    {relativeTime}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: theme.tertiaryBg,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: borderRadius.md,
                  }}
                >
                  <Text
                    style={{
                      fontSize: scale(11),
                      fontWeight: '600',
                      color: theme.primary,
                    }}
                  >
                    {daysSince}d ago
                  </Text>
                </View>
              </View>
            );
          }}
          renderSectionHeader={({ section: { title } }) => (
            <View
              style={{
                ...styles.sectionHeader,
                backgroundColor: theme.primaryBg,
              }}
            >
              <Text
                style={{
                  ...styles.sectionTitle,
                  color: theme.secondaryText,
                }}
              >
                {title}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: '500',
    color: '#333333',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#e8eef2',
    backgroundColor: '#ffffff',
  },
  contactDate: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: '#333333',
  },
  listContent: {
    paddingVertical: spacing.xs,
  },
  sectionHeader: {
    backgroundColor: '#f5f7fa',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#34495e',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
