import React, { useState } from 'react';
import { Plus, Trash2, Square, CheckSquare } from 'lucide-react';
import { DAYS, pct, uid } from '../lib/utils';

// getDay(): 0 = domingo; nossa lista começa na segunda
const TODAY = DAYS[(new Date().getDay() + 6) % 7];

export default function PlannerTab({ data }) {
  const { planner, setPlanner, markStudy } = data;
  const [drafts, setDrafts] = useState({});

  const update = (day, fn) => setPlanner((prev) => ({ ...prev, [day]: fn(prev[day] || []) }));
  const add = (day) => {
    const text = (drafts[day] || '').trim();
    if (!text) return;
    update(day, (list) => [...list, { id: uid(), text, done: false }]);
    setDrafts((d) => ({ ...d, [day]: '' }));
  };

  const all = DAYS.flatMap((d) => planner[d] || []);
  const weekDone = all.filter((t) => t.done).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-white">Planejador semanal</h2>
          <p className="text-xs text-slate-400">Liste as tarefas de cada dia e marque conforme concluir.</p>
        </div>
        <div className="text-xs text-slate-300 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
          Semana: <strong className="text-amber-400">{weekDone}/{all.length}</strong> tarefas ({pct(weekDone, all.length)}%)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DAYS.map((day) => {
          const list = planner[day] || [];
          const done = list.filter((t) => t.done).length;
          return (
            <section key={day} className={`bg-slate-800 rounded-2xl border p-4 ${day === TODAY ? 'border-amber-500/60' : 'border-slate-700'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-amber-400">{day}{day === TODAY && <span className="ml-2 text-[10px] text-slate-900 bg-amber-400 rounded px-1.5 py-0.5">hoje</span>}</h3>
                <span className="text-[11px] text-slate-500">{done}/{list.length}</span>
              </div>
              <ul className="space-y-1 mb-3">
                {list.length === 0 && <li className="text-xs text-slate-500 italic">Dia livre. Adicione uma tarefa abaixo.</li>}
                {list.map((t) => (
                  <li key={t.id} className="flex items-center gap-2">
                    <button
                      onClick={() => { update(day, (l) => l.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x))); if (!t.done) markStudy(); }}
                      className="flex items-center gap-2 flex-1 text-left min-h-[40px]"
                      aria-pressed={t.done}
                    >
                      {t.done ? <CheckSquare className="w-5 h-5 text-emerald-400 shrink-0" /> : <Square className="w-5 h-5 text-slate-500 shrink-0" />}
                      <span className={`text-xs ${t.done ? 'line-through text-slate-500' : 'text-slate-200'}`}>{t.text}</span>
                    </button>
                    <button onClick={() => update(day, (l) => l.filter((x) => x.id !== t.id))} className="p-2 text-slate-600 hover:text-rose-400" aria-label="Excluir tarefa">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  value={drafts[day] || ''}
                  onChange={(e) => setDrafts((d) => ({ ...d, [day]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && add(day)}
                  placeholder="Nova tarefa…"
                  className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
                <button onClick={() => add(day)} className="px-3 bg-amber-500 text-slate-900 rounded-lg min-h-[36px]" aria-label="Adicionar tarefa">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
