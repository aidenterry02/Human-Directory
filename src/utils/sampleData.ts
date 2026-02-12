/**
 * Sample data for development and testing
 */

import { Person } from '../types';
import { getTodayISO } from './dateUtils';

const today = getTodayISO();

// Helper to create a date string X days ago
const daysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

export const SAMPLE_PEOPLE: Person[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    notes: 'College roommate, loves hiking and coffee',
    lastContactDate: daysAgo(45),
    contactFrequencyDays: 30,
    createdAt: daysAgo(120),
  },
  {
    id: '2',
    name: 'Bob Smith',
    notes: 'Co-worker from previous job, catch up occasionally',
    lastContactDate: daysAgo(8),
    contactFrequencyDays: 14,
    createdAt: daysAgo(200),
  },
  {
    id: '3',
    name: 'Carol Davis',
    notes: 'Mentor and friend, very important connection',
    lastContactDate: daysAgo(60),
    contactFrequencyDays: 21,
    createdAt: daysAgo(300),
  },
  {
    id: '4',
    name: 'David Wilson',
    notes: 'Childhood friend, lives far but we stay connected',
    lastContactDate: daysAgo(3),
    contactFrequencyDays: 7,
    createdAt: daysAgo(400),
  },
  {
    id: '5',
    name: 'Emma Martinez',
    notes: 'Book club organizer, see her monthly',
    lastContactDate: daysAgo(35),
    contactFrequencyDays: 30,
    createdAt: daysAgo(150),
  },
  {
    id: '6',
    name: 'Frank Chen',
    notes: 'Tennis buddy, play every other week',
    lastContactDate: daysAgo(25),
    contactFrequencyDays: 14,
    createdAt: daysAgo(180),
  },
  {
    id: '7',
    name: 'Grace Lee',
    notes: 'Sister, check in every week',
    lastContactDate: daysAgo(12),
    contactFrequencyDays: 7,
    createdAt: daysAgo(500),
  },
  {
    id: '8',
    name: 'Henry Taylor',
    notes: 'Fantasy football league friend',
    lastContactDate: daysAgo(90),
    contactFrequencyDays: 60,
    createdAt: daysAgo(250),
  },
];
