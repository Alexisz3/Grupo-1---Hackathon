import assert from 'node:assert/strict';
import test from 'node:test';
import {capsules, filterParts} from '../src/capsules.mjs';
import {localParts} from '../src/interpreter.mjs';

test('every case has a different example and a complete, solvable map', () => {
  for (const {cases} of Object.values(capsules)) {
    assert(cases.length >= 10);
    assert.equal(new Set(cases.map(activity => activity.title)).size, cases.length);
    assert.equal(new Set(cases.map(activity => activity.setup)).size, cases.length);
    for (const activity of cases) {
      const ids = new Set(activity.cards.map(card => card.id));
      assert.equal(ids.size, activity.cards.length);
      assert.equal(activity.steps.length, 3);
      assert(activity.steps.every(step => ids.has(step.answer)));
    }
  }
});

test('extracts an explicitly incomplete explanation without guessing the missing step', () => {
  assert.deepEqual(localParts('math',0,0,'Había tres y ahora hay cinco.'), {0:'3', 2:'5'});
  assert.deepEqual(localParts('math',0,1,'dos'), {1:'2'});
  assert.deepEqual(localParts('story',0,1,'Hizo un nido'), {1:'nest'});
  assert.deepEqual(localParts('history',0,0,'De bebé dormía en una cuna. Hoy va a la escuela.'), {0:'crib',2:'school'});
});

test('ignores negation, ambiguous unplaced facts, and out-of-capsule model results', () => {
  assert.deepEqual(localParts('history',0,0,'No iba a la escuela.'), {});
  assert.deepEqual(localParts('story',0,0,'Hizo un nido. Se durmió.'), {});
  assert.deepEqual(filterParts(capsules.math.cases[0], {0:3,1:999,2:'5',3:'4'}), {0:'3',2:'5'});
});
