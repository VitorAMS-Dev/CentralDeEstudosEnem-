import React, { useState } from 'react';
import { Cloud, CloudOff, Loader2, LogOut, Mail, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSync } from '../context/SyncContext';
import { local } from '../lib/storage';

const GOALS = [5, 10, 20, 30, 50];

export default function ProfileTab({ data }) {
  const { profile, setProfile, toast } = data;
  const sync = useSync();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendLink = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSending(true);
    try {
      await sync.signIn(email.trim());
      setSent(true);
    } catch (err) {
      toast(err.message || 'Não foi possível enviar o link.');
    } finally {
      setSending(false);
    }
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(local.allKeys(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-enem-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusMap = {
    local: { icon: CloudOff, cls: 'text-slate-400', text: 'Modo local: os dados ficam salvos só neste aparelho.' },
    'signed-out': { icon: CloudOff, cls: 'text-slate-400', text: 'Você não entrou. Seus dados estão só neste aparelho.' },
    loading: { icon: Loader2, cls: 'text-amber-400 animate-spin', text: 'Carregando seus dados da nuvem…' },
    saving: { icon: Loader2, cls: 'text-amber-400 animate-spin', text: 'Salvando na nuvem…' },
    synced: { icon: CheckCircle2, cls: 'text-emerald-400', text: 'Tudo sincronizado com a nuvem.' },
    error: { icon: AlertCircle, cls: 'text-rose-400', text: sync.errorMsg || 'Erro de sincronização. Seus dados continuam salvos neste aparelho.' },
  };
  const st = statusMap[sync.status];
  const StIcon = st.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <section className="bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-700 space-y-4">
        <h2 className="text-lg font-bold text-white">Seu perfil e suas metas</h2>
        <label className="block text-xs font-semibold text-slate-400">
          Seu nome
          <input
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            placeholder="Como quer ser chamado(a)?"
            className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </label>
        <label className="block text-xs font-semibold text-slate-400">
          Curso que você quer fazer
          <input
            value={profile.course}
            onChange={(e) => setProfile((p) => ({ ...p, course: e.target.value }))}
            placeholder="Ex.: Engenharia de Software"
            className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </label>
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-2">Meta diária de questões</p>
          <div className="flex gap-2">
            {GOALS.map((g) => (
              <button
                key={g}
                onClick={() => setProfile((p) => ({ ...p, dailyGoal: g }))}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border min-h-[44px] ${profile.dailyGoal === g ? 'bg-amber-500 text-slate-900 border-amber-400' : 'bg-slate-900 text-slate-300 border-slate-700'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-700 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Cloud className="w-5 h-5 text-amber-400" /> Sincronização entre dispositivos</h2>
        <p className={`text-sm flex items-start gap-2 ${st.cls.split(' ')[0]}`}>
          <StIcon className={`w-5 h-5 shrink-0 ${st.cls}`} /> <span>{st.text}</span>
        </p>

        {sync.enabled && !sync.user && (
          sent ? (
            <p className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
              Link enviado para <strong>{email}</strong>. Abra o e-mail neste aparelho e toque no link para entrar.
            </p>
          ) : (
            <form onSubmit={sendLink} className="space-y-3">
              <p className="text-xs text-slate-400">Informe seu e-mail e enviaremos um link de acesso. Não precisa de senha. Entre com o mesmo e-mail nos outros aparelhos.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="flex-1 min-w-0 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                />
                <button disabled={sending} className="bg-amber-500 text-slate-900 font-bold px-4 rounded-xl text-sm flex items-center gap-2 min-h-[44px] disabled:opacity-60">
                  <Mail className="w-4 h-4" /> {sending ? 'Enviando…' : 'Enviar link'}
                </button>
              </div>
            </form>
          )
        )}

        {sync.user && (
          <div className="flex items-center justify-between gap-3 bg-slate-900 rounded-xl p-3 border border-slate-700">
            <span className="text-xs text-slate-300 truncate">Conectado como <strong>{sync.user.email}</strong></span>
            <button onClick={sync.signOut} className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 shrink-0 min-h-[36px]">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        )}

        {!sync.enabled && (
          <p className="text-xs text-slate-500">Para ativar a nuvem, o administrador do site precisa configurar o Supabase (veja o README).</p>
        )}

        <button onClick={exportBackup} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 hover:border-slate-500 min-h-[44px]">
          <Download className="w-4 h-4" /> Baixar backup dos meus dados (JSON)
        </button>
      </section>
    </div>
  );
}
