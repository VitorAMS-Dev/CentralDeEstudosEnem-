import { QUESTION_BY_ID, SUBJECTS } from '../data/index.js';
import { pct, todayKey } from './utils.js';

export function computeStats(answers) {
  const bySubject = Object.fromEntries(SUBJECTS.map((s) => [s.key, { answered: 0, correct: 0 }]));
  const byTopic = {};
  let answered = 0;
  let correct = 0;
  for (const [id, a] of Object.entries(answers)) {
    const q = QUESTION_BY_ID[id];
    if (!q) continue;
    answered += 1;
    bySubject[q.subjectKey].answered += 1;
    const t = (byTopic[`${q.subjectKey}|${q.topic}`] ||= { subjectKey: q.subjectKey, topic: q.topic, answered: 0, correct: 0 });
    t.answered += 1;
    if (a.isCorrect) {
      correct += 1;
      bySubject[q.subjectKey].correct += 1;
      t.correct += 1;
    }
  }
  return { answered, correct, accuracy: pct(correct, answered), bySubject, byTopic };
}

export function computeStreak(studyDays) {
  const set = new Set(studyDays);
  const d = new Date();
  if (!set.has(todayKey(d))) d.setDate(d.getDate() - 1); // hoje ainda pode ser cumprido
  let streak = 0;
  while (set.has(todayKey(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function longestStreak(studyDays) {
  const days = [...new Set(studyDays)].sort();
  let best = 0;
  let run = 0;
  let prev = null;
  for (const k of days) {
    const cur = new Date(`${k}T12:00:00`);
    if (prev && Math.round((cur - prev) / 86400000) === 1) run += 1;
    else run = 1;
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}

export function questionsToday(answers) {
  const today = new Date().toLocaleDateString('pt-BR');
  return Object.values(answers).filter((a) => (a.date || a.timestamp) === today).length;
}
