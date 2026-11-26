import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import test from 'node:test';

process.env.DATA_DIR = mkdtempSync(tmpdir() + '/escuela-') + '/';
const db = await import('../src/db.mjs');

test('keeps the character and stars between visits', () => {
  assert.equal(db.getProfile().name, 'Pipo');
  db.saveProfile({name:'Rex', icon:'🦖', image:null, look:'Un dinosaurio verde'});
  db.saveProfile({name:'Rex', icon:'🦖', image:'data:image/webp;base64,AAA', look:'Un dinosaurio verde'});
  assert.deepEqual(db.getProfile(), {name:'Rex', icon:'🦖', image:'data:image/webp;base64,AAA', look:'Un dinosaurio verde'});
  db.addStar('math:0');
  db.addStar('math:0');
  assert.deepEqual(db.starKeys(), ['math:0']);
});

test('saves a story page by page with the choice that led to each page', () => {
  const id = db.createStory('data:image/png;base64,AAA');
  db.savePage(id, 1, {text:'Había una vez.'});
  db.savePage(id, 2, {text:'Y luego.', end:true}, '🦋 Seguir a la mariposa');
  db.savePicture(id, 2, {data:Buffer.from('webp')});
  db.saveReading(id, 3, 5);
  const story = db.getStory(id);
  assert.equal(story.finished, true);
  assert.deepEqual(story.pages.map(page => [page.number, page.choice, page.picture]), [[1, '🦋 Seguir a la mariposa', null], [2, null, id + '-2.webp']]);
  assert.equal(story.read, 3);
  db.createStory('data:image/png;base64,BBB'); // sin páginas: no aparece en «Mis cuentos»
  const shelf = db.listStories(1, 20);
  assert.equal(shelf.total, 1);
  assert.equal(shelf.items[0].cover, id + '-2.webp');
  assert.equal(db.listStories(2, 20).items.length, 0);
});
