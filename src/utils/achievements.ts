import { Achievement } from '../stores/progressStore';

export const ACHIEVEMENTS: Record<string, Achievement> = {
  'traffic-signal-master': {
    id: 'traffic-signal-master',
    name: 'Traffic Signal Master',
    description: 'Complete all traffic signal lessons with 100% score',
    icon: '🚦',
  },
  'parking-expert': {
    id: 'parking-expert',
    name: 'Parking Expert',
    description: 'Master all parking techniques with perfect scores',
    icon: '🅿️',
  },
  'safety-hero': {
    id: 'safety-hero',
    name: 'Safety Hero',
    description: 'Complete 5 lessons without any safety violations',
    icon: '🛡️',
  },
  'highway-champion': {
    id: 'highway-champion',
    name: 'Highway Champion',
    description: 'Complete highway driving lesson and advanced techniques',
    icon: '🛣️',
  },
  'defensive-driver': {
    id: 'defensive-driver',
    name: 'Defensive Driver',
    description: 'Score 100% on blind spot awareness lesson',
    icon: '👁️',
  },
  'road-rules-master': {
    id: 'road-rules-master',
    name: 'Road Rules Master',
    description: 'Pass all road sign quizzes with perfect scores',
    icon: '📚',
  },
  'weather-warrior': {
    id: 'weather-warrior',
    name: 'Weather Warrior',
    description: 'Master both night and monsoon driving lessons',
    icon: '⛈️',
  },
  'emergency-expert': {
    id: 'emergency-expert',
    name: 'Emergency Expert',
    description: 'Handle all emergency response scenarios perfectly',
    icon: '🚨',
  },
  'roundabout-pro': {
    id: 'roundabout-pro',
    name: 'Roundabout Pro',
    description: 'Navigate roundabouts with perfect precision',
    icon: '🔄',
  },
  'student-driver': {
    id: 'student-driver',
    name: 'Student Driver',
    description: 'Complete your first lesson',
    icon: '🎓',
  },
  'dedicated-learner': {
    id: 'dedicated-learner',
    name: 'Dedicated Learner',
    description: 'Complete all 12 lessons',
    icon: '📖',
  },
  'speed-demon': {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete highway lesson at highest difficulty',
    icon: '⚡',
  },
};

export interface AchievementUnlockCriteria {
  check: (lessonScore: number, violations: number, collisions: number) => boolean;
  description: string;
}

export function checkAchievementUnlock(
  achievementId: string,
  lessonScore: number,
  violations: number = 0,
  collisions: number = 0
): boolean {
  switch (achievementId) {
    case 'traffic-signal-master':
      return lessonScore === 100;
    case 'parking-expert':
      return lessonScore === 100 && collisions === 0;
    case 'safety-hero':
      return violations === 0 && collisions === 0 && lessonScore >= 90;
    case 'defensive-driver':
      return lessonScore === 100;
    case 'road-rules-master':
      return lessonScore === 100;
    case 'student-driver':
      return lessonScore >= 70;
    case 'speed-demon':
      return lessonScore === 100 && violations === 0;
    default:
      return false;
  }
}

export function getAchievementProgress(
  achievementId: string,
  currentScore: number,
  currentViolations: number = 0,
  currentCollisions: number = 0
): { completed: boolean; progress: number } {
  switch (achievementId) {
    case 'traffic-signal-master':
    case 'defensive-driver':
    case 'road-rules-master':
      return {
        completed: currentScore >= 100,
        progress: Math.min(100, currentScore),
      };
    case 'parking-expert':
      const parkingProgress = (currentScore / 100) * 50 + (currentCollisions === 0 ? 50 : 0);
      return {
        completed: currentScore === 100 && currentCollisions === 0,
        progress: Math.min(100, parkingProgress),
      };
    case 'safety-hero':
      const safetyProgress =
        (currentScore / 100) * 30 +
        (currentViolations === 0 ? 35 : 0) +
        (currentCollisions === 0 ? 35 : 0);
      return {
        completed: currentViolations === 0 && currentCollisions === 0 && currentScore >= 90,
        progress: Math.min(100, safetyProgress),
      };
    case 'speed-demon':
      const speedProgress =
        (currentScore / 100) * 50 + (currentViolations === 0 ? 50 : 0);
      return {
        completed: currentScore === 100 && currentViolations === 0,
        progress: Math.min(100, speedProgress),
      };
    default:
      return { completed: false, progress: 0 };
  }
}

export function getAllAchievements(): Achievement[] {
  return Object.values(ACHIEVEMENTS);
}

export function getAchievement(achievementId: string): Achievement | undefined {
  return ACHIEVEMENTS[achievementId];
}
