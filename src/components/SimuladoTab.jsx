import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Timer, ChevronLeft, ChevronRight, Flag, RotateCcw, Eye, EyeOff, TrendingDown } from 'lucide-react';
import { QUESTIONS, QUESTIONS_BY_SUBJECT, QUESTION_BY_ID, SUBJECTS, SUBJECT_BY_KEY } from '../data/index';
import { formatDuration, pct, shuffle, uid } from '../lib/utils';
import QuestionCard from './QuestionCard';

const COUNTS = [10, 20, 30, 45];

function pickQuestions(subjectKey, count, preferNew, answers) {
  const order = (list) => {
    const fresh = shuffle(list.filter((q) => !answers[q.id]));
    const old = shuffle(list.filter((q) => answers[q.id]));
    return preferNew ? [...fresh, ...old] : shuffle(list);
  };
  if (subjectKey !== 'all') return shuffle(order(QUESTIONS_BY_SUBJECT[subjectKey]).slice(0, count));
  // Mix geral: revezamento entre as matérias, para equilibrar o simulado
  const buckets = SUBJECTS.map((s) => order(QUESTIONS_BY_SUBJECT[s.key]));
  const picked = [];
  let i = 0;
  while (picked.length < count && buckets.some((b) => b.length)) {
    const b = buckets[i % buckets.length];
    if (b.length) picked.push(b.shift());
    i += 1;
  }
  return shuffle(picked);
}

function levelOf(p) {
  if (p >= 75) return { label: 'Forte', cls: 'text-emerald-400', bar: 'bg-emerald-500' };
  if (p >= 50) return { label: 'Regular', cls: 'text-amber-400', bar: 'bg-amber-400' };
  return { label: 'Atenção', cls: 'text-rose-400', bar: 'bg-rose-500' };
}

