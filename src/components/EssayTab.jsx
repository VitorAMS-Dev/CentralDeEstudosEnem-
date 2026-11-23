import React from 'react';
import { RotateCcw, Save, Sparkles, Trash2, FileText } from 'lucide-react';

const COMPETENCIAS = [
  ['C1: Norma culta', 'Domínio da modalidade escrita formal.'],
  ['C2: Compreensão do tema', 'Aplicar conceitos de várias áreas do conhecimento.'],
  ['C3: Projeto de texto', 'Selecionar, relacionar e organizar argumentos.'],
  ['C4: Coesão', 'Mecanismos entre frases e parágrafos.'],
  ['C5: Proposta de intervenção', 'Agente, ação, meio, finalidade e detalhamento.'],
];

export default function EssayTab({ data }) {
  const { essayDraft, setEssayDraft, essays, setEssays, saveEssay, toast } = data;
  const words = essayDraft.text.trim() ? essayDraft.text.trim().split(/\s+/).length : 0;
  const lines = essayDraft.text ? essayDraft.text.split('\n').length : 0;

  const onSave = () => {
    if (saveEssay()) toast('Redação salva no seu histórico.');
    else toast('Escreva algum texto antes de salvar.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-slate-800 rounded-2xl p-4 sm:p-6 border border-slate-700 space-y-4">
        <label className="block text-xs font-semibold text-slate-400">
          Tema da redação
          <input
            type="text"
            value={essayDraft.title}
            onChange={(e) => setEssayDraft((d) => ({ ...d, title: e.target.value }))}
            className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-amber-300 focus:outline-none focus:border-amber-500"
          />
        </label>
        <div>
          <div className="flex justify-between items-center mb-1 text-xs text-slate-400">
            <span className="font-semibold">Folha de redação <span className="font-normal text-slate-500">(rascunho salvo automaticamente)</span></span>
            <span>{words} palavras · {lines}/30 linhas</span>
          </div>
          <textarea
            rows={14}
            value={essayDraft.text}
            onChange={(e) => setEssayDraft((d) => ({ ...d, text: e.target.value }))}
            placeholder="Escreva seu texto dissertativo-argumentativo na norma-padrão da língua portuguesa…"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 leading-relaxed resize-y"
          />
        </div>
        <div className="flex items-center justify-between">
          <button onClick={() => setEssayDraft((d) => ({ ...d, text: '' }))} className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 min-h-[40px]">
            <RotateCcw className="w-3.5 h-3.5" /> Limpar texto
          </button>
          <button onClick={onSave} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 min-h-[44px]">
            <Save className="w-4 h-4" /> Salvar redação
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" /> As 5 competências</h3>
          <ul className="text-xs text-slate-300 space-y-2">
            {COMPETENCIAS.map(([t, d]) => (
              <li key={t} className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/50">
                <strong className="text-amber-400 block mb-0.5">{t}</strong>{d}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-3">Redações salvas ({essays.length})</h3>
          {essays.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Nenhuma redação salva ainda.</p>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {essays.map((e) => (
                <li key={e.id} className="p-3 bg-slate-900 rounded-xl border border-slate-700 text-xs">
                  <div className="font-semibold text-slate-200 line-clamp-2">{e.title}</div>
                  <div className="text-[11px] text-slate-500 flex justify-between mt-1"><span>{e.date}</span><span>{e.words} palavras</span></div>
                  <div className="flex gap-3 mt-2">
                    <button onClick={() => { setEssayDraft({ title: e.title, text: e.text }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-amber-400 flex items-center gap-1 min-h-[32px]">
                      <FileText className="w-3.5 h-3.5" /> Abrir no editor
                    </button>
                    <button onClick={() => { if (window.confirm('Excluir esta redação?')) setEssays((prev) => prev.filter((x) => x.id !== e.id)); }} className="text-slate-500 hover:text-rose-400 flex items-center gap-1 min-h-[32px]">
                      <Trash2 className="w-3.5 h-3.5" /> Excluir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
