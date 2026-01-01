
export type SlotType = 'plan' | 'actual';
export type Language = 'ko' | 'en';
export type GoalStatus = 'active' | 'completed' | 'on_hold';

export type GoalType = 
  | 'Career' | 'Health' | 'Study' | 'Finance' | 'Hobby' 
  | 'Personal' | 'Networking' | 'Learning' | 'Lifestyle' 
  | 'Travel' | 'Project';

export type ScheduleCategory = 
  | 'Work' | 'Health' | 'Study' | 'Personal' | 'General'
  | 'Meeting' | 'Focus' | 'Break' | 'Logistics' | 'Social' | 'Growth';

export interface User {
  id: string;
  userId: string;
  password: string;
  name: string;
}

export interface ScheduleSlot {
  id: string;
  date: string;
  type: SlotType;
  start: string;
  end: string;
  content: string;
  category: ScheduleCategory;
  importance: 'low' | 'medium' | 'high' | 'appointment';
  goalId?: string;
  isRoutine?: boolean;
  attendees?: string[]; // 지인 ID 혹은 이름
  isMeeting?: boolean;  // 회의 여부
}

export interface Person {
  id: string;
  name: string;
  relation: 'family' | 'friend' | 'relative' | 'colleague' | 'other';
  phone: string;
  birthday: string;
  address: string;
  notes: string;
  tags: string[]; 
  lastContactDate?: string; 
  company?: string; 
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  linkedRoutineId?: string;
  suggestedAsRoutine?: boolean;
}

export interface SubGoal {
  id: string;
  pid: string; // 부모 Goal ID
  title: string;
  date: string; // 달성 목표 일자
  tasks: Task[];
}

export interface Goal {
  id: string;
  category: GoalType;
  title: string;
  start: string;
  end: string;
  description: string;
  status: GoalStatus;
  priority: 'low' | 'medium' | 'high';
}

export interface Routine {
  id: string;
  title: string;
  category: ScheduleCategory;
  start: string;
  end: string;
  cycle: 'daily' | 'weekday' | 'weekend' | 'custom';
  days: number[]; // 0(Sun) - 6(Sat)
  startDate: string;
  endDate?: string; // 추가된 종료일
  goalId?: string; 
}

export interface DailyLog {
  mood: number;
  energy: number;
  text: string;
  tags: string[];
}

export interface DayMeta {
  type: 'holiday' | 'vacation' | 'normal';
  customWorkStart?: string;
  customWorkEnd?: string;
  noWork?: boolean; 
}

export interface AppState {
  slots: ScheduleSlot[];
  goals: Goal[];
  subgoals: SubGoal[];
  routines: Routine[];
  people: Person[]; 
  deletedRoutineInstances: string[]; 
  diary: Record<string, DailyLog>;
  meta: Record<string, DayMeta>;
  settings: {
    userName: string;
    defaultWorkStart: string;
    defaultWorkEnd: string;
    theme: 'light' | 'dark';
    language: Language;
  };
}

export const translations = {
  ko: {
    calendar: '캘린더',
    schedule: '스케줄',
    goals: '목표 관리',
    routines: '루틴 습관',
    people: '인맥 관리',
    log: '데일리 로그',
    ai: 'AI 코치',
    settings: '설정',
    focus: '몰입 타이머',
    dashboard: '종합 대시보드',
    workStart: '업무 시작',
    workEnd: '업무 종료',
    userName: '사용자 이름',
    theme: '테마',
    lang: '언어',
    export: '데이터 내보내기',
    import: '데이터 가져오기',
    logout: '로그아웃',
    plan: '계획',
    actual: '실행',
    save: '저장',
    cancel: '취소',
    delete: '삭제',
    mood: '기분',
    energy: '에너지',
    review: '오늘의 회고',
    efficiency: '몰입 효율'
  },
  en: {
    calendar: 'Calendar',
    schedule: 'Schedule',
    goals: 'Goals',
    routines: 'Routines',
    people: 'Contacts',
    log: 'Daily Log',
    ai: 'AI Coach',
    settings: 'Settings',
    focus: 'Focus Timer',
    dashboard: 'Dashboard',
    workStart: 'Shift Start',
    workEnd: 'Shift End',
    userName: 'User Name',
    theme: 'Theme',
    lang: 'Language',
    export: 'Export Data',
    import: 'Import Data',
    logout: 'Logout',
    plan: 'Plan',
    actual: 'Actual',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    mood: 'Mood',
    energy: 'Energy',
    review: 'Review',
    efficiency: 'Efficiency'
  }
};
