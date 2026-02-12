/**
 * Type definitions for the Human Directory app
 */

export interface Person {
  id: string;
  name: string;
  notes: string;
  phone?: string;
  email?: string;
  lastContactDate: string; // ISO date string
  contactFrequencyDays: number;
  createdAt: string; // ISO date string
  interactionCount?: number; // Times marked as contacted
  contactHistory?: string[]; // Array of ISO date strings of contacts
  category?: string; // "Friends", "Family", "Work", "Mentors", etc.
  streak?: number; // Current consecutive on-time contacts
}

export interface PersonInput {
  name: string;
  notes: string;
  contactFrequencyDays: number;
  category?: string;
  phone?: string;
  email?: string;
}

export interface PersonWithStatus extends Person {
  daysOverdue: number;
  isOverdue: boolean;
  daysSinceLastContact: number;
  interactionLevel: number; // 1-5 based on interaction count
  cardColor: string; // Dynamic color based on level
  cardEmoji: string; // Emoji indicator
  streak: number; // Consecutive on-time contacts
}

export interface PeopleContextType {
  people: Person[];
  loading: boolean;
  loadPeople: () => Promise<void>;
  addPerson: (person: PersonInput) => Promise<Person>;
  updatePerson: (id: string, updates: Partial<Person>) => Promise<Person>;
  deletePerson: (id: string) => Promise<void>;
  markAsContacted: (id: string) => Promise<Person>;
  undoLastAction: () => Promise<void>;
  markAllAsContacted: () => Promise<void>;
  markCategoryAsContacted: (category: string) => Promise<void>;
  lastAction?: { type: string; data: Person };
}

export type DarkModeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => Promise<void>;
};

export type FilterType = 'all' | 'overdue' | 'week' | 'month';
