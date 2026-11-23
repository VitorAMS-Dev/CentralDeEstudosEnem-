// Camada local (localStorage). Cada chave guarda { v: valor, t: timestamp da última edição }.
const PREFIX = 'enem:v2:';

// Chaves antigas (versão com um único componente) → migradas automaticamente na 1ª leitura.
const LEGACY = {
  answers: 'enem_user_answers',
  trails: 'enem_trails_data',
  essays: 'enem_saved_essays',
  weeklyPlan: 'enem_weekly_plan',
};

export const local = {
  get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(key, v, t = Date.now()) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify({ v, t }));
    } catch {
      /* cota cheia ou modo privado: segue sem salvar localmente */
    }
  },
  legacy(key) {
    const old = LEGACY[key];
    if (!old) return null;
    try {
      const raw = localStorage.getItem(old);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  allKeys() {
    const out = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX)) out[k.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(k));
      }
    } catch {
      /* ignore */
    }
    return out;
  },
};
