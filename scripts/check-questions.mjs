// Valida o banco de questões: quantidade, estrutura e distribuição do gabarito.
import { QUESTIONS, SUBJECTS } from '../src/data/index.js';

let errors = 0;
const fail = (m) => { errors += 1; console.error('✗', m); };

for (const s of SUBJECTS) {
  const qs = QUESTIONS.filter((q) => q.subjectKey === s.key);
  const dist = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  qs.forEach((q) => dist[q.correctAnswer]++);
  console.log(`${s.label.padEnd(26)} ${String(qs.length).padStart(3)} questões   gabarito ${JSON.stringify(dist)}`);
  if (qs.length < 40) fail(`${s.label}: apenas ${qs.length} questões (mínimo 40)`);
}

const ids = new Set();
for (const q of QUESTIONS) {
  if (ids.has(q.id)) fail(`id duplicado ${q.id}`);
  ids.add(q.id);
  if (q.options.length !== 5) fail(`${q.id}: ${q.options.length} alternativas`);
  const texts = q.options.map((o) => o.text);
  if (new Set(texts).size !== 5) fail(`${q.id}: alternativas repetidas`);
  if (!q.options.some((o) => o.id === q.correctAnswer)) fail(`${q.id}: gabarito inválido`);
  if (!q.statement || !q.explanation) fail(`${q.id}: enunciado ou resolução vazios`);
  if (!['Fácil', 'Média', 'Difícil'].includes(q.difficulty)) fail(`${q.id}: dificuldade "${q.difficulty}"`);
}
console.log(`\nTotal: ${QUESTIONS.length} questões`);
if (errors) { console.error(`${errors} problema(s)`); process.exit(1); }
console.log('OK');
