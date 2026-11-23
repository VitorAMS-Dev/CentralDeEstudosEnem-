import React from 'react';
import { CheckSquare, Square, RefreshCw } from 'lucide-react';
import { TRAILS } from '../data/trails';
import { pct } from '../lib/utils';

export default function TrailsTab({ data }) {
  const { trailProgress, toggleTopic, stats } = data;
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">Trilhas de conteúdo</h2>
        <p className="text-xs text-slate-400">Marque o que já estudou e o que já revisou. A revisão é o que fixa o conteúdo.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TRAILS.map((trail) => {
          const done = trail.topics.filter((t) => trailProgress[t.id]?.done).length;
          const reviewed = trail.topics.filter((t) => trailProgress[t.id]?.reviewed).length;
          const total = trail.topics.length;
          const percent = pct(done, total);
          const sub = stats.bySubject[trail.id];
          return (
            <section key={trail.id} className="bg-slate-800 rounded-2xl border border-slate-700 p-4 flex flex-col">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${trail.color} text-white mb-3 flex items-center justify-between`}>
                <h3 className="font-bold text-sm">{trail.title}</h3>
                <span className="text-xs font-semibold bg-black/30 px-2 py-0.5 rounded-full">{percent}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full mb-3 overflow-hidden border border-slate-700">
                <div className="bg-amber-400 h-full transition-all" style={{ width: `${percent}%` }} />
              </div>
              <ul className="space-y-1">
                {trail.topics.map((topic) => {
                  const p = trailProgress[topic.id] || {};
                  return (
                    <li key={topic.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-700/30">
                      <button
                        onClick={() => toggleTopic(topic.id, 'done')}
                        className="flex items-center gap-3 flex-1 text-left min-h-[40px]"
                        aria-pressed={!!p.done}
                      >
                        {p.done ? <CheckSquare className="w-5 h-5 text-amber-400 shrink-0" /> : <Square className="w-5 h-5 text-slate-500 shrink-0" />}
                        <span className={`text-xs ${p.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>{topic.title}</span>
                      </button>
                      <button
                        onClick={() => toggleTopic(topic.id, 'reviewed')}
                        title="Marcar como revisado"
                        aria-pressed={!!p.reviewed}
                        className={`shrink-0 flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-md border min-h-[32px] ${
                          p.reviewed ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' : 'text-slate-500 border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        <RefreshCw className="w-3 h-3" /> Revisado
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 pt-3 border-t border-slate-700/60 flex justify-between text-[11px] text-slate-400">
                <span>Estudados {done}/{total} · Revisados {reviewed}/{total}</span>
                <span>Questões: {sub.answered > 0 ? `${pct(sub.correct, sub.answered)}% de acerto` : 'nenhuma ainda'}</span>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
