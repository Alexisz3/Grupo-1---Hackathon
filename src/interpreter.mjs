import {capsules, filterParts, interpretWords} from './capsules.mjs';
import {extract} from './math.mjs';

export function localParts(capsule, episode, slot, input) {
  if (capsule !== 'math') return interpretWords(capsule, episode, input, slot);
  const parts = extract(input);
  if (Object.keys(parts).length === 0 && /^(?:[0-9]+|\p{L}+)[.!]?$/u.test(input.trim())) {
    parts[slot] = extract('son ' + input.trim())[2];
  }
  return filterParts(capsules[capsule].cases[episode], parts);
}
