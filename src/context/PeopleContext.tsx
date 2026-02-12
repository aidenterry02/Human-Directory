/**
 * Context and hook for managing people list state globally
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import * as personStorage from '../storage/personStorage';
import { PeopleContextType, Person, PersonInput } from '../types';
import { SAMPLE_PEOPLE } from '../utils/sampleData';

const PeopleContext = createContext<PeopleContextType | undefined>(undefined);

export const PeopleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastAction, setLastAction] = useState<{
    type: 'update' | 'delete';
    before: Person;
  } | null>(null);

  // Load people on app startup
  useEffect(() => {
    initializePeople();
  }, []);

  const initializePeople = async () => {
    try {
      setLoading(true);
      const stored = await personStorage.loadPeople();
      
      // If no data exists, load sample data
      if (stored.length === 0) {
        await personStorage.savePeople(SAMPLE_PEOPLE);
        setPeople(SAMPLE_PEOPLE);
      } else {
        setPeople(stored);
      }
    } catch (error) {
      console.error('Error initializing people:', error);
      setPeople([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPeople = async () => {
    try {
      setLoading(true);
      const stored = await personStorage.loadPeople();
      setPeople(stored);
    } catch (error) {
      console.error('Error loading people:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPerson = async (input: PersonInput): Promise<Person> => {
    try {
      const newPerson = await personStorage.addPerson(input);
      setPeople([...people, newPerson]);
      return newPerson;
    } catch (error) {
      console.error('Error adding person:', error);
      throw error;
    }
  };

  const updatePerson = async (
    id: string,
    updates: Partial<Person>
  ): Promise<Person> => {
    try {
      const updated = await personStorage.updatePerson(id, updates);
      setPeople(people.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (error) {
      console.error('Error updating person:', error);
      throw error;
    }
  };

  const deletePerson = async (id: string): Promise<void> => {
    try {
      const person = people.find(p => p.id === id);
      if (person) {
        setLastAction({ type: 'delete', before: person });
      }
      await personStorage.deletePerson(id);
      setPeople(people.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting person:', error);
      throw error;
    }
  };

  const markAsContacted = async (id: string): Promise<Person> => {
    try {
      const person = people.find(p => p.id === id);
      if (person) {
        setLastAction({ type: 'update', before: person });
      }
      const updated = await personStorage.markAsContacted(id);
      setPeople(people.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (error) {
      console.error('Error marking as contacted:', error);
      throw error;
    }
  };

  const undoLastAction = async (): Promise<void> => {
    try {
      if (!lastAction) {
        throw new Error('No action to undo');
      }

      if (lastAction.type === 'update') {
        await personStorage.updatePerson(lastAction.before.id, lastAction.before);
        setPeople(people.map((p) => (p.id === lastAction.before.id ? lastAction.before : p)));
      } else if (lastAction.type === 'delete') {
        // Re-add the deleted person
        await personStorage.updatePerson(lastAction.before.id, lastAction.before);
        setPeople([...people, lastAction.before]);
      }

      setLastAction(null);
    } catch (error) {
      console.error('Error undoing action:', error);
      throw error;
    }
  };

  const markAllAsContacted = async (): Promise<void> => {
    try {
      // Save state for potential undo (save first person before any changes)
      if (people.length > 0) {
        setLastAction({ type: 'update', before: people[0] });
      }

      // Mark all people as contacted
      for (const person of people) {
        await personStorage.markAsContacted(person.id);
      }

      // Reload all people to get updated state
      await loadPeople();
    } catch (error) {
      console.error('Error marking all as contacted:', error);
      throw error;
    }
  };

  const markCategoryAsContacted = async (category: string): Promise<void> => {
    try {
      const categoryPeople = people.filter((p) => p.category === category);
      
      if (categoryPeople.length === 0) {
        throw new Error(`No people found in category: ${category}`);
      }

      // Save state for potential undo
      setLastAction({ type: 'update', before: categoryPeople[0] });

      // Mark all people in category as contacted
      for (const person of categoryPeople) {
        await personStorage.markAsContacted(person.id);
      }

      // Reload all people to get updated state
      await loadPeople();
    } catch (error) {
      console.error('Error marking category as contacted:', error);
      throw error;
    }
  };

  const value: PeopleContextType = {
    people,
    loading,
    loadPeople,
    addPerson,
    updatePerson,
    deletePerson,
    markAsContacted,
    undoLastAction,
    markAllAsContacted,
    markCategoryAsContacted,
  };

  return (
    <PeopleContext.Provider value={value}>{children}</PeopleContext.Provider>
  );
};

export const usePeople = (): PeopleContextType => {
  const context = useContext(PeopleContext);
  if (context === undefined) {
    throw new Error('usePeople must be used within a PeopleProvider');
  }
  return context;
};
