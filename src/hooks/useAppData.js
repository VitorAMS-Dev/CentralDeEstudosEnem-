import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState } from './usePersistentState';
import { migrateLegacyTrails, TRAILS } from '../data/trails';
import { ACHIEVEMENTS } from '../data/achievements';
import { computeStats, computeStreak, longestStreak, questionsToday } from '../lib/stats';
import { DAYS, todayKey, uid } from '../lib/utils';
import { useSync } from '../context/SyncContext';

export const DEFAULT_THEME = 'Desafios para a valorização de comunidades e povos tradicionais no Brasil';

const DEFAULT_PLAN = {
  Segunda: ['Matemática (porcentagem) + exercícios'],
  Terça: ['Física (termodinâmica) + redação'],
  Quarta: ['História (Império) + Biologia'],
  Quinta: ['Língua Portuguesa + questões'],
  Sexta: ['Química + revisão semanal'],
  Sábado: ['Simulado ENEM (45 questões)'],
  Domingo: ['Descanso'],
};

function initialPlanner() {
  let source = DEFAULT_PLAN;
  try {
    const raw = localStorage.getItem('enem_weekly_plan'); // formato antigo: texto livre por dia
    if (raw) {
      const old = JSON.parse(raw);
      source = Object.fromEntries(
        DAYS.map((d) => [d, String(old[d] || '').split('\n').map((s) => s.trim()).filter(Boolean)])
      );
    }
  } catch {
    /* usa o padrão */
  }
  return Object.fromEntries(DAYS.map((d) => [d, (source[d] || []).map((text) => ({ id: uid(), text, done: false }))]));
}

export function useAppData() {
  const sync = useSync();
  const [profile, setProfile] = usePersistentState('profile', { name: '', dailyGoal: 10, course: '' });
  const [answers, setAnswers] = usePersistentState('answers', {});
  const [simulados, setSimulados] = usePersistentState('simulados', []);
  const [trailProgress, setTrailProgress] = usePersistentState('trailProgress', migrateLegacyTrails);
  const [essays, setEssays] = usePersistentState('essays', []);
  const [essayDraft, setEssayDraft] = usePersistentState('essayDraft', { title: DEFAULT_THEME, text: '' });
  const [planner, setPlanner] = usePersistentState('planner', initialPlanner);
  const [studyDays, setStudyDays] = usePersistentState('studyDays', []);
  const [unlocked, setUnlocked] = usePersistentState('achievements', {});
  const [counters, setCounters] = usePersistentState('counters', { pomodoros: 0 });
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, tone = 'info') => {
    const id = uid();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const markStudy = useCallback(() => {
    const key = todayKey();
    setStudyDays((prev) => (prev.includes(key) ? prev : [...prev, key].slice(-400)));
  }, [setStudyDays]);

  const answerQuestion = useCallback(
    (q, optionId) => {
      setAnswers((prev) => ({
        ...prev,
        [q.id]: {
          selected: optionId,
          isCorrect: optionId === q.correctAnswer,
          date: new Date().toLocaleDateString('pt-BR'),
          ts: Date.now(),
          attempts: (prev[q.id]?.attempts || 0) + 1,
        },
      }));
      markStudy();
    },
    [setAnswers, markStudy]
  );

  const resetQuestion = useCallback(
    (id) =>
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      }),
    [setAnswers]
  );

  const finishSimulado = useCallback(
    (result, questions, selections) => {
      setSimulados((prev) => [result, ...prev].slice(0, 50));
      setAnswers((prev) => {
        const next = { ...prev };
        const date = new Date().toLocaleDateString('pt-BR');
        for (const q of questions) {
          const sel = selections[q.id];
          if (!sel) continue;
          next[q.id] = {
            selected: sel,
            isCorrect: sel === q.correctAnswer,
            date,
            ts: Date.now(),
            attempts: (prev[q.id]?.attempts || 0) + 1,
            source: 'simulado',
          };
        }
        return next;
      });
      markStudy();
    },
    [setSimulados, setAnswers, markStudy]
  );

  const toggleTopic = useCallback(
    (topicId, field) => {
      setTrailProgress((prev) => {
        const cur = prev[topicId] || { done: false, reviewed: false };
        return { ...prev, [topicId]: { ...cur, [field]: !cur[field] } };
      });
      markStudy();
    },
    [setTrailProgress, markStudy]
  );

  const saveEssay = useCallback(() => {
    const text = essayDraft.text.trim();
    if (!text) return false;
    setEssays((prev) => [
      {
        id: uid(),
        title: essayDraft.title,
        text,
        words: text.split(/\s+/).length,
        lines: text.split('\n').length,
        date: new Date().toLocaleDateString('pt-BR'),
      },
      ...prev,
    ]);
    markStudy();
    return true;
  }, [essayDraft, setEssays, markStudy]);

  const countPomodoro = useCallback(() => {
    setCounters((c) => ({ ...c, pomodoros: (c.pomodoros || 0) + 1 }));
    markStudy();
  }, [setCounters, markStudy]);

  // Estatísticas derivadas
  const stats = useMemo(() => computeStats(answers), [answers]);
  const streak = useMemo(() => computeStreak(studyDays), [studyDays]);
  const best = useMemo(() => longestStreak(studyDays), [studyDays]);
  const today = useMemo(() => questionsToday(answers), [answers]);
  const trailCompleted = useMemo(
    () => TRAILS.some((t) => t.topics.every((x) => trailProgress[x.id]?.done)),
    [trailProgress]
  );

  // Conquistas: desbloqueia quando a condição é atingida
  const ready = !sync.user || sync.remoteReady;
  const unlockedRef = useRef(unlocked);
  unlockedRef.current = unlocked;
  useEffect(() => {
    if (!ready) return;
    const ctx = { stats, essays, simulados, counters, best, trailCompleted };
    const fresh = ACHIEVEMENTS.filter((a) => !unlockedRef.current[a.id] && a.check(ctx));
    if (fresh.length === 0) return;
    const date = new Date().toISOString();
    setUnlocked((prev) => ({ ...prev, ...Object.fromEntries(fresh.filter((a) => !prev[a.id]).map((a) => [a.id, date])) }));
    fresh.forEach((a) => toast(`Conquista desbloqueada: ${a.title}`, 'gold'));
  }, [stats, essays, simulados, counters, best, trailCompleted, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    profile, setProfile, answers, simulados, trailProgress, essays, setEssays, essayDraft, setEssayDraft,
    planner, setPlanner, studyDays, unlocked, counters,
    stats, streak, best, today,
    toast, toasts, markStudy, answerQuestion, resetQuestion, finishSimulado, toggleTopic, saveEssay, countPomodoro,
  };
}
