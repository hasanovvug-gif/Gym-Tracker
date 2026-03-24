export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  defaultWeight: string;
  isTimeBased?: boolean;
};

export type WorkoutDay = {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, 3 = Wednesday, 5 = Friday
  name: string;
  exercises: Exercise[];
};

export type ExerciseLog = {
  exerciseId: string;
  weight: string;
  setsCompleted: number;
  skipped: boolean;
};

export type WorkoutSession = {
  id: string;
  date: string; // ISO string
  dayId: string;
  durationSeconds: number;
  exercises: ExerciseLog[];
  totalVolume: number;
};