export default function SimuladoTab({ data }) {
  const { answers, simulados, finishSimulado, toast } = data;
  const [phase, setPhase] = useState('config');
  const [subjectKey, setSubjectKey] = useState('all');
  const [count, setCount] = useState(20);
  const [preferNew, setPreferNew] = useState(true);

  const [questions, setQuestions] = useState([]);
  const [selections, setSelections] = useState({});
  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);

  const [result, setResult] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const maxCount = subjectKey === 'all' ? QUESTIONS.length : QUESTIONS_BY_SUBJECT[subjectKey].length;

  useEffect(() => {
    if (phase !== 'running') return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  const start = () => {
    const qs = pickQuestions(subjectKey, Math.min(count, maxCount), preferNew, answers);
    setQuestions(qs);
    setSelections({});
    setIndex(0);
    setElapsed(0);
    startedAt.current = Date.now();
    setPhase('running');
    window.scrollTo({ top: 0 });
  };

  const finish = (force = false) => {
    const blanks = questions.filter((q) => !selections[q.id]).length;
    if (!force && blanks > 0 && !window.confirm(`Você deixou ${blanks} questão(ões) em branco. Finalizar mesmo assim?`)) return;
    const seconds = Math.floor((Date.now() - startedAt.current) / 1000);
    const bySubject = {};
    let correct = 0;
    for (const q of questions) {
      const b = (bySubject[q.subjectKey] ||= { total: 0, correct: 0 });
      b.total += 1;
      if (selections[q.id] === q.correctAnswer) {
        b.correct += 1;
        correct += 1;
      }
    }
    const res = {
      id: uid(),
      date: new Date().toISOString(),
      subjectKey,
      total: questions.length,
      correct,
      blank: blanks,
      seconds,
      bySubject,
      items: questions.map((q) => [q.id, selections[q.id] || null]),
    };
    finishSimulado(res, questions, selections);
    setResult(res);
    setShowReview(false);
    setPhase('result');
    window.scrollTo({ top: 0 });
    toast('Simulado concluído e salvo no seu histórico.');
  };

  // ---------- Resultado ----------
  const resultQuestions = useMemo(
    () => (result ? result.items.map(([id]) => QUESTION_BY_ID[id]).filter(Boolean) : []),
    [result]
  );
  const weakTopics = useMemo(() => {
    if (!result) return [];
    const map = {};
    for (const [id, sel] of result.items) {
      const q = QUESTION_BY_ID[id];
      if (!q) continue;
      const k = `${q.subjectKey}|${q.topic}`;
      const t = (map[k] ||= { subjectKey: q.subjectKey, topic: q.topic, total: 0, correct: 0 });
      t.total += 1;
      if (sel === q.correctAnswer) t.correct += 1;
    }
    return Object.values(map)
      .filter((t) => t.correct < t.total)
      .sort((a, b) => a.correct / a.total - b.correct / b.total || b.total - a.total)
      .slice(0, 6);
  }, [result]);

  if (phase === 'config') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-700 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Timer className="w-5 h-5 text-amber-400" /> Novo simulado</h2>
            <p className="text-xs text-slate-400 mt-1">Questões sorteadas, cronômetro e relatório de pontos fracos ao final. O gabarito só aparece depois de finalizar.</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">Matéria</p>
            <div className="grid grid-cols-2 gap-2">
              {[{ key: 'all', label: 'Mix de todas as matérias' }, ...SUBJECTS].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSubjectKey(s.key)}
                  className={`text-left px-3 py-2.5 rounded-xl text-xs font-medium border min-h-[44px] ${
                    subjectKey === s.key ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'
                  } ${s.key === 'all' ? 'col-span-2' : ''}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-400 mb-2">Quantidade de questões</p>
            <div className="flex gap-2">
              {COUNTS.map((n) => (
                <button
                  key={n}
                  disabled={n > maxCount}
                  onClick={() => setCount(n)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border min-h-[44px] disabled:opacity-30 ${
                    Math.min(count, maxCount) === n ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-300 min-h-[44px]">
            <input type="checkbox" checked={preferNew} onChange={(e) => setPreferNew(e.target.checked)} className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-amber-500" />
            Priorizar questões que ainda não respondi
          </label>

          <button onClick={start} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3.5 rounded-xl text-sm">
            Começar simulado
          </button>
        </div>

        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-3">Últimos simulados</h3>
          {simulados.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Você ainda não fez nenhum simulado.</p>
          ) : (
            <ul className="space-y-2">
              {simulados.slice(0, 5).map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">{s.subjectKey === 'all' ? 'Mix geral' : SUBJECT_BY_KEY[s.subjectKey]?.label}</div>
                    <div className="text-slate-500">{new Date(s.date).toLocaleDateString('pt-BR')} · {formatDuration(s.seconds)}</div>
                  </div>
                  <div className={`text-base font-bold ${levelOf(pct(s.correct, s.total)).cls}`}>{pct(s.correct, s.total)}% <span className="text-xs text-slate-500 font-normal">({s.correct}/{s.total})</span></div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // ---------- Em andamento ----------
  if (phase === 'running') {
    const q = questions[index];
    const answered = Object.keys(selections).length;
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="sticky top-14 md:top-[108px] z-20 bg-slate-900/95 backdrop-blur py-2">
          <div className="flex items-center justify-between gap-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-mono font-bold"><Timer className="w-4 h-4" /> {formatDuration(elapsed)}</div>
            <div className="text-xs text-slate-300">{answered}/{questions.length} respondidas</div>
            <button onClick={() => finish(false)} className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold text-xs px-3 py-2 rounded-lg min-h-[36px]">
              <Flag className="w-4 h-4" /> Finalizar
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {questions.map((qq, i) => (
            <button
              key={qq.id}
              onClick={() => setIndex(i)}
              className={`w-9 h-9 rounded-lg text-xs font-bold border ${
                i === index ? 'bg-amber-500 text-slate-900 border-amber-400' : selections[qq.id] ? 'bg-slate-700 text-white border-slate-500' : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
              aria-label={`Ir para a questão ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <QuestionCard
          q={q}
          number={index + 1}
          selected={selections[q.id]}
          revealed={false}
          onSelect={(opt) => setSelections((s) => ({ ...s, [q.id]: opt }))}
        />

        <div className="flex items-center justify-between gap-3">
          <button disabled={index === 0} onClick={() => setIndex((i) => i - 1)} className="flex items-center gap-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-200 disabled:opacity-30 min-h-[44px]">
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          {selections[q.id] && (
            <button onClick={() => setSelections((s) => { const n = { ...s }; delete n[q.id]; return n; })} className="text-xs text-slate-400 hover:text-rose-400">Limpar resposta</button>
          )}
          {index < questions.length - 1 ? (
            <button onClick={() => setIndex((i) => i + 1)} className="flex items-center gap-1 px-4 py-3 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm min-h-[44px]">
              Próxima <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => finish(false)} className="flex items-center gap-1 px-4 py-3 rounded-xl bg-emerald-500 text-slate-900 font-bold text-sm min-h-[44px]">
              Finalizar <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---------- Resultado ----------
  const score = pct(result.correct, result.total);
  const lvl = levelOf(score);
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center">
        <p className="text-xs text-slate-400">Resultado do simulado · {result.subjectKey === 'all' ? 'Mix geral' : SUBJECT_BY_KEY[result.subjectKey]?.label}</p>
        <div className={`text-6xl font-extrabold my-2 ${lvl.cls}`}>{score}%</div>
        <p className="text-sm text-slate-300">{result.correct} de {result.total} acertos · {result.blank} em branco · tempo {formatDuration(result.seconds)}</p>
        <p className="text-xs text-slate-500 mt-1">Média de {formatDuration(result.seconds / Math.max(1, result.total))} por questão</p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-bold text-white mb-4">Acertos por matéria</h3>
        <div className="space-y-3">
          {Object.entries(result.bySubject).map(([key, b]) => {
            const p = pct(b.correct, b.total);
            const l = levelOf(p);
            return (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-200">{SUBJECT_BY_KEY[key].label}</span>
                  <span className={l.cls}>{p}% · {b.correct}/{b.total} · {l.label}</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                  <div className={`${l.bar} h-full`} style={{ width: `${p}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-rose-400" /> Pontos fracos para revisar</h3>
        {weakTopics.length === 0 ? (
          <p className="text-xs text-emerald-400">Sem erros neste simulado. Excelente!</p>
        ) : (
          <ul className="space-y-2">
            {weakTopics.map((t) => (
              <li key={`${t.subjectKey}|${t.topic}`} className="flex items-center justify-between gap-3 p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs">
                <div>
                  <div className="font-semibold text-slate-200">{t.topic}</div>
                  <div className="text-slate-500">{SUBJECT_BY_KEY[t.subjectKey].label}</div>
                </div>
                <span className="text-rose-400 font-bold shrink-0">{t.correct}/{t.total}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[11px] text-slate-500 mt-3">Dica: marque esses tópicos como "Revisado" nas Trilhas depois de estudá-los e refaça as questões erradas.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={() => setShowReview((v) => !v)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold text-slate-200 min-h-[44px]">
          {showReview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {showReview ? 'Ocultar gabarito' : 'Ver gabarito e resoluções'}
        </button>
        <button onClick={() => setPhase('config')} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm min-h-[44px]">
          <RotateCcw className="w-4 h-4" /> Novo simulado
        </button>
      </div>

      {showReview &&
        resultQuestions.map((q, i) => (
          <QuestionCard key={q.id} q={q} number={i + 1} selected={result.items[i][1] || undefined} revealed />
        ))}
    </div>
  );
}
