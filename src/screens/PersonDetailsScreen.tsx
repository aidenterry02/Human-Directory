/**
 * Person Details screen
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Header } from '../components/Header';
import { useDarkMode } from '../context/DarkModeContext';
import { usePeople } from '../context/PeopleContext';
import {
  enrichPersonWithStatus,
  formatDate,
  getContactStatus,
} from '../utils/dateUtils';
import { borderRadius, fontSize, scale, shadows, spacing } from '../utils/responsive';
import { getTheme } from '../utils/theme';
import { RootStackParamList } from './types';

type PersonDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PersonDetails'
>;

export const PersonDetailsScreen: React.FC<PersonDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { id } = route.params;
  const { people, deletePerson, markAsContacted } = usePeople();
  const { isDarkMode } = useDarkMode();
  const theme = getTheme(isDarkMode);
  const [isDeleting, setIsDeleting] = useState(false);

  const person = people.find((p) => p.id === id);

  if (!person) {
    return (
      <SafeAreaView style={{ ...styles.container, backgroundColor: theme.primaryBg }}>
        <Header title="Person Details" />
        <View style={styles.centerContent}>
          <Text style={{ ...styles.errorText, color: theme.primaryText }}>Person not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const enriched = enrichPersonWithStatus(person);
  const { isOverdue, daysSinceLastContact, daysOverdue } = getContactStatus(
    person.lastContactDate,
    person.contactFrequencyDays
  );

  const handleMarkContacted = async () => {
    try {
      await markAsContacted(id);
      Alert.alert('Done!', 'Contact date updated to today.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update contact date.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Person',
      `Are you sure you want to delete ${person.name}? This cannot be undone.`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deletePerson(id);
              Alert.alert('Deleted', `${person.name} has been deleted.`);
              navigation.navigate('Home');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete person.');
            } finally {
              setIsDeleting(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const progressBarStyle = {
    ...styles.progressBar,
    backgroundColor: theme.primaryBorder,
  };

  const progressFillStyle = {
    ...styles.progressFill,
    backgroundColor: theme.secondaryText,
  };

  const statusCardStyle = {
    ...styles.statusCard,
    backgroundColor: isOverdue ? theme.tertiaryBg : theme.secondaryBg,
    borderLeftColor: isOverdue ? theme.warning : theme.success,
    borderColor: theme.primaryBorder,
    borderWidth: 1,
  };

  const sectionStyle = {
    ...styles.section,
    backgroundColor: theme.secondaryBg,
    borderColor: theme.primaryBorder,
    borderWidth: 1,
  };

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: theme.primaryBg }}>
      <Header title={person.name} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Relationship Level Card */}
        <View
          style={[
            styles.levelCard,
            { backgroundColor: enriched.cardColor },
          ]}
        >
          <View style={styles.levelContent}>
            <Text style={styles.levelEmoji}>{enriched.cardEmoji}</Text>
            <Text style={[styles.levelLabel, { color: theme.primaryText }]}>Level {enriched.interactionLevel}</Text>
            <Text style={[styles.levelDescription, { color: theme.secondaryText }]}
            >
              {enriched.interactionLevel === 5 ? '💎 Bond Master' :
               enriched.interactionLevel === 4 ? '🌺 Strong Connection' :
               enriched.interactionLevel === 3 ? '🌸 Growing Bond' :
               enriched.interactionLevel === 2 ? '🌿 Building Relationship' :
               '🌱 New Connection'}
            </Text>
            <View style={progressBarStyle}>
              <View
                style={[
                  progressFillStyle,
                  { width: `${(enriched.interactionLevel / 5) * 100}%` },
                ]}
              />
            </View>
            <Text style={[styles.interactionCount, { color: theme.secondaryText }]}
            >
              {person.interactionCount || 0} interactions
            </Text>
          </View>
        </View>

        {/* Status Card */}
        <View
          style={statusCardStyle}
        >
          <Text style={[styles.statusLabel, { color: theme.secondaryText }]}>
            {isOverdue ? '🔔 Overdue!' : '✓ Current'}
          </Text>
          <Text style={[styles.statusValue, { color: theme.primaryText }]}>
            {daysSinceLastContact} days since last contact
          </Text>
          {isOverdue && (
            <Text style={[styles.statusOverdueValue, { color: theme.danger }]}>
              {daysOverdue} days overdue
            </Text>
          )}
        </View>

        {/* Last Contact */}
        <View style={sectionStyle}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Last Contact</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.tertiaryText }]}>Date:</Text>
            <Text style={[styles.detailValue, { color: theme.primaryText }]}>
              {formatDate(person.lastContactDate)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.tertiaryText }]}>Days ago:</Text>
            <Text style={[styles.detailValue, { color: theme.primaryText }]}>{daysSinceLastContact}</Text>
          </View>
        </View>

        {/* Frequency */}
        <View style={sectionStyle}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Contact Frequency</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.tertiaryText }]}>Every:</Text>
            <Text style={[styles.detailValue, { color: theme.primaryText }]}>
              {person.contactFrequencyDays} days
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.tertiaryText }]}>Next reminder:</Text>
            <Text style={[styles.detailValue, { color: theme.primaryText }]}>
              in {Math.max(0, person.contactFrequencyDays - daysSinceLastContact)} days
            </Text>
          </View>
        </View>

        {/* Notes */}
        {person.notes && (
          <View style={sectionStyle}>
            <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Notes</Text>
            <Text style={[styles.notesText, { color: theme.secondaryText }]}>{person.notes}</Text>
          </View>
        )}

        {/* Metadata */}
        <View style={sectionStyle}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.tertiaryText }]}>Added:</Text>
            <Text style={[styles.detailValue, { color: theme.primaryText }]}>
              {formatDate(person.createdAt)}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              { backgroundColor: theme.primary, shadowColor: theme.primary },
            ]}
            onPress={handleMarkContacted}
          >
            <Text style={styles.buttonText}>↗ Mark as Contacted</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              { backgroundColor: theme.secondaryBg, borderColor: theme.primaryBorder },
            ]}
            onPress={() => navigation.navigate('ContactHistory', { id })}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.primaryText }]}>
              📋 Contact History
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              { backgroundColor: theme.secondaryBg, borderColor: theme.primaryBorder },
            ]}
            onPress={() => navigation.navigate('EditPerson', { id })}
          >
            <Text style={[styles.secondaryButtonText, { color: theme.primaryText }]}>✎ Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.dangerButton,
              {
                backgroundColor: isDarkMode ? '#2a1714' : '#fde7e7',
                borderColor: theme.danger,
              },
            ]}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            <Text style={[styles.dangerButtonText, { color: theme.danger }]}>
              {isDeleting ? 'Deleting...' : '✕ Delete'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.lg,
    color: '#d32f2f',
    fontWeight: '500',
  },
  levelCard: {
    borderRadius: borderRadius.lg,
    padding: spacing['3xl'],
    marginBottom: spacing['2xl'],
    ...shadows.base,
  },
  levelContent: {
    alignItems: 'center',
  },
  levelEmoji: {
    fontSize: scale(48),
    marginBottom: spacing['2xl'],
  },
  levelLabel: {
    fontSize: fontSize['2xl'],
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: spacing.xs,
  },
  levelDescription: {
    fontSize: fontSize.base,
    color: '#555',
    fontWeight: '600',
    marginBottom: spacing['2xl'],
  },
  progressBar: {
    width: '100%',
    height: scale(8),
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: borderRadius.sm,
  },
  interactionCount: {
    fontSize: fontSize.sm,
    color: '#555',
    fontWeight: '600',
    opacity: 0.8,
  },
  statusCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
    borderLeftWidth: scale(4),
    borderLeftColor: '#4CAF50',
  },
  statusCardOverdue: {
    backgroundColor: '#FFF3E0',
    borderLeftColor: '#FF9800',
  },
  statusLabel: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: spacing.xs,
  },
  statusValue: {
    fontSize: fontSize['2xl'],
    fontWeight: '800',
    color: '#2c3e50',
  },
  statusOverdueValue: {
    fontSize: fontSize.base,
    color: '#D32F2F',
    marginTop: spacing.xs,
    fontWeight: '700',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '800',
    color: '#2c3e50',
    marginBottom: spacing.lg,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: '#95a5a6',
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: '#2c3e50',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  notesText: {
    fontSize: fontSize.base,
    color: '#555',
    lineHeight: 22,
    fontWeight: '500',
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  button: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  primaryButton: {
    backgroundColor: '#667EEA',
  },
  secondaryButton: {
    backgroundColor: '#f0f2f5',
    borderWidth: 1.5,
    borderColor: '#e8eef2',
  },
  secondaryButtonText: {
    color: '#2c3e50',
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: '#FDE7E7',
    borderWidth: 1.5,
    borderColor: '#F5CCCC',
  },
  dangerButtonText: {
    color: '#D32F2F',
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  buttonText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
