/**
 * Form component for adding and editing people
 */

import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDarkMode } from '../context/DarkModeContext';
import { Person, PersonInput } from '../types';
import { borderRadius, fontSize, scale, spacing } from '../utils/responsive';
import { getTheme } from '../utils/theme';

interface PersonFormProps {
  initialData?: Person;
  onSubmit: (data: PersonInput) => Promise<void>;
  buttonLabel?: string;
  isLoading?: boolean;
}

export const PersonForm: React.FC<PersonFormProps> = ({
  initialData,
  onSubmit,
  buttonLabel = 'Save',
  isLoading = false,
}) => {
  const { isDarkMode } = useDarkMode();
  const theme = getTheme(isDarkMode);
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [frequency, setFrequency] = useState('7');
  const [category, setCategory] = useState<string>('');
  const [error, setError] = useState('');

  const categories = ['Friends', 'Family', 'Work', 'Mentors', 'Other'];

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setNotes(initialData.notes);
      setFrequency(initialData.contactFrequencyDays.toString());
      setCategory(initialData.category || '');
    }
  }, [initialData]);

  const handleSubmit = async () => {
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    const frequencyNum = parseInt(frequency, 10);
    if (isNaN(frequencyNum) || frequencyNum < 1) {
      setError('Frequency must be a number greater than 0');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        notes: notes.trim(),
        contactFrequencyDays: frequencyNum,
        category: category || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const containerStyle = {
    ...styles.container,
    backgroundColor: theme.primaryBg,
  };

  const inputStyle = {
    ...styles.input,
    backgroundColor: theme.secondaryBg,
    borderColor: theme.primaryBorder,
    color: theme.primaryText,
  };

  const labelStyle = {
    ...styles.label,
    color: theme.secondaryText,
  };

  const errorContainerStyle = {
    ...styles.errorContainer,
    backgroundColor: isDarkMode ? '#2a1714' : '#fde7e7',
    borderLeftColor: theme.danger,
  };

  const categoryButtonStyle = {
    ...styles.categoryButton,
    backgroundColor: theme.secondaryBg,
    borderColor: theme.primaryBorder,
  };

  const categoryButtonActiveStyle = {
    ...styles.categoryButtonActive,
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={containerStyle}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.field}>
            <Text style={labelStyle}>Name * </Text>
            <TextInput
              style={inputStyle}
              placeholder="Enter person's name"
              value={name}
              onChangeText={setName}
              placeholderTextColor={theme.tertiaryText}
              editable={!isLoading}
            />
          </View>

          {/* Frequency */}
          <View style={styles.field}>
            <Text style={labelStyle}>Contact Frequency (days) *</Text>
            <TextInput
              style={inputStyle}
              placeholder="E.g., 7, 14, 30"
              value={frequency}
              onChangeText={setFrequency}
              keyboardType="number-pad"
              placeholderTextColor={theme.tertiaryText}
              editable={!isLoading}
            />
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={labelStyle}>Notes</Text>
            <TextInput
              style={[inputStyle, styles.notesInput]}
              placeholder="Optional notes about this person"
              value={notes}
              onChangeText={setNotes}
              placeholderTextColor={theme.tertiaryText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isLoading}
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={labelStyle}>Category</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    categoryButtonStyle,
                    category === cat && categoryButtonActiveStyle,
                  ]}
                  onPress={() => setCategory(category === cat ? '' : cat)}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      { color: theme.primary },
                      category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View style={errorContainerStyle}>
              <Text style={{ ...styles.errorText, color: theme.danger }}>{error}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.primary, shadowColor: theme.primary },
              isLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Saving...' : buttonLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: spacing.lg,
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e8eef2',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: '#2c3e50',
    fontWeight: '500',
  },
  notesInput: {
    height: scale(120),
    paddingVertical: spacing.md,
  },
  errorContainer: {
    backgroundColor: '#FDE7E7',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginVertical: spacing.xs,
    borderLeftWidth: scale(4),
    borderLeftColor: '#D32F2F',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#667EEA',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.3,
    shadowRadius: scale(8),
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: '#e8eef2',
    backgroundColor: '#fff',
  },
  categoryButtonActive: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  categoryButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#667EEA',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
});
