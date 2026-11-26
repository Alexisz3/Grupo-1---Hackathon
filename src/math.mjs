export function normalizeSpanish(value) {
  return value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

const countingWords = [
  'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciseis', 'diecisiete',
  'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidos', 'veintitres',
  'veinticuatro', 'veinticinco', 'veintiseis', 'veintisiete', 'veintiocho', 'veintinueve'
];
const numerals = new Map(countingWords.map((word, number) => [word, String(number)]));
numerals.set('una', '1');
numerals.set('un', '1');
const numberWords = new RegExp('\\b(?:' + [...numerals.keys()].join('|') + ')\\b', 'g');
const number = '(?<![\\d-])([0-9]{1,2})(?!\\d|[.,]\\d|\\s*%)';
const equation = new RegExp(number + '\\s*(?:\\+|mas)\\s*' + number +
  '(?:\\s*(?:=|son|es|da|hacen|suman|quedan)\\s*' + number + ')?');
const quantities = new RegExp(number, 'g');

const patterns = [
  new RegExp('(?:\\b(?:al principio|al inicio|primero|antes)(?:\\s+(?:habian?|tenia|eran|hay))?|\\b(?:habian?|tenia|empece con|empiezo con|arranque con|comence con))\\s+' + number, 'dg'),
  new RegExp('\\b(?:llegaron|llego|agrego|agregue|agregaron|agregamos|me dieron|me regalaron|recibi|sumo|sumaron|sume|anadi|anadimos|puse|pusieron|despues|luego|mas)\\s+' + number + '|' + number + '\\s+(?:semillas?\\s+)?mas\\b', 'dg'),
  new RegExp('\\b(?:en total|el total|al final|ahora|en conjunto|todos juntos|juntas)(?:\\s+(?:hay|habian?|tengo|tenia|tenemos|son|eran|es|quedan|quedaron))?\\s+' + number + '|\\b(?:quedan|quedaron|da|da como resultado|dio|igual a|suma)\\s+' + number, 'dg')
];
const possibleReply = new RegExp(
  '^(?:(?:yo digo que|creo que|pienso que|son|eran|es|hay|tengo)\\s+)*' +
  number + '(?:\\s+(?:semillas?|plantitas?|juntas|juntos|en total|al principio|al inicio))?$', 'u'
);
const negative = /\b(?:no|nunca|jamas|tampoco)\b/;
const alternative = /\b(?:o|quizas|tal vez)\b/;

function namedQuantities(clause) {
  const claims = new Map();
  for (const [slot, pattern] of patterns.entries()) {
    for (const match of clause.matchAll(pattern)) {
      const [amountPosition] = match.indices[1] ?? match.indices[2];
      const previous = claims.get(amountPosition);
      // Prefer the fuller phrase when two patterns describe the same number.
      if (!previous || match.index < previous.start) {
        claims.set(amountPosition, {slot, value:match[1] ?? match[2], start:match.index});
      }
    }
  }
  return [...claims.values()];
}

export function readMathFacts(input, selected = 2) {
  const normalized = normalizeSpanish(input)
    .replace(/\b\d+[.,/]\d+\b/g, 'cantidad')
    .replace(numberWords, word => numerals.get(word));
  const claims = [new Set(), new Set(), new Set()];
  const ambiguous = new Set();
  const unplaced = new Set();
  const clauses = normalized.split(/[.,;!?\r\n]+|\s+(?:y|pero|sino(?: que)?)\s+/);

  function add(slot, value) {
    if (value !== undefined) claims[slot].add(String(Number(value)));
  }

  for (const rawClause of clauses) {
    const clause = rawClause.trim();
    const values = [...clause.matchAll(quantities)];
    if (!values.length) continue;

    const operation = equation.exec(clause);
    const explicit = namedQuantities(clause);
    const targets = operation ? [0, 1, ...(operation[3] === undefined ? [] : [2])]
      : explicit.map(({slot}) => slot);
    if (negative.test(clause) || (values.length > 1 && alternative.test(clause))) {
      for (const slot of targets.length ? targets : [selected]) ambiguous.add(slot);
      continue;
    }

    if (operation) {
      operation.slice(1).forEach((value, slot) => add(slot, value));
      continue;
    }

    if (targets.length) {
      for (const {slot, value} of explicit) add(slot, value);
      continue;
    }

    const reply = possibleReply.exec(clause);
    if (reply) unplaced.add(reply[1]);
  }

  if (claims[selected].size === 0 && unplaced.size === 1) add(selected, [...unplaced][0]);
  if (unplaced.size > 1 && claims[selected].size === 0) ambiguous.add(selected);

  const parts = {};
  for (const [slot, values] of claims.entries()) {
    if (values.size === 1) parts[slot] = [...values][0];
    else if (values.size > 1) ambiguous.add(slot);
  }
  return {parts, uncertainSlots:[...ambiguous].filter(slot => !Object.hasOwn(parts, slot)).sort()};
}

export function extract(input) {
  const {parts} = readMathFacts(input);
  return Object.fromEntries(Object.entries(parts).map(([slot,value]) => [slot,Number(value)]));
}
