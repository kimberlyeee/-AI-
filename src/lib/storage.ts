import { Medication, MedicationLog, UserPreferences } from '../types';

const STORAGE_KEYS = {
  MEDICATIONS: 'medymate_medications',
  LOGS: 'medymate_logs',
  PREFS: 'medymate_prefs'
};

export const storage = {
  getMedications: (): Medication[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    return data ? JSON.parse(data) : [];
  },
  saveMedications: (meds: Medication[]) => {
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(meds));
  },
  getLogs: (): MedicationLog[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  },
  saveLogs: (logs: MedicationLog[]) => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  },
  getPrefs: (): UserPreferences => {
    const data = localStorage.getItem(STORAGE_KEYS.PREFS);
    const defaults: UserPreferences = {
      stealthMode: false,
      workReminderEnabled: true,
      workReminderTime: '08:00',
      diseaseTags: [],
      streakCount: 0,
      unlockedAchievements: [],
      todos: [],
      isFirstVisit: true,
      unlockedGames: []
    };
    if (!data) return defaults;
    try {
      return { ...defaults, ...JSON.parse(data) };
    } catch (e) {
      return defaults;
    }
  },
  savePrefs: (prefs: UserPreferences) => {
    localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(prefs));
  }
};
