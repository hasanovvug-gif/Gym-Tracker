import { WorkoutDay } from '../types';

export const WORKOUT_DAYS: WorkoutDay[] = [
  {
    id: 'monday',
    dayOfWeek: 1,
    name: 'day_chest_triceps',
    exercises: [
      { id: 'm1', name: 'ex_bench_press', sets: 3, reps: '12', defaultWeight: '45' },
      { id: 'm2', name: 'ex_incline_press', sets: 3, reps: '12', defaultWeight: '17.5' },
      { id: 'm3', name: 'ex_flyes', sets: 3, reps: '15', defaultWeight: '7.5' },
      { id: 'm4', name: 'ex_close_grip', sets: 3, reps: '12', defaultWeight: '30' },
      { id: 'm5', name: 'ex_triceps_pushdown', sets: 3, reps: '15', defaultWeight: '18' },
      { id: 'm6', name: 'ex_skull_crushers', sets: 3, reps: '12', defaultWeight: '15' },
    ],
  },
  {
    id: 'wednesday',
    dayOfWeek: 3,
    name: 'day_back_biceps',
    exercises: [
      { id: 'w1', name: 'ex_barbell_row', sets: 3, reps: '12', defaultWeight: '40' },
      { id: 'w2', name: 'ex_lat_pulldown', sets: 3, reps: '12', defaultWeight: '38' },
      { id: 'w3', name: 'ex_cable_row', sets: 3, reps: '12', defaultWeight: '38' },
      { id: 'w4', name: 'ex_hyperextension', sets: 3, reps: '15', defaultWeight: '0' }, // bodyweight
      { id: 'w5', name: 'ex_bicep_curl', sets: 3, reps: '12', defaultWeight: '15' },
      { id: 'w6', name: 'ex_alt_curl', sets: 3, reps: '12', defaultWeight: '7.5' },
    ],
  },
  {
    id: 'friday',
    dayOfWeek: 5,
    name: 'day_legs',
    exercises: [
      { id: 'f1', name: 'ex_squats', sets: 3, reps: '12', defaultWeight: '40' },
      { id: 'f2', name: 'ex_leg_press', sets: 3, reps: '12', defaultWeight: '50' },
      { id: 'f3', name: 'ex_leg_extensions', sets: 3, reps: '15', defaultWeight: '25' },
      { id: 'f4', name: 'ex_leg_curls', sets: 3, reps: '15', defaultWeight: '32' },
      { id: 'f5', name: 'ex_calf_raises', sets: 3, reps: '20', defaultWeight: '55' },
      { id: 'f6', name: 'ex_crunches', sets: 3, reps: '15', defaultWeight: '0' },
    ],
  },
  {
    id: 'sunday',
    dayOfWeek: 0,
    name: 'day_shoulders_abs',
    exercises: [
      { id: 's1', name: 'ex_seated_press', sets: 3, reps: '12', defaultWeight: '35' },
      { id: 's2', name: 'ex_lateral_raises', sets: 3, reps: '15', defaultWeight: '8' },
      { id: 's3', name: 'ex_upright_row', sets: 3, reps: '12', defaultWeight: '20' },
      { id: 's4', name: 'ex_rear_delt', sets: 3, reps: '15', defaultWeight: '7.5' },
      { id: 's5', name: 'ex_crunches', sets: 3, reps: '20', defaultWeight: '0' },
      { id: 's6', name: 'ex_leg_raises', sets: 3, reps: '15', defaultWeight: '0' },
      { id: 's7', name: 'ex_plank', sets: 3, reps: '40', defaultWeight: '0', isTimeBased: true },
    ],
  },
];
