/**
 * Utility functions for date and contact status calculations
 */

import { Person, PersonWithStatus } from '../types';

/**
 * Calculate days elapsed from a date to today
 */
export const getDaysSince = (dateString: string): number => {
  const targetDate = new Date(dateString);
  const today = new Date();
  
  // Reset time to midnight for accurate day calculation
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffMs = today.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

/**
 * Get contact status for a person
 */
export const getContactStatus = (
  lastContactDate: string,
  frequencyDays: number
): { daysOverdue: number; isOverdue: boolean; daysSinceLastContact: number } => {
  const daysSinceLastContact = getDaysSince(lastContactDate);
  const isOverdue = daysSinceLastContact >= frequencyDays;
  const daysOverdue = isOverdue ? daysSinceLastContact - frequencyDays : 0;

  return {
    daysSinceLastContact,
    isOverdue,
    daysOverdue,
  };
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Get today's date as ISO string
 */
export const getTodayISO = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Enhance person with computed contact status
 */
export const enrichPersonWithStatus = (person: Person): PersonWithStatus => {
  const { daysOverdue, isOverdue, daysSinceLastContact } = getContactStatus(
    person.lastContactDate,
    person.contactFrequencyDays
  );

  const interactionLevel = getInteractionLevel(person.interactionCount || 0);

  return {
    ...person,
    daysOverdue,
    isOverdue,
    daysSinceLastContact,
    interactionLevel,
    cardColor: getCardColor(interactionLevel),
    cardEmoji: getLevelEmoji(interactionLevel),
    streak: person.streak ?? 0,
  };
};

/**
 * Get interaction level (1-5) based on interaction count
 */
export const getInteractionLevel = (count: number = 0): number => {
  if (count >= 20) return 5;
  if (count >= 12) return 4;
  if (count >= 6) return 3;
  if (count >= 2) return 2;
  return 1;
};

/**
 * Get card color based on interaction level
 */
export const getCardColor = (level: number): string => {
  switch (level) {
    case 5:
      return '#f2c14e'; // Saffron
    case 4:
      return '#e9b872'; // Sand
    case 3:
      return '#9cd1c8'; // Seafoam
    case 2:
      return '#c8dfaf'; // Sage
    default:
      return '#f3b399'; // Apricot
  }
};

/**
 * Get emoji based on interaction level
 */
export const getLevelEmoji = (level: number): string => {
  const emojis = ['🌱', '🌿', '🌸', '🌺', '💫'];
  return emojis[level - 1] || '🌱';
};

/**
 * Sort people by overdue status (overdue first, then by days overdue)
 */
export const sortPeopleByOverdue = (people: Person[]): Person[] => {
  const enriched = people.map(enrichPersonWithStatus);
  
  return enriched
    .sort((a, b) => {
      // Overdue people first
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      
      // Among overdue, sort by most overdue first
      if (a.isOverdue && b.isOverdue) {
        return b.daysOverdue - a.daysOverdue;
      }
      
      // Among not overdue, sort by days since contact (longest first)
      return b.daysSinceLastContact - a.daysSinceLastContact;
    })
    .map(({ daysOverdue, isOverdue, daysSinceLastContact, ...person }) => person);
};
