import { create } from 'zustand';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export interface LessonProgress {
  lessonId: string;
  name: string;
  completed: boolean;
  highScore: number;
  timeSpent: number; // in seconds
  quizPassed: boolean;
  lastPlayed?: number;
}

export interface ProgressState {
  lessons: Map<string, LessonProgress>;
  achievements: Map<string, Achievement>;
  totalSafetyScore: number;
  lessonCount: number;
  achievementCount: number;

  // Actions
  addLesson: (lesson: LessonProgress) => void;
  updateLessonProgress: (lessonId: string, progress: Partial<LessonProgress>) => void;
  markLessonComplete: (lessonId: string, score: number, timeSpent: number) => void;
  unlockAchievement: (achievement: Achievement) => void;
  getLessonProgress: (lessonId: string) => LessonProgress | undefined;
  getCompletedLessons: () => LessonProgress[];
  calculateSafetyScore: () => number;
  reset: () => void;
}

const defaultAchievements: Achievement[] = [
  { id: 'traffic-signal-master', name: 'Traffic Signal Master', description: 'Complete all traffic signal lessons', icon: '🚦' },
  { id: 'parking-expert', name: 'Parking Expert', description: 'Master all parking techniques', icon: '🅿️' },
  { id: 'safety-hero', name: 'Safety Hero', description: 'Complete 5 lessons without violations', icon: '🛡️' },
  { id: 'highway-champion', name: 'Highway Champion', description: 'Complete highway driving lesson', icon: '🛣️' },
  { id: 'defensive-driver', name: 'Defensive Driver', description: 'Score 100% on blind spot lesson', icon: '👁️' },
  { id: 'road-rules-master', name: 'Road Rules Master', description: 'Pass all road sign quizzes', icon: '📚' },
];

export const useProgressStore = create<ProgressState>((set, get) => ({
  lessons: new Map(),
  achievements: new Map(),
  totalSafetyScore: 0,
  lessonCount: 0,
  achievementCount: 0,

  addLesson: (lesson) => set((state) => {
    const newLessons = new Map(state.lessons);
    newLessons.set(lesson.lessonId, lesson);
    return {
      lessons: newLessons,
      lessonCount: newLessons.size,
    };
  }),

  updateLessonProgress: (lessonId, progress) => set((state) => {
    const newLessons = new Map(state.lessons);
    const existing = newLessons.get(lessonId);
    if (existing) {
      newLessons.set(lessonId, { ...existing, ...progress });
    }
    return { lessons: newLessons };
  }),

  markLessonComplete: (lessonId, score, timeSpent) => set((state) => {
    const newLessons = new Map(state.lessons);
    const existing = newLessons.get(lessonId);
    if (existing) {
      newLessons.set(lessonId, {
        ...existing,
        completed: true,
        highScore: Math.max(existing.highScore, score),
        timeSpent: existing.timeSpent + timeSpent,
        lastPlayed: Date.now(),
      });
    }
    return {
      lessons: newLessons,
      totalSafetyScore: get().calculateSafetyScore(),
    };
  }),

  unlockAchievement: (achievement) => set((state) => {
    const newAchievements = new Map(state.achievements);
    if (!newAchievements.has(achievement.id)) {
      newAchievements.set(achievement.id, {
        ...achievement,
        unlockedAt: Date.now(),
      });
    }
    return {
      achievements: newAchievements,
      achievementCount: newAchievements.size,
    };
  }),

  getLessonProgress: (lessonId) => {
    return get().lessons.get(lessonId);
  },

  getCompletedLessons: () => {
    return Array.from(get().lessons.values()).filter(l => l.completed);
  },

  calculateSafetyScore: () => {
    const lessons = Array.from(get().lessons.values());
    if (lessons.length === 0) return 0;
    const totalScore = lessons.reduce((sum, lesson) => sum + lesson.highScore, 0);
    return Math.round(totalScore / lessons.length);
  },

  reset: () => set({
    lessons: new Map(),
    achievements: new Map(),
    totalSafetyScore: 0,
    lessonCount: 0,
    achievementCount: 0,
  }),
}));
