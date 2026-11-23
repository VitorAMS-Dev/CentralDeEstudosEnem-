import matematica from './questions/matematica.js';
import fisica from './questions/fisica.js';
import quimica from './questions/quimica.js';
import biologia from './questions/biologia.js';
import historia from './questions/historia.js';
import geografia from './questions/geografia.js';
import filosofiaSociologia from './questions/filosofia_sociologia.js';
import portugues from './questions/portugues.js';
import inglesEspanhol from './questions/ingles_espanhol.js';

export const AREAS = {
  mat: 'Matemática e suas Tecnologias',
  nat: 'Ciências da Natureza e suas Tecnologias',
  hum: 'Ciências Humanas e suas Tecnologias',
  ling: 'Linguagens, Códigos e suas Tecnologias',
};

export const AREA_SHORT = {
  [AREAS.mat]: 'Matemática',
  [AREAS.nat]: 'Natureza',
  [AREAS.hum]: 'Humanas',
  [AREAS.ling]: 'Linguagens',
};

// key → rótulo exibido, área do ENEM e arquivo de dados
export const SUBJECTS = [
  { key: 'mat', label: 'Matemática', area: AREAS.mat, data: matematica },
  { key: 'fis', label: 'Física', area: AREAS.nat, data: fisica },
  { key: 'qui', label: 'Química', area: AREAS.nat, data: quimica },
  { key: 'bio', label: 'Biologia', area: AREAS.nat, data: biologia },
  { key: 'his', label: 'História', area: AREAS.hum, data: historia },
  { key: 'geo', label: 'Geografia', area: AREAS.hum, data: geografia },
  { key: 'fil', label: 'Filosofia / Sociologia', area: AREAS.hum, data: filosofiaSociologia },
  { key: 'por', label: 'Português e Literatura', area: AREAS.ling, data: portugues },
  { key: 'ing', label: 'Inglês / Espanhol', area: AREAS.ling, data: inglesEspanhol },
];

export const SUBJECT_BY_KEY = Object.fromEntries(SUBJECTS.map((s) => [s.key, s]));

// Posição da alternativa correta (0–4), repetida em ciclos para equilibrar o gabarito.
const POSITIONS = [
  1, 3, 0, 4, 2, 3, 1, 4, 0, 2, 4, 2, 0, 3, 1, 0, 2, 4, 1, 3,
  2, 4, 1, 0, 3, 1, 0, 3, 2, 4, 3, 2, 4, 1, 0, 4, 0, 1, 3, 2,
];

function buildOptions(correct, wrong, index) {
  const pos = POSITIONS[index % POSITIONS.length];
  let texts = [...wrong];
  texts.splice(pos, 0, correct);

  const letters = ['A', 'B', 'C', 'D', 'E'];
  return {
    options: texts.map((text, i) => ({ id: letters[i], text })),
    correctAnswer: letters[texts.indexOf(correct)],
  };
}

export const QUESTIONS = SUBJECTS.flatMap((subject) =>
  subject.data.map(([topic, difficulty, statement, correct, wrong, explanation], i) => {
    const { options, correctAnswer } = buildOptions(correct, wrong, i);
    return {
      id: `${subject.key}-${String(i + 1).padStart(2, '0')}`,
      subjectKey: subject.key,
      subject: subject.label,
      area: subject.area,
      topic,
      difficulty,
      statement,
      options,
      correctAnswer,
      explanation,
    };
  })
);

export const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
export const QUESTIONS_BY_SUBJECT = Object.fromEntries(
  SUBJECTS.map((s) => [s.key, QUESTIONS.filter((q) => q.subjectKey === s.key)])
);
