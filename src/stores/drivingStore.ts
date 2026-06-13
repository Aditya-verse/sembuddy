import { create } from 'zustand';

export interface DrivingState {
  vehiclePosition: { x: number; y: number; z: number };
  vehicleRotation: { x: number; y: number; z: number };
  vehicleVelocity: number;
  steering: number;
  throttle: number;
  brake: number;
  currentLesson: string | null;
  lessonStartTime: number | null;
  score: number;
  isPlaying: boolean;
  isPaused: boolean;
  collisions: number;
  violations: string[];
  cameraMode: 'first-person' | 'third-person' | 'top-down';

  // Actions
  setVehiclePosition: (pos: { x: number; y: number; z: number }) => void;
  setVehicleRotation: (rot: { x: number; y: number; z: number }) => void;
  setVehicleVelocity: (velocity: number) => void;
  setSteering: (steering: number) => void;
  setThrottle: (throttle: number) => void;
  setBrake: (brake: number) => void;
  setCurrentLesson: (lesson: string | null) => void;
  startLesson: () => void;
  pauseLesson: () => void;
  resumeLesson: () => void;
  endLesson: () => void;
  addCollision: () => void;
  addViolation: (violation: string) => void;
  setCameraMode: (mode: 'first-person' | 'third-person' | 'top-down') => void;
  addScore: (points: number) => void;
  reset: () => void;
}

const initialState = {
  vehiclePosition: { x: 0, y: 0, z: 0 },
  vehicleRotation: { x: 0, y: 0, z: 0 },
  vehicleVelocity: 0,
  steering: 0,
  throttle: 0,
  brake: 0,
  currentLesson: null,
  lessonStartTime: null,
  score: 0,
  isPlaying: false,
  isPaused: false,
  collisions: 0,
  violations: [],
  cameraMode: 'third-person' as const,
};

export const useDrivingStore = create<DrivingState>((set) => ({
  ...initialState,
  
  setVehiclePosition: (pos) => set({ vehiclePosition: pos }),
  setVehicleRotation: (rot) => set({ vehicleRotation: rot }),
  setVehicleVelocity: (velocity) => set({ vehicleVelocity: velocity }),
  setSteering: (steering) => set({ steering }),
  setThrottle: (throttle) => set({ throttle }),
  setBrake: (brake) => set({ brake }),
  
  setCurrentLesson: (lesson) => set({ currentLesson: lesson }),
  
  startLesson: () => set({
    isPlaying: true,
    isPaused: false,
    lessonStartTime: Date.now(),
    score: 0,
    collisions: 0,
    violations: [],
  }),
  
  pauseLesson: () => set({ isPaused: true }),
  resumeLesson: () => set({ isPaused: false }),
  
  endLesson: () => set({
    isPlaying: false,
    isPaused: false,
    currentLesson: null,
  }),
  
  addCollision: () => set((state) => ({
    collisions: state.collisions + 1,
    score: Math.max(0, state.score - 10),
  })),
  
  addViolation: (violation) => set((state) => ({
    violations: [...state.violations, violation],
    score: Math.max(0, state.score - 5),
  })),
  
  setCameraMode: (mode) => set({ cameraMode: mode }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  
  reset: () => set(initialState),
}));
