import React, { useMemo, useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { QUESTIONS, SUBJECTS, QUESTIONS_BY_SUBJECT } from '../data/index';
import QuestionCard from './QuestionCard';

const PAGE = 10;

export default function QuestionsTab({ data }) {
  const { answers, stats, answerQuestion, resetQuestion } = data;
  const [subject, setSubject] = useState('all');
  const [difficulty, setDifficulty] = useState('Todas');
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE);

  const reset = (fn) => (v) => {
    fn(v);
    setVisible(PAGE);
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return QUESTIONS.filter((q) => {
      if (subject !== 'all' && q.subjectKey !== subject) return false;
      if (difficulty !== 'Todas' && q.difficulty !== difficulty) return false;
      const a = answers[q.id];
      if (status === 'todo' && a) return false;
      if (status === 'wrong' && !(a && !a.isCorrect)) return false;
      if (status === 'right' && !(a && a.isCorrect)) return false;
      if (term && !(q.statement + q.topic + q.subject).toLowerCase().includes(term)) return false;
      return true;
    });
  }, [subject, difficulty, status, query, answers]);

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar por palavra-chave, matéria ou assunto…"
              value={query}
              onChange={(e) => reset(setQuery)(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700 text-xs">
            <div>
              <span className="text-slate-400 block">Respondidas</span>
              <span className="font-bold text-slate-200">{stats.answered} / {QUESTIONS.length}</span>
            </div>
            <div className="h-6 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400 block">Acertos</span>
              <span className="font-bold text-emerald-400">{stats.accuracy}%</span>
            </div>
          </div>
        </div>

        {/* Matérias: rolagem horizontal no celular */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1 pb-1">
          {[{ key: 'all', label: 'Todas' }, ...SUBJECTS].map((s) => {
            const total = s.key === 'all' ? QUESTIONS.length : QUESTIONS_BY_SUBJECT[s.key].length;
            const done = s.key === 'all' ? stats.answered : stats.bySubject[s.key].answered;
            const active = subject === s.key;
            return (
              <button
                key={s.key}
                onClick={() => reset(setSubject)(s.key)}
                className={`shrink-0 px-3 py-2 rounded-full text-xs font-medium border transition-colors min-h-[36px] ${
                  active ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                {s.label} <span className={active ? 'text-slate-800' : 'text-slate-500'}>{done}/{total}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-slate-400">
            Dificuldade
            <select
              value={difficulty}
              onChange={(e) => reset(setDifficulty)(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option>Todas</option>
              <option>Fácil</option>
              <option>Média</option>
              <option>Difícil</option>
            </select>
          </label>
          <label className="text-xs text-slate-400">
            Situação
            <select
              value={status}
              onChange={(e) => reset(setStatus)(e.target.value)}
              className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todas</option>
              <option value="todo">Ainda não respondidas</option>
              <option value="wrong">Que errei</option>
              <option value="right">Que acertei</option>
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-slate-800 rounded-2xl p-10 text-center border border-slate-700">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">Nenhuma questão encontrada</h3>
          <p className="text-xs text-slate-400 mt-1">Ajuste os filtros para ver outras questões.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-400">{filtered.length} questões</p>
          {filtered.slice(0, visible).map((q, i) => (
            <QuestionCard
              key={q.id}
              q={q}
              number={i + 1}
              selected={answers[q.id]?.selected}
              revealed={!!answers[q.id]}
              onSelect={(opt) => answerQuestion(q, opt)}
              onReset={() => resetQuestion(q.id)}
            />
          ))}
          {visible < filtered.length && (
            <button
              onClick={() => setVisible((v) => v + PAGE)}
              className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-amber-400 hover:bg-slate-700"
            >
              Carregar mais ({filtered.length - visible} restantes)
            </button>
          )}
        </>
      )}
    </div>
  );
}
