/**
 * Edit Person screen
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Header } from '../components/Header';
import { PersonForm } from '../components/PersonForm';
import { useDarkMode } from '../context/DarkModeContext';
import { usePeople } from '../context/PeopleContext';
import { fontSize } from '../utils/responsive';
import { getTheme } from '../utils/theme';
import { RootStackParamList } from './types';

type EditPersonScreenProps = NativeStackScreenProps<RootStackParamList, 'EditPerson'>;

export const EditPersonScreen: React.FC<EditPersonScreenProps> = ({
  navigation,
  route,
}) => {
  const { id } = route.params;
  const { people, updatePerson } = usePeople();
  const { isDarkMode } = useDarkMode();
  const theme = getTheme(isDarkMode);
  const [isLoading, setIsLoading] = useState(false);

  const person = people.find((p) => p.id === id);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await updatePerson(id, {
        name: data.name,
        notes: data.notes,
        contactFrequencyDays: data.contactFrequencyDays,
      });
      Alert.alert('Success', 'Person updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update person. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!person) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.primaryBg }]}>
        <Header title="Edit Person" />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: theme.danger }]}>Person not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.primaryBg }]}>
      <Header title="Edit Person" />
      <PersonForm
        initialData={person}
        onSubmit={handleSubmit}
        buttonLabel="Update Person"
        isLoading={isLoading}
      />
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
  errorText: {
    fontSize: fontSize.lg,
    color: '#d32f2f',
    fontWeight: '500',
  },
});
