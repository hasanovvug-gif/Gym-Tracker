import { GoogleGenAI } from '@google/genai';
import { WorkoutSession } from '../types';
import { WORKOUT_DAYS } from '../data/workoutData';

// Initialize Gemini API
const getAi = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateWorkoutSummary(session: WorkoutSession, previousHistory: WorkoutSession[], language: string = 'uk') {
  try {
    const ai = getAi();
    const day = WORKOUT_DAYS.find(d => d.id === session.dayId);
    
    // Find previous session of the same day
    const prevSession = previousHistory.find(s => s.dayId === session.dayId && s.id !== session.id);
    
    let prompt = `Analyze the completed workout of the user (goal: muscle mass gain, weight 77 kg). Please respond in ${language === 'uk' ? 'Ukrainian' : language === 'ru' ? 'Russian' : 'English'}.\n`;
    prompt += `Workout: ${day?.name}.\n`;
    prompt += `Time: ${Math.floor(session.durationSeconds / 60)} minutes.\n`;
    prompt += `Total volume: ${session.totalVolume} kg.\n`;
    
    const skipped = session.exercises.filter(e => e.skipped);
    if (skipped.length > 0) {
      const skippedNames = skipped.map(s => day?.exercises.find(e => e.id === s.exerciseId)?.name).join(', ');
      prompt += `Skipped exercises: ${skippedNames}.\n`;
    }

    if (prevSession) {
      prompt += `In the previous same workout, the time was ${Math.floor(prevSession.durationSeconds / 60)} minutes, and the volume was ${prevSession.totalVolume} kg.\n`;
    }

    prompt += `\nWrite a short, motivating report (maximum 3-4 sentences). Praise for progress (if any), comment on time or skips (if any). Address the user as "you". Use emojis. Do not use markdown asterisks for bold text, just write plain text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || (language === 'uk' ? 'Відмінне тренування! Продовжуй в тому ж дусі 💪' : language === 'ru' ? 'Отличная тренировка! Продолжай в том же духе 💪' : 'Great workout! Keep it up 💪');
  } catch (error) {
    console.error('AI Summary Error:', error);
    return language === 'uk' ? 'Відмінне тренування! Продовжуй в тому ж дусі 💪' : language === 'ru' ? 'Отличная тренировка! Продолжай в том же духе 💪' : 'Great workout! Keep it up 💪';
  }
}

export async function generatePreWorkoutAdvice(dayId: string, history: WorkoutSession[], language: string = 'uk') {
  try {
    const ai = getAi();
    const day = WORKOUT_DAYS.find(d => d.id === dayId);
    const prevSession = history.find(s => s.dayId === dayId);

    if (!prevSession) {
      return language === 'uk' ? `Сьогодні ${day?.name}. Це твоє перше тренування за цією програмою. Почни з комфортних ваг, щоб поставити техніку! 🎯` : language === 'ru' ? `Сегодня ${day?.name}. Это твоя первая тренировка по этой программе. Начни с комфортных весов, чтобы поставить технику! 🎯` : `Today is ${day?.name}. This is your first workout on this program. Start with comfortable weights to get the technique right! 🎯`;
    }

    let prompt = `The user is about to start a workout: ${day?.name}. Please respond in ${language === 'uk' ? 'Ukrainian' : language === 'ru' ? 'Russian' : 'English'}.\n`;
    prompt += `In the previous same workout, they lifted ${prevSession.totalVolume} kg in ${Math.floor(prevSession.durationSeconds / 60)} minutes.\n`;
    prompt += `Give them ONE short piece of advice (1-2 sentences) before starting. For example, advise them to slightly increase the weight in a basic exercise or watch their rest time. Address the user as "you", use emojis. No markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || (language === 'uk' ? 'Гарного тренування! Слідкуй за технікою та диханням 🏋️‍♂️' : language === 'ru' ? 'Хорошей тренировки! Следи за техникой и дыханием 🏋️‍♂️' : 'Have a good workout! Watch your technique and breathing 🏋️‍♂️');
  } catch (error) {
    console.error('AI Advice Error:', error);
    return language === 'uk' ? 'Гарного тренування! Слідкуй за технікою та диханням 🏋️‍♂️' : language === 'ru' ? 'Хорошей тренировки! Следи за техникой и дыханием 🏋️‍♂️' : 'Have a good workout! Watch your technique and breathing 🏋️‍♂️';
  }
}

export async function generateWeeklyReport(history: WorkoutSession[], language: string = 'uk') {
  try {
    const ai = getAi();
    
    // Get last 7 days of workouts
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentWorkouts = history.filter(s => new Date(s.date) >= oneWeekAgo);
    
    if (recentWorkouts.length === 0) {
      return language === 'uk' ? "За останні 7 днів тренувань не було. Саме час почати! 🚀" : language === 'ru' ? "За последние 7 дней тренировок не было. Самое время начать! 🚀" : "There were no workouts in the last 7 days. It's time to start! 🚀";
    }

    const totalVolume = recentWorkouts.reduce((sum, s) => sum + s.totalVolume, 0);
    const totalMinutes = Math.floor(recentWorkouts.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);

    let prompt = `Make a weekly review of the user's workouts. Please respond in ${language === 'uk' ? 'Ukrainian' : language === 'ru' ? 'Russian' : 'English'}.\n`;
    prompt += `In the last 7 days, they completed ${recentWorkouts.length} workouts.\n`;
    prompt += `Total weight lifted: ${totalVolume} kg.\n`;
    prompt += `Total time: ${totalMinutes} minutes.\n`;
    prompt += `Write a motivating analysis (3-4 sentences). Note their efforts, give advice for the next week (e.g., about sleep, nutrition, or progressive overload). Address the user as "you", use emojis. No markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || (language === 'uk' ? 'Відмінний тиждень! Ти добре попрацював. Не забувай про відновлення та якісне харчування 🥩💤' : language === 'ru' ? 'Отличная неделя! Ты хорошо поработал. Не забывай про восстановление и качественное питание 🥩💤' : 'Great week! You did a good job. Do not forget about recovery and quality nutrition 🥩💤');
  } catch (error) {
    console.error('AI Weekly Report Error:', error);
    return language === 'uk' ? 'Відмінний тиждень! Ти добре попрацював. Не забувай про відновлення та якісне харчування 🥩💤' : language === 'ru' ? 'Отличная неделя! Ты хорошо поработал. Не забывай про восстановление и качественное питание 🥩💤' : 'Great week! You did a good job. Do not forget about recovery and quality nutrition 🥩💤';
  }
}
