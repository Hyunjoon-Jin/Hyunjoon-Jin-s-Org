
import { AppState, User } from './types';

const USERS_KEY = 'gemini_diary_users_v1';
const CURRENT_USER_SESSION = 'gemini_diary_session';

export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const getSessionUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_SESSION);
  return data ? JSON.parse(data) : null;
};

export const setSessionUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_SESSION, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_SESSION);
  }
};

export const loadState = (userId: string): AppState => {
  const STORAGE_KEY = `gemini_diary_data_${userId}`;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return {
      slots: [],
      goals: [],
      subgoals: [],
      routines: [],
      people: [],
      deletedRoutineInstances: [],
      diary: {},
      meta: {},
      settings: {
        userName: '',
        defaultWorkStart: '09:00',
        defaultWorkEnd: '18:00',
        theme: 'light',
        language: 'ko'
      }
    };
  }
  const parsed = JSON.parse(saved);
  // Ensure backward compatibility
  if (!parsed.people) parsed.people = [];
  if (!parsed.deletedRoutineInstances) parsed.deletedRoutineInstances = [];
  return parsed;
};

export const saveState = (userId: string, state: AppState) => {
  const STORAGE_KEY = `gemini_diary_data_${userId}`;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};
