/**
 * Utility functions for streak calculation, contact history, and related features
 */

import { Person } from '../types';
import { getContactStatus, getDaysSince } from './dateUtils';

/**
 * Calculate streak (consecutive on-time contacts)
 */
export const calculateStreak = (contactHistory?: string[], frequencyDays: number = 7): number => {
  if (!contactHistory || contactHistory.length === 0) return 0;

  // Sort in descending order (newest first)
  const sorted = [...contactHistory].sort().reverse();
  let streak = 0;
  let expectedDays = 0;

  for (let i = 0; i < sorted.length; i++) {
    const contactDate = new Date(sorted[i]);
    contactDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (i === 0) {
      // First contact should be within the frequency window
      const daysSince = Math.floor((today.getTime() - contactDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince <= frequencyDays) {
        streak = 1;
        expectedDays = frequencyDays;
      } else {
        return 0; // Streak broken
      }
    } else {
      // Each subsequent contact should be roughly `frequencyDays` apart
      const prevContactDate = new Date(sorted[i - 1]);
      prevContactDate.setHours(0, 0, 0, 0);
      
      const daysBetween = Math.floor((prevContactDate.getTime() - contactDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysBetween >= frequencyDays - 2 && daysBetween <= frequencyDays + 2) {
        streak++;
      } else {
        break; // Streak broken
      }
    }
  }

  return streak;
};

/**
 * Get days since last contact within the week
 */
export const getDaysSinceLastContactInWeek = (lastContactDate: string): number | null => {
  const daysSince = getDaysSince(lastContactDate);
  return daysSince <= 7 ? daysSince : null;
};

/**
 * Get days since last contact within this month
 */
export const getDaysSinceLastContactInMonth = (lastContactDate: string): number | null => {
  const daysSince = getDaysSince(lastContactDate);
  return daysSince <= 30 ? daysSince : null;
};

/**
 * Get all unique categories from people
 */
export const getAllCategories = (people: Person[]): string[] => {
  const categories = new Set<string>();
  people.forEach(p => {
    if (p.category) {
      categories.add(p.category);
    }
  });
  return Array.from(categories).sort();
};

/**
 * Get quick stats
 */
export const getQuickStats = (people: Person[]) => {
  let overducCount = 0;
  let contactedThisWeek = 0;
  let totalPeople = people.length;

  people.forEach(p => {
    const { isOverdue } = getContactStatus(p.lastContactDate, p.contactFrequencyDays);
    if (isOverdue) {
      overducCount++;
    }
    
    const daysSince = getDaysSince(p.lastContactDate);
    if (daysSince <= 7) {
      contactedThisWeek++;
    }
  });

  return {
    totalPeople,
    overdue: overducCount,
    contactedThisWeek,
    onTime: totalPeople - overducCount,
  };
};
