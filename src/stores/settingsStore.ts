import { create } from 'zustand';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface SettingsState {
  masterVolume: number; // 0-100
  voiceVolume: number; // 0-100
  sfxVolume: number; // 0-100
  difficulty: Difficulty;
  subtitlesEnabled: boolean;
  instructorVisible: boolean;
  performanceMode: boolean;
  targetFPS: number;

  // Actions
  setMasterVolume: (volume: number) => void;
  setVoiceVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  toggleSubtitles: () => void;
  toggleInstructorVisible: () => void;
  setPerformanceMode: (enabled: boolean) => void;
  setTargetFPS: (fps: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  masterVolume: 80,
  voiceVolume: 100,
  sfxVolume: 80,
  difficulty: 'medium',
  subtitlesEnabled: true,
  instructorVisible: true,
  performanceMode: false,
  targetFPS: 60,

  setMasterVolume: (volume) => set({
    masterVolume: Math.min(100, Math.max(0, volume)),
  }),

  setVoiceVolume: (volume) => set({
    voiceVolume: Math.min(100, Math.max(0, volume)),
  }),

  setSfxVolume: (volume) => set({
    sfxVolume: Math.min(100, Math.max(0, volume)),
  }),

  setDifficulty: (difficulty) => set({ difficulty }),

  toggleSubtitles: () => set((state) => ({
    subtitlesEnabled: !state.subtitlesEnabled,
  })),

  toggleInstructorVisible: () => set((state) => ({
    instructorVisible: !state.instructorVisible,
  })),

  setPerformanceMode: (enabled) => set({
    performanceMode: enabled,
    targetFPS: enabled ? 30 : 60,
  }),

  setTargetFPS: (fps) => set({ targetFPS: fps }),
}));
