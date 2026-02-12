/**
 * Settings Screen - User preferences
 */

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import * as Contacts from 'expo-contacts';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
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
import { usePreferences } from '../context/PreferencesContext';
import { scheduleDailyReminder } from '../utils/notificationUtils';
import { borderRadius, fontSize, scale, spacing } from '../utils/responsive';
import { getTheme } from '../utils/theme';
import { RootTabParamList } from './types';

type SettingsScreenProps = BottomTabScreenProps<RootTabParamList, 'Settings'>;

type ContactCandidate = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  isDuplicate: boolean;
};

const DEFAULT_IMPORT_FREQUENCY = 30;

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { notificationTime, setNotificationTime } = usePreferences();
  const { people, addPerson } = usePeople();
  const theme = getTheme(isDarkMode);
  const [selectedHour, setSelectedHour] = useState(notificationTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(notificationTime.minute);
  const [importVisible, setImportVisible] = useState(false);
  const [importCandidates, setImportCandidates] = useState<ContactCandidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  const normalizedPeople = useMemo(() => {
    return people.map((person) => ({
      name: person.name.trim().toLowerCase(),
      phone: person.phone?.replace(/[^0-9a-z]/gi, '').toLowerCase() || '',
      email: person.email?.trim().toLowerCase() || '',
    }));
  }, [people]);

  const isDuplicateContact = (candidate: Omit<ContactCandidate, 'isDuplicate'>) => {
    const name = candidate.name.trim().toLowerCase();
    const phone = candidate.phone?.replace(/[^0-9a-z]/gi, '').toLowerCase() || '';
    const email = candidate.email?.trim().toLowerCase() || '';

    return normalizedPeople.some((person) => {
      if (person.name !== name) {
        return false;
      }

      if (phone && person.phone) {
        return person.phone === phone;
      }

      if (email && person.email) {
        return person.email === email;
      }

      return !phone && !email;
    });
  };

  const handleSaveNotificationTime = async () => {
    try {
      await setNotificationTime(selectedHour, selectedMinute);
      await scheduleDailyReminder(selectedHour, selectedMinute);
      Alert.alert('Success', `Daily reminder set for ${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save notification time');
    }
  };

  const handleToggleDarkMode = async () => {
    try {
      await toggleDarkMode();
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle dark mode');
    }
  };

  const handleOpenImport = async () => {
    try {
      setIsLoadingContacts(true);
      const permission = await Contacts.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to contacts to import.');
        return;
      }

      const result = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      });

      if (!result.data.length) {
        Alert.alert('No contacts found', 'Your address book is empty.');
        return;
      }

      const candidates: ContactCandidate[] = [];
      result.data.forEach((contact) => {
        const name = contact.name?.trim();
        if (!name) {
          return;
        }

        const phone = contact.phoneNumbers?.[0]?.number?.trim();
        const email = contact.emails?.[0]?.email?.trim();
        const isDuplicate = isDuplicateContact({
          id: contact.id,
          name,
          phone,
          email,
        });

        candidates.push({
          id: contact.id,
          name,
          phone,
          email,
          isDuplicate,
        });
      });

      if (!candidates.length) {
        Alert.alert('No valid contacts', 'No contacts had a valid name to import.');
        return;
      }

      const nextSelected = new Set<string>();
      candidates.forEach((candidate) => {
        if (!candidate.isDuplicate) {
          nextSelected.add(candidate.id);
        }
      });

      setImportCandidates(candidates);
      setSelectedIds(nextSelected);
      setImportVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Unable to load contacts.');
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const nextSelected = new Set<string>();
    importCandidates.forEach((candidate) => {
      if (!candidate.isDuplicate) {
        nextSelected.add(candidate.id);
      }
    });
    setSelectedIds(nextSelected);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleImportSelected = async () => {
    if (selectedIds.size === 0) {
      Alert.alert('No contacts selected', 'Select at least one contact to import.');
      return;
    }

    try {
      setIsImporting(true);
      const selected = importCandidates.filter((candidate) => selectedIds.has(candidate.id));

      for (const candidate of selected) {
        await addPerson({
          name: candidate.name,
          notes: '',
          contactFrequencyDays: DEFAULT_IMPORT_FREQUENCY,
          phone: candidate.phone,
          email: candidate.email,
        });
      }

      setImportVisible(false);
      Alert.alert('Import complete', `${selected.length} contact${selected.length === 1 ? '' : 's'} added.`);
    } catch (error) {
      Alert.alert('Import failed', 'Something went wrong while importing contacts.');
    } finally {
      setIsImporting(false);
    }
  };

  const containerStyle = {
    ...styles.container,
    backgroundColor: theme.primaryBg,
  };

  const textColor = theme.primaryText;
  const subTextColor = theme.tertiaryText;
  const borderColor = theme.primaryBorder;
  const bgColor = theme.secondaryBg;

  return (
    <SafeAreaView style={containerStyle}>
      <Header title="Settings" subtitle="Customize your experience" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Dark Mode Section */}
        <View style={{ ...styles.section, backgroundColor: bgColor, borderColor }}>
          <View style={styles.sectionHeader}>
            <Text style={{ ...styles.sectionTitle, color: textColor }}>Appearance</Text>
          </View>
          
          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleToggleDarkMode}
          >
            <View style={styles.settingLabel}>
              <Text style={{ ...styles.settingText, color: textColor }}>Dark Mode</Text>
              <Text style={{ ...styles.settingSubtext, color: subTextColor }}>
                {isDarkMode ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <View style={styles.toggle}>
              <View
                style={{
                  width: scale(30),
                  height: scale(16),
                  borderRadius: scale(8),
                  backgroundColor: isDarkMode ? theme.primary : '#ccc',
                  justifyContent: 'center',
                  paddingHorizontal: spacing.xs,
                }}
              >
                <View
                  style={{
                    width: scale(14),
                    height: scale(14),
                    borderRadius: scale(7),
                    backgroundColor: '#fff',
                    alignSelf: isDarkMode ? 'flex-end' : 'flex-start',
                  }}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={{ ...styles.section, backgroundColor: bgColor, borderColor }}>
          <View style={styles.sectionHeader}>
            <Text style={{ ...styles.sectionTitle, color: textColor }}>Daily Reminder</Text>
            <Text style={{ ...styles.sectionSubtext, color: subTextColor }}>
              Set when to receive your daily reminder
            </Text>
          </View>

          {/* Time Pickers */}
          <View style={styles.timePickersContainer}>
            {/* Hour Picker */}
            <View style={styles.timePicker}>
              <Text style={{ ...styles.timeLabel, color: subTextColor }}>Hour</Text>
              <View style={{ ...styles.scrollableList, borderColor }}>
                {hours.map((hour) => (
                  <TouchableOpacity
                    key={hour}
                    style={{
                      ...styles.timeOption,
                      backgroundColor:
                        selectedHour === hour ? '#667EEA' : 'transparent',
                    }}
                    onPress={() => setSelectedHour(hour)}
                  >
                    <Text
                      style={{
                        fontSize: fontSize.lg,
                        fontWeight: '600',
                        color:
                          selectedHour === hour
                            ? '#fff'
                            : textColor,
                      }}
                    >
                      {String(hour).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Minute Picker */}
            <View style={styles.timePicker}>
              <Text style={{ ...styles.timeLabel, color: subTextColor }}>Minute</Text>
              <View style={{ ...styles.scrollableList, borderColor }}>
                {minutes.map((minute) => (
                  <TouchableOpacity
                    key={minute}
                    style={{
                      ...styles.timeOption,
                      backgroundColor:
                        selectedMinute === minute ? '#667EEA' : 'transparent',
                    }}
                    onPress={() => setSelectedMinute(minute)}
                  >
                    <Text
                      style={{
                        fontSize: fontSize.lg,
                        fontWeight: '600',
                        color:
                          selectedMinute === minute
                            ? '#fff'
                            : textColor,
                      }}
                    >
                      {String(minute).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Preview */}
          <View style={{ ...styles.previewBox, borderColor, backgroundColor: theme.tertiaryBg }}>
            <Text style={{ ...styles.previewLabel, color: subTextColor }}>Preview:</Text>
            <Text style={{ ...styles.previewTime, color: textColor }}>
              🔔 {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')}
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: theme.primary, shadowColor: theme.primary },
            ]}
            onPress={handleSaveNotificationTime}
          >
            <Text style={styles.saveButtonText}>Save Time</Text>
          </TouchableOpacity>
        </View>

        {/* Import Contacts Section */}
        <View style={{ ...styles.section, backgroundColor: bgColor, borderColor }}>
          <View style={styles.sectionHeader}>
            <Text style={{ ...styles.sectionTitle, color: textColor }}>Import Contacts</Text>
            <Text style={{ ...styles.sectionSubtext, color: subTextColor }}>
              Bring in people from your address book
            </Text>
          </View>
          <View style={styles.importContent}>
            <Text style={{ ...styles.importText, color: subTextColor }}>
              We will only import the name, phone, and email. You can edit details later.
            </Text>
            <TouchableOpacity
              style={[
                styles.importButton,
                { backgroundColor: theme.primary, shadowColor: theme.primary },
              ]}
              onPress={handleOpenImport}
              disabled={isLoadingContacts}
            >
              {isLoadingContacts ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.importButtonText}>Import from Contacts</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={{ ...styles.section, backgroundColor: bgColor, borderColor }}>
          <View style={styles.sectionHeader}>
            <Text style={{ ...styles.sectionTitle, color: textColor }}>About</Text>
          </View>
          <View style={styles.aboutContent}>
            <Text style={{ ...styles.aboutText, color: textColor }}>
              Human Directory
            </Text>
            <Text style={{ ...styles.aboutSubtext, color: subTextColor }}>
              v1.0.0
            </Text>
            <Text style={{ ...styles.aboutDescription, color: subTextColor }}>
              Never miss an important connection. Stay in touch with the people who matter.
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={importVisible}
        animationType="slide"
        onRequestClose={() => setImportVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.primaryBg }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.primaryBorder }]}>
            <Text style={[styles.modalTitle, { color: theme.primaryText }]}>
              Select Contacts
            </Text>
            <TouchableOpacity onPress={() => setImportVisible(false)}>
              <Text style={[styles.modalClose, { color: theme.primary }]}>Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={importCandidates}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.modalList}
            renderItem={({ item }) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <TouchableOpacity
                  style={[
                    styles.contactRow,
                    { backgroundColor: theme.secondaryBg, borderColor: theme.primaryBorder },
                  ]}
                  onPress={() => toggleSelection(item.id)}
                >
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactName, { color: theme.primaryText }]}>
                      {item.name}
                    </Text>
                    {(item.phone || item.email) && (
                      <Text style={[styles.contactMeta, { color: theme.tertiaryText }]}>
                        {item.phone || item.email}
                      </Text>
                    )}
                    {item.isDuplicate && (
                      <View style={[styles.duplicateBadge, { backgroundColor: theme.tertiaryBg }]}
                      >
                        <Text style={[styles.duplicateText, { color: theme.tertiaryText }]}
                        >
                          Duplicate
                        </Text>
                      </View>
                    )}
                  </View>
                  <View
                    style={[
                      styles.selectCircle,
                      {
                        borderColor: isSelected ? theme.primary : theme.primaryBorder,
                        backgroundColor: isSelected ? theme.primary : 'transparent',
                      },
                    ]}
                  >
                    {isSelected && <Text style={styles.selectCheck}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          <View style={[styles.modalActions, { borderTopColor: theme.primaryBorder }]}>
            <TouchableOpacity
              style={[styles.modalSecondaryButton, { borderColor: theme.primaryBorder }]}
              onPress={handleSelectAll}
            >
              <Text style={[styles.modalSecondaryText, { color: theme.primaryText }]}>Select All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalSecondaryButton, { borderColor: theme.primaryBorder }]}
              onPress={handleClearSelection}
            >
              <Text style={[styles.modalSecondaryText, { color: theme.primaryText }]}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalPrimaryButton, { backgroundColor: theme.primary }]}
              onPress={handleImportSelected}
              disabled={isImporting}
            >
              {isImporting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalPrimaryText}>Import</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
    gap: spacing.xl,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e8eef2',
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eef2',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: '#333333',
    marginBottom: spacing.xs,
  },
  sectionSubtext: {
    fontSize: fontSize.sm,
    color: '#999999',
    marginTop: spacing.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e8eef2',
  },
  settingLabel: {
    flex: 1,
  },
  settingText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: '#333333',
    marginBottom: spacing.xs,
  },
  settingSubtext: {
    fontSize: fontSize.sm,
    color: '#999999',
  },
  toggle: {
    marginLeft: spacing.md,
  },
  timePickersContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  timePicker: {
    flex: 1,
  },
  timeLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#999999',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollableList: {
    borderWidth: 1,
    borderColor: '#e8eef2',
    borderRadius: borderRadius.md,
    maxHeight: scale(200),
  },
  timeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e8eef2',
  },
  previewBox: {
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#e8eef2',
    backgroundColor: '#f0f2f5',
  },
  previewLabel: {
    fontSize: scale(11),
    fontWeight: '600',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  previewTime: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: '#333333',
  },
  saveButton: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
    backgroundColor: '#667EEA',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  importContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  importText: {
    fontSize: fontSize.sm,
    lineHeight: scale(18),
  },
  importButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 4,
  },
  importButtonText: {
    color: '#fff',
    fontSize: fontSize.base,
    fontWeight: '700',
  },
  aboutContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  aboutText: {
    fontSize: fontSize['2xl'],
    fontWeight: '700',
    color: '#333333',
    marginBottom: spacing.xs,
  },
  aboutSubtext: {
    fontSize: fontSize.sm,
    color: '#999999',
    marginBottom: spacing.md,
  },
  aboutDescription: {
    fontSize: fontSize.sm,
    color: '#999999',
    textAlign: 'center',
    lineHeight: scale(18),
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  modalClose: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  modalList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  contactInfo: {
    flex: 1,
    paddingRight: spacing.md,
  },
  contactName: {
    fontSize: fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  contactMeta: {
    fontSize: fontSize.sm,
  },
  duplicateBadge: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  duplicateText: {
    fontSize: scale(10),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  selectCircle: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectCheck: {
    color: '#fff',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#00000010',
  },
  modalSecondaryButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalSecondaryText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  modalPrimaryButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalPrimaryText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
});
