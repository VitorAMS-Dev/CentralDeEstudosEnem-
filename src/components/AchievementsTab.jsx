import React from 'react';
import {
  Sparkles, Target, Zap, Medal, Trophy, Crosshair, PenLine, BookOpenText, Flame, CalendarCheck,
  Timer, Award, Layers, Hourglass, CheckCircle2, GraduationCap, Lock,
} from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';

const ICONS = { Sparkles, Target, Zap, Medal, Trophy, Crosshair, PenLine, BookOpenText, Flame, CalendarCheck, Timer, Award, Layers, Hourglass, CheckCircle2, GraduationCap };

export default function AchievementsTab({ data }) {
  const { unlocked, streak, best, stats } = data;
  const count = ACHIEVEMENTS.filter((a) => unlocked[a.id]).length;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          ['Conquistas', `${count}/${ACHIEVEMENTS.length}`],
          ['Sequência atual', `${streak} ${streak === 1 ? 'dia' : 'dias'}`],
          ['Maior sequência', `${best} ${best === 1 ? 'dia' : 'dias'}`],
          ['Questões respondidas', stats.answered],
        ].map(([label, value]) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
            <div className="text-xs text-slate-400">{label}</div>
            <div className="text-xl font-extrabold text-amber-400 mt-1">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const date = unlocked[a.id];
          const Icon = ICONS[a.icon] || Trophy;
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 p-4 rounded-2xl border ${date ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-800/60 border-slate-700 opacity-70'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${date ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 text-slate-500'}`}>
                {date ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <div className={`text-sm font-bold ${date ? 'text-amber-300' : 'text-slate-300'}`}>{a.title}</div>
                <div className="text-xs text-slate-400">{a.desc}</div>
                {date && <div className="text-[10px] text-slate-500 mt-0.5">Desbloqueada em {new Date(date).toLocaleDateString('pt-BR')}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
