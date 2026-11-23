import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Sem as variáveis de ambiente, o app roda só com localStorage.
export const supabase =
  url && anon
    ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } })
    : null;

export const remoteEnabled = Boolean(supabase);
