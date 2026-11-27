import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import test from 'node:test';

process.env.DATA_DIR = mkdtempSync(tmpdir() + '/escuela-') + '/';
const db = await import('../src/db.mjs');

test('each child keeps their own character and stars', () => {
  const rex = db.createUser('Rex', '🦖');
  const lila = db.createUser('Lila', '🐢');
  assert.notEqual(rex.id, lila.id);
  assert(db.userExists(rex.id) && !db.userExists('no-es-un-id'));
  db.saveProfile(rex.id, {name:'Rex', icon:'🦖', image:'data:image/webp;base64,AAA', look:'Un dinosaurio verde'});
  assert.deepEqual(db.getProfile(rex.id), {id:rex.id, name:'Rex', icon:'🦖', image:'data:image/webp;base64,AAA', look:'Un dinosaurio verde'});
  assert.equal(db.getProfile(lila.id).image, null);
  db.addStar(rex.id, 'math:0');
  db.addStar(rex.id, 'math:0');
  assert.deepEqual(db.starKeys(rex.id), ['math:0']);
  assert.deepEqual(db.starKeys(lila.id), []);
  assert.deepEqual(db.findProfiles([lila.id, 'x', '00000000-0000-0000-0000-000000000000']).map(user => user.name), ['Lila']);
});

test('a story belongs to one child and is saved page by page', () => {
  const ana = db.createUser('Ana', '🐰');
  const leo = db.createUser('Leo', '🐥');
  const id = db.createStory(ana.id, 'data:image/png;base64,AAA');
  assert(db.ownsStory(ana.id, id) && !db.ownsStory(leo.id, id));
  db.savePage(id, 1, {text:'Había una vez.'});
  db.savePage(id, 2, {text:'Y luego.', end:true}, '🦋 Seguir a la mariposa');
  db.savePicture(id, 2, {data:Buffer.from('webp')});
  db.saveReading(id, 3, 5);
  const story = db.getStory(ana.id, id);
  assert.equal(story.finished, true);
  assert.deepEqual(story.pages.map(page => [page.number, page.choice]), [[1, '🦋 Seguir a la mariposa'], [2, null]]);
  assert.match(story.pages[1].picture, /^[0-9a-f-]{36}\.webp$/);
  assert.equal(story.read, 3);
  assert.equal(db.getStory(leo.id, id), null);
  db.createStory(ana.id, 'data:image/png;base64,BBB'); // sin páginas: no aparece en «Mis cuentos»
  assert.equal(db.listStories(ana.id, 1, 20).total, 1);
  assert.equal(db.listStories(leo.id, 1, 20).total, 0);
});
