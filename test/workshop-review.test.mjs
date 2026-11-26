import assert from 'node:assert/strict';
import test from 'node:test';
import {inspectMap, countUnderstood} from '../src/workshop-review.mjs';
import {getActivity} from '../src/learning-content.mjs';
import {interpretExplanation} from '../src/interpreter.mjs';

test('dos explicaciones parciales producen dos preguntas diferentes', () => {
  const activity = getActivity('math', 0);
  const review = input => {
    const {parts} = interpretExplanation('math', activity, 0, input);
    const values = activity.steps.map((_, index) => parts[index] ?? null);
    return inspectMap(activity.steps, values);
  };
  assert.deepEqual(review('Había tres y ahora hay cinco.'), {kind:'missing', index:1});
  assert.deepEqual(review('Había tres y llegaron dos.'), {kind:'missing', index:2});
});

test('un error reconocido tiene prioridad y mantiene el resto del mapa', () => {
  const {steps} = getActivity('math', 0);
  const initial = ['3', '2', '6'];
  assert.deepEqual(inspectMap(steps, initial), {kind:'mistake', index:2});
  assert.equal(countUnderstood(steps, initial), 2);
  assert.equal(inspectMap(steps, ['3', '2', '5']), null);
});

test('una interpretación tentativa se confirma antes de corregirla', () => {
  const {steps} = getActivity('math', 0);
  const values = ['3', '4', null];
  assert.deepEqual(inspectMap(steps, values, [1]), {kind:'clarify', index:1});
  assert.equal(countUnderstood(steps, values, [1]), 1);
  assert.deepEqual(inspectMap(steps, ['3','2',null]), {kind:'missing', index:2});
});
