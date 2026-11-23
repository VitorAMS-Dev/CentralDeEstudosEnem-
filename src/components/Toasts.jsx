import React from 'react';
import { Trophy, Info } from 'lucide-react';

export default function Toasts({ toasts }) {
  return (
    <div className="fixed top-3 inset-x-3 z-50 flex flex-col items-center gap-2 pointer-events-none" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto max-w-md w-full flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm ${
            t.tone === 'gold'
              ? 'bg-amber-500 text-slate-900 border-amber-300 font-semibold'
              : 'bg-slate-800 text-slate-100 border-slate-600'
          }`}
        >
          {t.tone === 'gold' ? <Trophy className="w-5 h-5 shrink-0" /> : <Info className="w-5 h-5 shrink-0 text-amber-400" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
