import assert from 'node:assert/strict';
import test from 'node:test';
import {cleanCharacter, cleanPage, cleanRequest, storyLength} from '../src/story.mjs';
import {matchWords} from '../src/utils/reading.mjs';

test('marks words read in order, ignoring accents, punctuation and filler words', () => {
  const words = matchWords('¡Pipo saltó al río!', 'pipo eh salto al rio');
  assert.deepEqual(words.map(word => word.ok), [true, true, true, true]);
  assert.deepEqual(matchWords('El sol brilla mucho', 'el brilla').map(word => word.ok), [true, false, true, false]);
});

test('rejects a story that is already complete or has empty pages', () => {
  const page = {text:'Había una vez.', choice:'Seguir'};
  assert.equal(cleanRequest({place:'mar', pages:Array(storyLength).fill(page)}), null);
  assert.equal(cleanRequest({place:'mar', pages:[{text:'', choice:'x'}]}), null);
  assert.equal(cleanRequest({place:'', pages:[]}), null);
  assert.deepEqual(cleanRequest({hero:{name:'  Lila '}, place:'bosque', pages:[]}).hero, {name:'Lila', look:''});
  assert.equal(cleanRequest({hero:{look:'Un gato naranja en la luna'}, pages:[]}).place, 'el mundo que dibujó el niño');
});

test('keeps the model page within shape and lets the server decide the ending', () => {
  assert.equal(cleanPage({text:'Hola.', options:['Una']}, false), null);
  const page = cleanPage({text:'Hola.', scene:'🐥🌲🌙', question:'¿Y ahora?', options:['a','b','c']}, false);
  assert.deepEqual(page.scene, ['🐥','🌲','🌙']);
  assert.equal(page.options.length, 2);
  assert.deepEqual(cleanPage({text:'Fin.', options:['a','b'], end:false}, true).options, []);
  assert.deepEqual(cleanPage({text:'Hola.', options:['✨ + Explorar', '🌳 Mirar']}, false).options, ['✨ Explorar', '🌳 Mirar']);
  // La página de dibujar no trae opciones y sin pedido de dibujo no sirve
  assert.equal(cleanPage({text:'Hola.', question:'¿Qué hace ahora?'}, false, true).draw, '¡Dibuja lo que apareció ahora en el cuento!');
  assert.equal(cleanPage({text:'Hola.', question:'¡Dibuja la llave!'}, false, true).draw, '¡Dibuja la llave!');
  assert.deepEqual(cleanPage({text:'Hola.', draw:'¡Dibuja la llave!', options:['a','b']}, false, true).options, []);
});

test('a character portrait needs an illustration prompt', () => {
  assert.equal(cleanCharacter({look:'Un dragón verde'}), null);
  assert.deepEqual(cleanCharacter({look:' Un dragón  verde ', picture:'a green baby dragon'}), {look:'Un dragón verde', picture:'a green baby dragon'});
});

test('the first page has to open like a story', () => {
  const page = {text:'Rex es un dinosaurio verde. Está feliz.', options:['🌳 Explorar', '🍎 Comer']};
  assert.equal(cleanPage(page, false, false, true), null);
  assert.equal(cleanPage({...page, text:'Había una vez un dinosaurio llamado Rex.'}, false, false, true).text, 'Había una vez un dinosaurio llamado Rex.');
  assert.ok(cleanPage(page, false, false, false));
});
