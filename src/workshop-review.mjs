export function inspectMap(steps, values, uncertain = []) {
  const knownMistake = steps.findIndex((step, index) =>
    values[index] !== null && values[index] !== step.answer && !uncertain.includes(index));
  if (knownMistake >= 0) return {kind:'mistake', index:knownMistake};
  if (uncertain.length) return {kind:'clarify', index:uncertain[0]};
  const missing = values.indexOf(null);
  return missing === -1 ? null : {kind:'missing', index:missing};
}

export function countUnderstood(steps, values, uncertain = []) {
  return steps.filter((step, index) => values[index] === step.answer && !uncertain.includes(index)).length;
}
