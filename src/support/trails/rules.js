// A API valida nota e nota de corte como inteiro de 0 a 100, mas o input
// type="number" aceita decimal e notação científica ("2e+30"), que chegava no
// back e voltava como erro genérico de validação.
const empty = (val) => val === null || val === undefined || val === '';
const inRange = (val) => Number.isInteger(val) && val >= 0 && val <= 100;
const message = 'Informe um número inteiro de 0 a 100';

// Nota de corte do nível é opcional: sem corte o nível não reprova ninguém.
export const scoreRules = [(val) => empty(val) || inRange(val) || message];

// Concluir o nível é avaliar, então a nota é obrigatória (R9).
export const requiredScoreRules = [
  (val) => !empty(val) || 'Informe a nota do nível',
  (val) => inRange(val) || message,
];

export const answerRules = [
  (val) => !!String(val ?? '').trim() || 'Escreva a resposta ao colaborador',
];

export default scoreRules;
