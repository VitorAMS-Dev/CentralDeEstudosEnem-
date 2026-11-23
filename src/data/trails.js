import { SUBJECTS } from './index.js';

const T = (key, label, color, topics) => ({
  id: key,
  title: label,
  color,
  topics: topics.map((title, i) => ({ id: `${key}${i + 1}`, title })),
});

// Definição das trilhas. O progresso do usuário fica separado (id do tópico → { done, reviewed }).
export const TRAILS = [
  T('mat', 'Matemática', 'from-blue-600 to-indigo-700', [
    'Porcentagem, razão e proporção', 'Funções de 1º e 2º grau e gráficos', 'Geometria plana e espacial',
    'Estatística (média, moda e mediana)', 'Probabilidade e análise combinatória', 'Juros, progressões e exponencial',
  ]),
  T('fis', 'Física', 'from-sky-600 to-cyan-700', [
    'Cinemática e Leis de Newton', 'Energia, trabalho e potência', 'Termologia e Termodinâmica',
    'Ondulatória e Acústica', 'Óptica geométrica', 'Eletricidade e Eletromagnetismo',
  ]),
  T('qui', 'Química', 'from-emerald-600 to-teal-700', [
    'Estequiometria e quantidade de matéria', 'Soluções, pH e ácidos e bases', 'Termoquímica e cinética',
    'Equilíbrio químico e eletroquímica', 'Química orgânica', 'Química ambiental',
  ]),
  T('bio', 'Biologia', 'from-lime-600 to-green-700', [
    'Citologia e metabolismo energético', 'Genética e biotecnologia', 'Evolução',
    'Ecologia e meio ambiente', 'Fisiologia humana e saúde', 'Botânica e microbiologia',
  ]),
  T('his', 'História', 'from-amber-600 to-orange-700', [
    'Antiguidade e Idade Média', 'Idade Moderna e Iluminismo', 'Revolução Industrial e Imperialismo',
    'Brasil Colônia e Império', 'Brasil República e Era Vargas', 'Ditadura, redemocratização e mundo atual',
  ]),
  T('geo', 'Geografia', 'from-yellow-600 to-amber-700', [
    'Cartografia e fusos horários', 'Clima, relevo e hidrografia', 'Biomas e meio ambiente',
    'Demografia e urbanização', 'Geografia agrária e industrial', 'Energia e geopolítica',
  ]),
  T('fil', 'Filosofia / Sociologia', 'from-violet-600 to-purple-700', [
    'Filosofia antiga e política', 'Filosofia moderna e contemporânea', 'Ética e filosofia da ciência',
    'Clássicos da Sociologia', 'Cultura e desigualdade social', 'Trabalho, cidadania e movimentos sociais',
  ]),
  T('por', 'Português e Literatura', 'from-rose-600 to-pink-700', [
    'Interpretação textual e gêneros', 'Funções da linguagem e variação linguística', 'Figuras de linguagem',
    'Gramática: concordância, regência e crase', 'Escolas literárias até o Realismo', 'Modernismo e literatura contemporânea',
  ]),
  T('ing', 'Inglês / Espanhol', 'from-fuchsia-600 to-pink-700', [
    'Leitura e vocabulário (inglês)', 'Tempos verbais e conectivos (inglês)', 'Falsos cognatos (inglês)',
    'Leitura e vocabulário (espanhol)', 'Heterossemânticos (espanhol)', 'Gramática básica (espanhol)',
  ]),
];

export const ALL_TOPIC_IDS = TRAILS.flatMap((t) => t.topics.map((x) => x.id));

// Converte o formato antigo (lista de trilhas com "completed") para o mapa de progresso.
export function migrateLegacyTrails() {
  try {
    const raw = localStorage.getItem('enem_trails_data');
    if (!raw) return {};
    const old = JSON.parse(raw);
    const map = {};
    const oldTitles = {};
    for (const trail of old) for (const t of trail.topics) if (t.completed) oldTitles[t.title] = true;
    // Os tópicos antigos tinham ids diferentes; casamos pelo início do título quando possível.
    for (const trail of TRAILS)
      for (const t of trail.topics)
        if (Object.keys(oldTitles).some((title) => title.toLowerCase().startsWith(t.title.toLowerCase().slice(0, 12))))
          map[t.id] = { done: true, reviewed: false };
    return map;
  } catch {
    return {};
  }
}

export const SUBJECT_KEYS = SUBJECTS.map((s) => s.key);
