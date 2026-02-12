/**
 * Add Person screen
 */

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Header } from '../components/Header';
import { PersonForm } from '../components/PersonForm';
import { useDarkMode } from '../context/DarkModeContext';
import { usePeople } from '../context/PeopleContext';
import { getTheme } from '../utils/theme';
import { RootTabParamList } from './types';

type AddPersonScreenProps = BottomTabScreenProps<RootTabParamList, 'AddPerson'>;

export const AddPersonScreen: React.FC<AddPersonScreenProps> = ({
  navigation,
}) => {
  const { addPerson } = usePeople();
  const { isDarkMode } = useDarkMode();
  const theme = getTheme(isDarkMode);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await addPerson(data);
      Alert.alert('Success', 'Person added successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add person. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.primaryBg }]}>
      <Header title="Add Person" />
      <PersonForm
        onSubmit={handleSubmit}
        buttonLabel="Add Person"
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
});
