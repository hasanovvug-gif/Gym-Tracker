import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExerciseLog, WorkoutSession } from '../types';

export type AIMessage = {
  role: 'user' | 'model';
  text: string;
};

interface WorkoutState {
  history: WorkoutSession[];
  
  // Active Workout State
  activeWorkout: {
    dayId: string;
    startTime: number;
    logs: Record<string, ExerciseLog>; // key: exerciseId
  } | null;

  // AI Assistant State
  aiMessages: AIMessage[];
  isAiAssistantOpen: boolean;

  startWorkout: (dayId: string) => void;
  updateExerciseLog: (exerciseId: string, log: Partial<ExerciseLog>) => void;
  finishWorkout: (durationSeconds: number, totalVolume: number) => void;
  cancelWorkout: () => void;
  
  // AI Actions
  addAiMessage: (msg: AIMessage) => void;
  setAiAssistantOpen: (isOpen: boolean) => void;
  clearAiMessages: () => void;
  
  // Helper to get last weight
  getLastWeight: (exerciseId: string) => string | null;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      history: [],
      activeWorkout: null,
      aiMessages: [],
      isAiAssistantOpen: false,

      startWorkout: (dayId) => {
        set({
          activeWorkout: {
            dayId,
            startTime: Date.now(),
            logs: {},
          },
        });
      },

      updateExerciseLog: (exerciseId, logUpdate) => {
        set((state) => {
          if (!state.activeWorkout) return state;
          
          const currentLog = state.activeWorkout.logs[exerciseId] || {
            exerciseId,
            weight: get().getLastWeight(exerciseId) || '0',
            setsCompleted: 0,
            skipped: false,
          };

          return {
            activeWorkout: {
              ...state.activeWorkout,
              logs: {
                ...state.activeWorkout.logs,
                [exerciseId]: { ...currentLog, ...logUpdate },
              },
            },
          };
        });
      },

      finishWorkout: (durationSeconds, totalVolume) => {
        set((state) => {
          if (!state.activeWorkout) return state;

          const newSession: WorkoutSession = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            dayId: state.activeWorkout.dayId,
            durationSeconds,
            exercises: Object.values(state.activeWorkout.logs),
            totalVolume,
          };

          return {
            history: [newSession, ...state.history],
            activeWorkout: null,
          };
        });
      },

      cancelWorkout: () => {
        set({ activeWorkout: null });
      },

      addAiMessage: (msg) => {
        set((state) => ({ aiMessages: [...state.aiMessages, msg] }));
      },

      setAiAssistantOpen: (isOpen) => {
        set({ isAiAssistantOpen: isOpen });
      },

      clearAiMessages: () => {
        set({ aiMessages: [] });
      },

      getLastWeight: (exerciseId) => {
        const { history } = get();
        for (const session of history) {
          const log = session.exercises.find((e) => e.exerciseId === exerciseId);
          if (log && log.weight && log.weight !== '0') {
            return log.weight;
          }
        }
        return null;
      },
    }),
    {
      name: 'gym-tracker-storage',
    }
  )
);
