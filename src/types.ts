export type MedicationCategory = 'hypertension' | 'diabetes' | 'lipid' | 'coronary' | 'copd' | 'other';

export interface Medication {
  id: string;
  name: string;
  category: MedicationCategory;
  dosage: string;
  unit: string;
  frequency: number;
  times: string[];
  totalStock: number;
  remainingStock: number;
  updatedAt: number;
  stealthTitle: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  timestamp: number;
  status: 'taken' | 'skipped';
  feeling?: 'good' | 'neutral' | 'bad';
  feelingTags?: string[];
  note?: string;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  date: number;
}

export interface CalendarTodo {
  id: string;
  date: number; // timestamp for the day
  title: string;
  type: 'medical' | 'other';
  completed: boolean;
}

export interface UserPreferences {
  stealthMode: boolean;
  workReminderEnabled: boolean;
  workReminderTime: string;
  diseaseTags: MedicationCategory[];
  streakCount: number;
  unlockedAchievements: Achievement[];
  todos?: CalendarTodo[];
  isFirstVisit?: boolean;
  unlockedGames?: string[];
}
