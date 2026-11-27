import assert from 'node:assert/strict';
import test from 'node:test';
import {capsules} from '../src/capsules.mjs';
import {interpretActivityParts, interpretExplanation, localParts} from '../src/interpreter.mjs';
import {extract} from '../src/math.mjs';

test('reads the child’s explanation without filling missing mathematics slots', () => {
  assert.deepEqual(localParts('math',0,0,'Tenía tres y ahora tengo cinco.'), {0:'3',2:'5'});
  assert.deepEqual(localParts('math',0,2,'Me regalaron dos, tenía tres.'), {0:'3',1:'2'});
  assert.deepEqual(localParts('math',0,2,'tres más dos'), {0:'3',1:'2'});
  assert.deepEqual(localParts('math',0,1,'Son dos semillas.'), {1:'2'});
});

test('keeps an explicit arithmetic mistake available for correction', () => {
  assert.deepEqual(localParts('math',0,2,'tres más dos son seis'), {0:'3',1:'2',2:'6'});
  assert.deepEqual(localParts('math',0,2,'En total había seis.'), {2:'6'});
  assert.deepEqual(localParts('math',0,2,'Había tres semillas en total había seis.'), {0:'3',2:'6'});
  assert.deepEqual(localParts('math',0,2,'En total hay catorce.'), {2:'14'});
  assert.deepEqual(localParts('math',0,1,'No son dos. Llegaron cuatro.'), {1:'4'});
  assert.deepEqual(extract('tenía 3, puse 2 y quedaron 5'), {0:3,1:2,2:5});
});

test('understands alternative wordings in all narrative areas', () => {
  assert.deepEqual(localParts('story',0,2,'Lila quería un lugar para dormir'), {0:'sleep'});
  assert.deepEqual(localParts('story',0,1,'Se armó una camita con ramas'), {1:'nest'});
  assert.deepEqual(localParts('story',0,1,'Antes de dormir, se armó una camita con ramas.'), {1:'nest'});
  assert.deepEqual(localParts('history',1,2,'Antes iba en buseta. Hoy, va en bici.'), {0:'bus',2:'bike'});
  assert.deepEqual(localParts('history',0,2,'Ahora va al cole.'), {2:'school'});
});

test('associates an explicit wrong narrative choice with the slot being discussed', () => {
  assert.deepEqual(localParts('story',0,1,'Una pelota.'), {1:'play'});
  assert.deepEqual(localParts('history',1,0,'Caminando'), {0:'walk'});
  assert.deepEqual(localParts('history',1,2,'Antes, caminando'), {0:'walk'});
});

test('returns the slot to clarify without turning a negation or ambiguity into a fact', () => {
  const {math, story, history} = capsules;
  assert.deepEqual(interpretExplanation('story',story.cases[0],0,'Quería dormir o jugar. Después hizo un nido.'), {parts:{1:'nest'},uncertainSlots:[0]});
  assert.deepEqual(interpretExplanation('math',math.cases[0],2,'Había tres. El total es cinco o seis.'), {parts:{0:'3'},uncertainSlots:[2]});
  assert.deepEqual(interpretExplanation('history',history.cases[0],2,'No iba a la escuela'), {parts:{},uncertainSlots:[2]});
  assert.deepEqual(interpretExplanation('story',story.cases[0],0,'Hizo un nido. Se durmió.'), {parts:{},uncertainSlots:[0]});
});

test('can interpret a separate transfer case supplied by its activity data', () => {
  const transfer = {
    steps:[{label:'Motivo'},{label:'Qué hizo'},{label:'Final'}],
    cards:[{id:'light',label:'Encendió la linterna',words:['linterna']}]
  };
  assert.deepEqual(interpretActivityParts('story',transfer,1,'Usó una linterna.'), {1:'light'});
});
