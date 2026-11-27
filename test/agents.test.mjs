import assert from 'node:assert/strict';
import test from 'node:test';
import {cleanReply, cleanScene, cleanTeach, explainProblem, fillProblem, pickProblem} from '../src/math-tutor.mjs';
import {characters, cleanAnswer, cleanVisit, preparedVisit} from '../src/time-travel.mjs';

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

test('subtracts down to zero, multiplies groups and only divides into equal shares', () => {
  const checks = {
    subtract:({a,b,total}) => total === a - b && total >= 0,
    multiply:({a,b,total}) => total === a * b && total <= 20,
    divide:({a,b,total}) => b > 0 && a % b === 0 && total === a / b
  };
  for (const [operation, check] of Object.entries(checks)) {
    for (let run = 0; run < 150; run++) {
      const problem = pickProblem(run % 3, Math.random, operation);
      assert(check(problem));
      assert.equal(problem.claim === problem.total, problem.mistake === 'right');
      assert(cleanTeach({problem}));
    }
  }
  assert.match(explainProblem({operation:'divide',a:12,b:3,total:4}), /4 en cada grupo/);
  assert.equal(cleanTeach({problem:{operation:'divide',a:5,b:2,total:2,claim:2}}), null);
  assert.equal(cleanTeach({problem:{operation:'divide',a:0,b:0,total:0,claim:0}}), null);
});

test('all six world visits provide grounded answers for their three suggested questions', () => {
  for (const character of ['stone','greek','norse','egypt','maya','china']) {
    assert.equal(characters[character].questions.length, 3);
    for (const question of characters[character].questions) {
      const answer = preparedVisit(cleanVisit({character,question}));
      assert(answer.reply && answer.before && answer.now);
    }
    assert.equal(preparedVisit(cleanVisit({character,question:'¿En qué año naciste?'})), undefined);
  }
});
