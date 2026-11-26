import assert from 'node:assert/strict';
import test from 'node:test';
import {cleanReply, cleanScene, cleanTeach, fillProblem, pickProblem} from '../src/math-tutor.mjs';
import {characters, cleanAnswer, cleanVisit} from '../src/time-travel.mjs';

test('picks problems the code can check, with two or more things per group', () => {
  for (let run = 0; run < 500; run++) {
    const level = run % 3;
    const problem = pickProblem(level);
    assert.equal(problem.a + problem.b, problem.total);
    assert(problem.a >= 2 && problem.b >= 2 && problem.total <= [5, 10, 20][level]);
    assert.equal(problem.claim === problem.total, problem.mistake === 'right');
  }
});

test('accepts only scenes with each marker once and no numbers from the model', () => {
  const scene = {item:'Manzanas', emoji:'🍎 rojas', setup:'{hero} juntó {a} manzanas. Lila le dio {b} más.'};
  assert.deepEqual(cleanScene(scene), {item:'manzanas', emoji:'🍎', setup:scene.setup});
  assert.equal(cleanScene({...scene, setup:'{hero} juntó 3 manzanas y {a} y {b}.'}), null);
  assert.equal(cleanScene({...scene, setup:'{hero} juntó {a} manzanas.'}), null);
  assert.equal(cleanScene({...scene, setup:'{hero} juntó {a} y después encontró {b}.'}), null);
  const problem = fillProblem(cleanScene(scene), {a:3, b:2, total:5, claim:6}, 'Pipo');
  assert.equal(problem.setup, 'Pipo juntó 3 manzanas. Lila le dio 2 más.');
  assert.equal(problem.said, '¡Ya sé! Son 6 manzanas.');
});

test('the teaching reply always states the right sum', () => {
  const problem = {a:3, b:2, total:5, claim:6};
  assert.equal(cleanReply({reply:'¡Gracias! Conté de más.'}, problem), '¡Gracias! Conté de más. ¡3 y 2 son 5!');
  assert.equal(cleanReply({reply:'Ahora sé que son 5.'}, problem), 'Ahora sé que son 5.');
  assert.equal(cleanReply(null, problem), '¡Gracias, profe! Ahora entiendo: 3 y 2 son 5.');
  assert.equal(cleanTeach({problem:{a:3, b:2, total:6, claim:6}}), null);
  assert.equal(cleanTeach({problem:{a:3, b:2, total:5, claim:'6'}}), null);
});

test('time travel only talks with known characters', () => {
  assert.equal(cleanVisit({character:'toString', question:'hola'}), null);
  assert.equal(cleanVisit({character:'rosa', question:'  '}), null);
  assert.equal(cleanVisit({character:'kusi', question:'¿Qué comían?'}).character, characters.kusi);
  assert.equal(cleanAnswer({before:'x'}), null);
});
