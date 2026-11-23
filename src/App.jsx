import React, { useMemo, useState } from 'react';
import {
  BookOpen, ClipboardCheck, CheckSquare, Edit3, Timer, Calendar, Trophy, User, MoreHorizontal, Flame, Award, X, Cloud, CloudOff, Loader2,
} from 'lucide-react';
import { SyncProvider, useSync } from './context/SyncContext';
import { useAppData } from './hooks/useAppData';
import { ENEM_DATE } from './lib/utils';
import Toasts from './components/Toasts';
import QuestionsTab from './components/QuestionsTab';
import SimuladoTab from './components/SimuladoTab';
import TrailsTab from './components/TrailsTab';
import EssayTab from './components/EssayTab';
import PomodoroTab from './components/PomodoroTab';
import PlannerTab from './components/PlannerTab';
import AchievementsTab from './components/AchievementsTab';
import ProfileTab from './components/ProfileTab';

const TABS = [
  { id: 'questoes', label: 'Questões', icon: BookOpen, main: true },
  { id: 'simulado', label: 'Simulado', icon: ClipboardCheck, main: true },
  { id: 'trilhas', label: 'Trilhas', icon: CheckSquare, main: true },
  { id: 'redacao', label: 'Redação', icon: Edit3, main: true },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'planejador', label: 'Planejador', icon: Calendar },
  { id: 'conquistas', label: 'Conquistas', icon: Trophy },
  { id: 'perfil', label: 'Perfil', icon: User },
];

function daysUntilEnem() {
  const diff = Math.ceil((new Date(`${ENEM_DATE}T00:00:00`) - new Date()) / 86400000);
  return diff > 0 ? diff : 0;
}

function SyncBadge() {
  const { status } = useSync();
  if (status === 'local' || status === 'signed-out') return <CloudOff className="w-4 h-4 text-slate-500" aria-label="Dados só neste aparelho" />;
  if (status === 'loading' || status === 'saving') return <Loader2 className="w-4 h-4 text-amber-400 animate-spin" aria-label="Sincronizando" />;
  if (status === 'error') return <Cloud className="w-4 h-4 text-rose-400" aria-label="Erro de sincronização" />;
  return <Cloud className="w-4 h-4 text-emerald-400" aria-label="Sincronizado" />;
}

function Shell() {
  const data = useAppData();
  const [tab, setTab] = useState('questoes');
  const [moreOpen, setMoreOpen] = useState(false);
  const days = useMemo(daysUntilEnem, []);
  const { profile, stats, streak, today } = data;
  const goal = profile.dailyGoal || 10;

  const go = (id) => {
    setTab(id);
    setMoreOpen(false);
    window.scrollTo({ top: 0 });
  };
  const secondaryActive = TABS.some((t) => !t.main && t.id === tab);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      <Toasts toasts={data.toasts} />

      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-gradient-to-tr from-amber-500 to-emerald-500 p-2 rounded-xl shrink-0">
              <Award className="w-5 h-5 text-slate-900" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base md:text-lg font-bold text-white leading-tight truncate">
                {profile.name ? `Olá, ${profile.name.split(' ')[0]}!` : 'Preparatório ENEM'}
              </h1>
              <p className="text-[11px] text-slate-400 truncate">
                Meta de hoje: <strong className={today >= goal ? 'text-emerald-400' : 'text-amber-400'}>{today}/{goal}</strong> questões
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-900/70 px-2.5 py-1.5 rounded-lg border border-slate-700" title="Dias seguidos de estudo">
              <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-400' : 'text-slate-600'}`} />
              <strong className="text-slate-200">{streak}</strong>
            </div>
            <div className="hidden sm:flex flex-col bg-slate-900/70 px-3 py-1 rounded-lg border border-slate-700 leading-tight">
              <span className="text-[10px] text-slate-400">ENEM em</span>
              <strong className="text-amber-400">{days} dias</strong>
            </div>
            <div className="hidden md:flex items-center gap-1.5 text-slate-300">Acertos: <strong className="text-emerald-400">{stats.accuracy}%</strong></div>
            <SyncBadge />
          </div>
        </div>

        {/* Abas: apenas no desktop (no celular usamos a barra inferior) */}
        <nav className="hidden md:block border-t border-slate-700/50">
          <div className="max-w-7xl mx-auto px-6 h-11 flex gap-1 overflow-x-auto scrollbar-none">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => go(t.id)}
                  className={`flex items-center gap-2 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    active ? 'text-amber-400 border-amber-400' : 'text-slate-400 border-transparent hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 mt-4 flex-1 w-full pb-28 md:pb-12">
        {tab === 'questoes' && <QuestionsTab data={data} />}
        {tab === 'simulado' && <SimuladoTab data={data} />}
        {tab === 'trilhas' && <TrailsTab data={data} />}
        {tab === 'redacao' && <EssayTab data={data} />}
        {tab === 'pomodoro' && <PomodoroTab data={data} />}
        {tab === 'planejador' && <PlannerTab data={data} />}
        {tab === 'conquistas' && <AchievementsTab data={data} />}
        {tab === 'perfil' && <ProfileTab data={data} />}
      </main>

      {/* Navegação inferior (celular) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-800/95 backdrop-blur border-t border-slate-700 pb-safe">
        <div className="grid grid-cols-5">
          {TABS.filter((t) => t.main).map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => go(t.id)} className={`flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[11px] font-medium ${active ? 'text-amber-400' : 'text-slate-400'}`} aria-current={active ? 'page' : undefined}>
                <Icon className="w-5 h-5" /> {t.label}
              </button>
            );
          })}
          <button onClick={() => setMoreOpen(true)} className={`flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[11px] font-medium ${secondaryActive ? 'text-amber-400' : 'text-slate-400'}`}>
            <MoreHorizontal className="w-5 h-5" /> Mais
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex items-end" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-black/60" onClick={() => setMoreOpen(false)} aria-label="Fechar menu" />
          <div className="relative w-full bg-slate-800 rounded-t-3xl border-t border-slate-600 p-4 pb-safe">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white">Mais opções</h2>
              <button onClick={() => setMoreOpen(false)} className="p-2 text-slate-400" aria-label="Fechar"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-2">
              {TABS.filter((t) => !t.main).map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => go(t.id)} className={`flex items-center gap-3 p-4 rounded-2xl border min-h-[64px] ${tab === t.id ? 'bg-amber-500/10 border-amber-500/40 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-200'}`}>
                    <Icon className="w-5 h-5" /> <span className="text-sm font-semibold">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <SyncProvider>
      <Shell />
    </SyncProvider>
  );
}
