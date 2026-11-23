import { SUBJECTS } from './index.js';

// icon: nome do ícone do lucide-react usado na tela de conquistas
const base = [
  { id: 'first-answer', icon: 'Sparkles', title: 'Primeiro Passo', desc: 'Responda sua primeira questão.', check: (c) => c.stats.answered >= 1 },
  { id: 'q-10', icon: 'Target', title: 'Aquecimento', desc: 'Responda 10 questões.', check: (c) => c.stats.answered >= 10 },
  { id: 'q-50', icon: 'Zap', title: 'Maratona de 50 Questões', desc: 'Responda 50 questões.', check: (c) => c.stats.answered >= 50 },
  { id: 'q-100', icon: 'Medal', title: 'Centurião', desc: 'Responda 100 questões.', check: (c) => c.stats.answered >= 100 },
  { id: 'q-250', icon: 'Trophy', title: 'Rumo à Aprovação', desc: 'Responda 250 questões.', check: (c) => c.stats.answered >= 250 },
  { id: 'accuracy-80', icon: 'Crosshair', title: 'Pontaria Afiada', desc: 'Mantenha 80% de acertos com pelo menos 30 questões.', check: (c) => c.stats.answered >= 30 && c.stats.accuracy >= 80 },
  { id: 'first-essay', icon: 'PenLine', title: 'Primeira Redação Escrita', desc: 'Salve sua primeira redação.', check: (c) => c.essays.length >= 1 },
  { id: 'essay-5', icon: 'BookOpenText', title: 'Pena Afiada', desc: 'Salve 5 redações.', check: (c) => c.essays.length >= 5 },
  { id: 'streak-3', icon: 'Flame', title: '3 Dias Seguidos', desc: 'Estude 3 dias seguidos.', check: (c) => c.best >= 3 },
  { id: 'streak-7', icon: 'Flame', title: '7 Dias Seguidos de Estudo', desc: 'Estude 7 dias seguidos.', check: (c) => c.best >= 7 },
  { id: 'streak-30', icon: 'CalendarCheck', title: 'Hábito de Aço', desc: 'Estude 30 dias seguidos.', check: (c) => c.best >= 30 },
  { id: 'first-simulado', icon: 'Timer', title: 'Primeiro Simulado', desc: 'Conclua um simulado.', check: (c) => c.simulados.length >= 1 },
  { id: 'simulado-80', icon: 'Award', title: 'Nota de Aprovado', desc: 'Acerte 80% ou mais em um simulado de 10+ questões.', check: (c) => c.simulados.some((s) => s.total >= 10 && s.correct / s.total >= 0.8) },
  { id: 'simulado-geral', icon: 'Layers', title: 'Mix Completo', desc: 'Conclua um simulado geral com 20+ questões.', check: (c) => c.simulados.some((s) => s.subjectKey === 'all' && s.total >= 20) },
  { id: 'pomodoro-5', icon: 'Hourglass', title: 'Foco Total', desc: 'Complete 5 ciclos de foco no Pomodoro.', check: (c) => (c.counters.pomodoros || 0) >= 5 },
  { id: 'trail-complete', icon: 'CheckCircle2', title: 'Trilha Concluída', desc: 'Conclua todos os tópicos de uma trilha.', check: (c) => c.trailCompleted },
];

const masters = SUBJECTS.map((s) => ({
  id: `master-${s.key}`,
  icon: 'GraduationCap',
  title: `Mestre em ${s.label}`,
  desc: `Responda 20 questões de ${s.label} com pelo menos 80% de acertos.`,
  check: (c) => {
    const x = c.stats.bySubject[s.key];
    return x.answered >= 20 && x.correct / x.answered >= 0.8;
  },
}));

export const ACHIEVEMENTS = [...base, ...masters];
