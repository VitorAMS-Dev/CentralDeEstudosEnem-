import React from 'react';
import { BookMarked, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

const DIFF = {
  Fácil: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Média: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Difícil: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

/**
 * selected: alternativa marcada (ou undefined)
 * revealed: mostra gabarito e resolução
 * onSelect: se ausente, as alternativas ficam somente leitura
 */
export default function QuestionCard({ q, number, selected, revealed, onSelect, onReset }) {
  const isCorrect = selected === q.correctAnswer;
  return (
    <article className="bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-md">
      <header className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-700/60">
        <div className="flex flex-wrap items-center gap-2">
          {number != null && (
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-2.5 py-1 rounded-md">
              Questão {number}
            </span>
          )}
          <span className="text-xs font-medium text-slate-300 bg-slate-700/50 px-2.5 py-1 rounded-md">{q.subject}</span>
          <span className="text-xs text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md">{q.topic}</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${DIFF[q.difficulty]}`}>
          Nível {q.difficulty}
        </span>
      </header>

      <p className="text-sm leading-relaxed text-slate-200 mb-5 whitespace-pre-line">{q.statement}</p>

      <div className="space-y-2.5">
        {q.options.map((opt) => {
          const isSel = selected === opt.id;
          const isRight = opt.id === q.correctAnswer;
          let style = 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500';
          if (revealed) {
            if (isRight) style = 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-medium';
            else if (isSel) style = 'border-rose-500 bg-rose-500/10 text-rose-300 font-medium';
            else style = 'border-slate-800 bg-slate-900/30 text-slate-500 opacity-60';
          } else if (isSel) {
            style = 'border-amber-400 bg-amber-400/10 text-amber-200 font-medium';
          }
          const readOnly = !onSelect || revealed;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={readOnly}
              onClick={() => onSelect(opt.id)}
              className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-start gap-3 min-h-[48px] ${style}`}
            >
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  revealed && isRight ? 'bg-emerald-500 text-slate-900' : revealed && isSel ? 'bg-rose-500 text-slate-900' : isSel ? 'bg-amber-400 text-slate-900' : 'bg-slate-700 text-slate-300'
                }`}
              >
                {opt.id}
              </span>
              <span className="text-sm leading-snug">{opt.text}</span>
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="mt-5 p-4 rounded-xl bg-slate-900 border border-slate-700">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h4 className={`text-sm font-bold flex items-center gap-2 ${selected ? (isCorrect ? 'text-emerald-400' : 'text-rose-400') : 'text-slate-300'}`}>
              {selected ? (
                isCorrect ? (
                  <><CheckCircle2 className="w-4 h-4" /> Resposta correta!</>
                ) : (
                  <><XCircle className="w-4 h-4" /> Incorreta. Gabarito: letra {q.correctAnswer}</>
                )
              ) : (
                <>Em branco. Gabarito: letra {q.correctAnswer}</>
              )}
            </h4>
            {onReset && (
              <button onClick={onReset} className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 min-h-[32px]">
                <RotateCcw className="w-3.5 h-3.5" /> Refazer
              </button>
            )}
          </div>
          <p className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <BookMarked className="w-3.5 h-3.5 text-amber-400" /> Resolução passo a passo
          </p>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{q.explanation}</p>
        </div>
      )}
    </article>
  );
}
