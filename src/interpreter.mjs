import {capsules} from './capsules.mjs';
import {normalizeSpanish, readMathFacts} from './math.mjs';

const aliases = [
  {anchor:'queria dormir', words:['dormir','tener donde dormir','buscaba donde dormir','queria un lugar para dormir','necesitaba descansar']},
  {anchor:'nido', words:['nidito','camita con ramas','camita de ramas','camita con ramitas','cama de ramas','cama de ramitas','camita con palitos','cama de palitos']},
  {anchor:'se durmio', words:['se echo a dormir','se quedo dormido','cerro los ojos']},
  {anchor:'regó', words:['regar','echo aguita','le puso agua']},
  {anchor:'mochila', words:['morral','maleta de clases','bolso escolar']},
  {anchor:'colegio', words:['cole','escuelita','ir a estudiar','fue a estudiar']},
  {anchor:'autobus', words:['buseta','microbus','colectivo','camion escolar']},
  {anchor:'bicicleta', words:['bici','bici para ir a clases','fuese en bici']},
  {anchor:'aprendio a pedalear', words:['ensayo con la bici','probo pedalear','ensayo a pedalear']},
  {anchor:'pelota', words:['pelotita','balon']},
  {anchor:'cuna', words:['cunita','cama de bebe']},
  {anchor:'cometa', words:['volantin','papagayo']},
  {anchor:'jugo', words:['juito','jugo de fruta']},
  {anchor:'focos led', words:['bombillas led','ampolletas led']},
  {anchor:'telefono', words:['telefono fijo','llamada por telefono']}
];
const contextMarkers = [
  /\b(?:al inicio|primero|al principio|antes(?! de\b)|de bebe|de nina|de nino|cuando era (?:bebe|nina|nino)|hace tiempo)\b/,
  /\b(?:despues de eso|despues(?! de\b)|luego|al crecer|mas tarde|con ella|con ellas|para eso|durante varios anos)\b/,
  /\b(?:al final|al terminar|ahora|hoy|por ultimo|finalmente|al acabar|como resultado|por eso)\b/
];
const clauseBoundary = /[.,;!?\r\n]+|\s+(?:pero|sino(?: que)?)\s+|\s+y\s+(?=(?:al final|luego|despues|ahora|hoy|se|su|sus|el|la|en total|pudo|por eso)\b)/;
const negative = /\b(?:no|nunca|jamas|tampoco)\b/;
const uncertainAlternative = /\b(?:o|tal vez|quizas)\b/;
const wordsOnly = text => normalizeSpanish(text).replace(/[^a-z0-9]+/g, ' ').trim();

function chooseCard(cards, clause) {
  const text = ' ' + wordsOnly(clause) + ' ';
  const candidates = [];
  for (const card of cards) {
    const words = [card.label, ...(card.words || [])].map(wordsOnly);
    for (const group of aliases) {
      const anchor = ' ' + wordsOnly(group.anchor) + ' ';
      if (words.some(word => (' ' + word + ' ').includes(anchor))) {
        words.push(...group.words.map(wordsOnly));
      }
    }
    const matches = words.filter(word => word && text.includes(' ' + word + ' '));
    if (matches.length) {
      candidates.push({id:card.id, strength:Math.max(...matches.map(word => word.split(' ').length))});
    }
  }
  candidates.sort((left, right) => right.strength - left.strength);
  if (candidates.length === 0) return {};
  if (candidates.length > 1 && (candidates[0].strength === candidates[1].strength || uncertainAlternative.test(clause))) {
    return {ambiguous:true};
  }
  return {id:candidates[0].id};
}

function explicitSlot(capsule, clause) {
  const markers = contextMarkers
    .map((pattern, slot) => ({slot, position:pattern.exec(clause)?.index ?? Infinity}))
    .sort((left, right) => left.position - right.position);
  if (markers[0].position < Infinity) return markers[0].slot;
  return capsule === 'story' && /\b(?:queria|tenia ganas de)\b/.test(clause) ? 0 : -1;
}

function readNarrativeFacts(capsule, activity, selected, input) {
  const claims = activity.steps.map(() => new Set());
  const ambiguous = new Set();
  const unplaced = new Set();
  let pendingSlot = -1;
  for (const clause of normalizeSpanish(input).split(clauseBoundary)) {
    if (/^\s*(?:antes|despues) de \w+(?:ar|er|ir)\s*$/.test(clause)) continue;
    const {id, ambiguous:multiple} = chooseCard(activity.cards, clause);
    let target = explicitSlot(capsule, clause);
    if (!id && !multiple) {
      if (clause.trim()) pendingSlot = target;
      continue;
    }
    if (target === -1) target = pendingSlot;
    pendingSlot = -1;
    if (negative.test(clause) || multiple) {
      ambiguous.add(target === -1 ? selected : target);
      continue;
    }
    if (target === -1) unplaced.add(id);
    else claims[target].add(id);
  }

  if (claims[selected].size === 0 && unplaced.size === 1) claims[selected].add([...unplaced][0]);
  if (claims[selected].size === 0 && unplaced.size > 1) ambiguous.add(selected);

  const parts = {};
  for (const [slot, values] of claims.entries()) {
    if (values.size === 1) parts[slot] = [...values][0];
    else if (values.size > 1) ambiguous.add(slot);
  }
  return {parts, uncertainSlots:[...ambiguous].filter(slot => !Object.hasOwn(parts, slot)).sort()};
}

export function interpretExplanation(capsule, activity, slot, input) {
  if (!activity?.steps?.[slot] || typeof input !== 'string') return {parts:{}, uncertainSlots:[]};
  return capsule === 'math' ? readMathFacts(input, slot) : readNarrativeFacts(capsule, activity, slot, input);
}

export function interpretActivityParts(capsule, activity, slot, input) {
  return interpretExplanation(capsule, activity, slot, input).parts;
}

export function localParts(capsule, episode, slot, input) {
  return interpretActivityParts(capsule, capsules[capsule]?.cases?.[episode], slot, input);
}
