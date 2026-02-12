/**
 * AsyncStorage utilities for persisting Person data
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Person, PersonInput } from '../types';
import { getTodayISO } from '../utils/dateUtils';
import { calculateStreak } from '../utils/streakUtils';

const STORAGE_KEY = '@human_directory_people';

/**
 * Load all people from storage
 */
export const loadPeople = async (): Promise<Person[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading people from storage:', error);
    return [];
  }
};

/**
 * Save people to storage
 */
export const savePeople = async (people: Person[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(people));
  } catch (error) {
    console.error('Error saving people to storage:', error);
    throw error;
  }
};

/**
 * Add a new person
 */
export const addPerson = async (input: PersonInput): Promise<Person> => {
  const today = getTodayISO();
  const newPerson: Person = {
    id: `${Date.now()}`,
    ...input,
    lastContactDate: today,
    createdAt: today,
    interactionCount: 0,
    contactHistory: [today], // Initialize with today's contact
    streak: 0, // No streak yet (needs 2+ on-time contacts)
  };

  const people = await loadPeople();
  people.push(newPerson);
  await savePeople(people);

  return newPerson;
};

/**
 * Update a person
 */
export const updatePerson = async (
  id: string,
  updates: Partial<Person>
): Promise<Person> => {
  const people = await loadPeople();
  const index = people.findIndex((p) => p.id === id);

  if (index === -1) {
    throw new Error(`Person with id ${id} not found`);
  }

  const updatedPerson = { ...people[index], ...updates };
  people[index] = updatedPerson;
  await savePeople(people);

  return updatedPerson;
};

/**
 * Delete a person
 */
export const deletePerson = async (id: string): Promise<void> => {
  const people = await loadPeople();
  const filtered = people.filter((p) => p.id !== id);
  await savePeople(filtered);
};

/**
 * Mark a person as contacted (update lastContactDate to today, increment interaction count, track contact history, calculate streak)
 */
export const markAsContacted = async (id: string): Promise<Person> => {
  const today = getTodayISO();
  const people = await loadPeople();
  const person = people.find((p) => p.id === id);
  
  if (!person) {
    throw new Error(`Person with id ${id} not found`);
  }

  // Add today to contact history if not already present
  const contactHistory = person.contactHistory || [];
  if (!contactHistory.includes(today)) {
    contactHistory.push(today);
  }

  // Calculate new streak
  const streak = calculateStreak(contactHistory, person.contactFrequencyDays);

  return updatePerson(id, {
    lastContactDate: today,
    interactionCount: (person.interactionCount || 0) + 1,
    contactHistory,
    streak,
  });
};
