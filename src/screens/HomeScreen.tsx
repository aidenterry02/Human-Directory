/**
 * Home screen - displays list of people sorted by overdue status
 */

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { FilterBar, FilterType } from '../components/FilterBar';
import { Header } from '../components/Header';
import { PersonCard } from '../components/PersonCard';
import { StatsCard } from '../components/StatsCard';
import { useDarkMode } from '../context/DarkModeContext';
import { usePeople } from '../context/PeopleContext';
import {
  enrichPersonWithStatus,
  getDaysSince,
  sortPeopleByOverdue,
} from '../utils/dateUtils';
import { borderRadius, fontSize, scale, spacing } from '../utils/responsive';
import { getQuickStats } from '../utils/streakUtils';
import { getTheme } from '../utils/theme';
import { RootStackParamList, RootTabParamList } from './types';

type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<RootStackParamList, 'Home'>,
  BottomTabScreenProps<RootTabParamList>
>;

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { people, loading, markAsContacted } = usePeople();
  const { isDarkMode } = useDarkMode();
  const theme = getTheme(isDarkMode);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handlePersonPress = (id: string) => {
    navigation.navigate('PersonDetails', { id });
  };

  const handleMarkContacted = async (id: string) => {
    try {
      await markAsContacted(id);
    } catch (error) {
      console.error('Error marking as contacted:', error);
    }
  };

  const stats = useMemo(() => getQuickStats(people), [people]);

  // Filter and search people
  const filteredPeople = useMemo(() => {
    let result = people;

    // Apply filter
    if (activeFilter === 'overdue') {
      result = result.filter((p) => enrichPersonWithStatus(p).isOverdue);
    } else if (activeFilter === 'week') {
      result = result.filter((p) => {
        const daysSince = getDaysSince(p.lastContactDate);
        return daysSince <= 7;
      });
    } else if (activeFilter === 'month') {
      result = result.filter((p) => {
        const daysSince = getDaysSince(p.lastContactDate);
        return daysSince <= 30;
      });
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.notes?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [people, activeFilter, searchQuery]);

  const sortedPeople = sortPeopleByOverdue(filteredPeople);

  // Split into overdue and current
  const overduePeople = sortedPeople.filter(
    (p) => enrichPersonWithStatus(p).isOverdue
  );
  const currentPeople = sortedPeople.filter(
    (p) => !enrichPersonWithStatus(p).isOverdue
  );

  const sections = [
    {
      title: overduePeople.length > 0 ? '🔔 Overdue for Contact' : '',
      data: overduePeople,
    },
    {
      title: currentPeople.length > 0 ? '✓ Current' : '',
      data: currentPeople,
    },
  ].filter((s) => s.data.length > 0);

  const containerStyle = {
    ...styles.container,
    backgroundColor: theme.primaryBg,
  };

  const inputStyle = {
    ...styles.searchInput,
    backgroundColor: theme.secondaryBg,
    color: theme.primaryText,
    borderColor: theme.primaryBorder,
  };

  if (loading) {
    return (
      <SafeAreaView style={containerStyle}>
        <Header title="People" subtitle="Relationship reminders" />
        <View style={styles.centerContent}>
          <Text style={{ ...styles.loadingText, color: isDarkMode ? '#999' : '#666' }}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (people.length === 0) {
    return (
      <SafeAreaView style={containerStyle}>
        <Header title="People" subtitle="Relationship reminders" />
        <View style={styles.centerContent}>
          <Text style={{ ...styles.emptyText, color: isDarkMode ? '#ffffff' : '#2c3e50' }}>
            No contacts yet
          </Text>
          <Text style={{ ...styles.emptySubtext, color: isDarkMode ? '#999' : '#999' }}>
            Add your first person to get started
          </Text>
          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: theme.primary, shadowColor: theme.primary },
            ]}
            onPress={() => navigation.navigate('AddPerson')}
          >
            <Text style={styles.addButtonText}>+ Add Person</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      <Header title="People" subtitle={`${people.length} contacts`} />

      {/* Stats Card */}
      <StatsCard
        totalPeople={stats.totalPeople}
        overdue={stats.overdue}
        contactedThisWeek={stats.contactedThisWeek}
        isDarkMode={isDarkMode}
      />

      {/* Search Input */}
      <TextInput
        style={inputStyle}
        placeholder="Search people or notes..."
        placeholderTextColor={theme.tertiaryText}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Filter Bar */}
      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        isDarkMode={isDarkMode}
      />

      {filteredPeople.length === 0 ? (
        <View style={{ ...styles.centerContent, flex: 1 }}>
          <Text style={{ ...styles.emptyText, color: theme.primaryText }}>
            No contacts found
          </Text>
          <Text style={{ ...styles.emptySubtext, color: theme.tertiaryText }}>
            Try adjusting your search or filters
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PersonCard
              person={item}
              onPress={() => handlePersonPress(item.id)}
              onMarkContacted={() => handleMarkContacted(item.id)}
            />
          )}
          renderSectionHeader={({ section: { title } }) =>
            title ? (
              <View style={{ ...styles.sectionHeader, backgroundColor: theme.primaryBg }}>
                <Text style={{ ...styles.sectionTitle, color: theme.secondaryText }}>
                  {title}
                </Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContent}
          scrollEnabled={filteredPeople.length > 0}
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
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontSize: fontSize.lg,
    color: '#666',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: fontSize['2xl'],
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: fontSize.base,
    color: '#999',
    marginBottom: spacing['2xl'],
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#667EEA',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  searchInput: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#e8eef2',
    fontSize: fontSize.base,
    backgroundColor: '#ffffff',
    color: '#333333',
  },
  listContent: {
    paddingVertical: spacing.xs,
  },
  sectionHeader: {
    backgroundColor: '#f5f7fa',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginTop: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: scale(13),
    fontWeight: '700',
    color: '#34495e',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
