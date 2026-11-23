import React, { useEffect, useRef, useState } from 'react';

const MODES = {
  focus: { label: 'Foco', minutes: 25, active: 'bg-amber-500' },
  shortBreak: { label: 'Pausa curta', minutes: 5, active: 'bg-emerald-500' },
  longBreak: { label: 'Pausa longa', minutes: 15, active: 'bg-blue-500' },
};

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

export default function PomodoroTab({ data }) {
  const { countPomodoro, counters, toast } = data;
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60);
  const [running, setRunning] = useState(false);
  const endAt = useRef(0);

  // Usa o horário final (e não contagem de ticks), para não atrasar com a aba em segundo plano
  useEffect(() => {
    if (!running) return;
    endAt.current = Date.now() + timeLeft * 1000;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setTimeLeft(left);
      if (left === 0) {
        clearInterval(id);
        setRunning(false);
        if (mode === 'focus') {
          countPomodoro();
          toast('Ciclo de foco concluído. Hora de uma pausa!', 'gold');
        } else toast('Pausa encerrada. Vamos voltar ao foco?');
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = running ? `${fmt(timeLeft)} · ${MODES[mode].label}` : 'Preparatório ENEM';
    return () => { document.title = 'Preparatório ENEM'; };
  }, [running, timeLeft, mode]);

  const pick = (m) => {
    setMode(m);
    setRunning(false);
    setTimeLeft(MODES[m].minutes * 60);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 text-center shadow-xl">
        <h2 className="text-lg font-bold text-white mb-1">Timer Pomodoro</h2>
        <p className="text-xs text-slate-400 mb-6">Blocos de estudo sem distração, com pausas curtas entre eles.</p>

        <div className="flex gap-1.5 mb-8 bg-slate-900 p-1.5 rounded-2xl border border-slate-700">
          {Object.entries(MODES).map(([key, m]) => (
            <button
              key={key}
              onClick={() => pick(key)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold min-h-[40px] ${mode === key ? `${m.active} text-slate-900` : 'text-slate-400'}`}
            >
              {m.label} ({m.minutes}m)
            </button>
          ))}
        </div>

        <div className="text-7xl font-mono font-extrabold text-amber-400 tracking-wider mb-8" role="timer">{fmt(timeLeft)}</div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className={`px-8 py-3.5 rounded-xl font-bold text-sm min-h-[48px] ${running ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-900'}`}
          >
            {running ? 'Pausar' : timeLeft === MODES[mode].minutes * 60 ? 'Iniciar' : 'Continuar'}
          </button>
          <button onClick={() => pick(mode)} className="px-5 py-3.5 bg-slate-700 rounded-xl text-sm font-semibold text-slate-200 min-h-[48px]">
            Reiniciar
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-6">Ciclos de foco concluídos no total: <strong className="text-slate-300">{counters.pomodoros || 0}</strong></p>
      </div>
    </div>
  );
}
