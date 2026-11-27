// Guardado local: SQLite (incluido en Node) en DATA_DIR; en Docker es el volumen «data»
import {mkdirSync, writeFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath} from 'node:url';

export const dataDir = process.env.DATA_DIR || fileURLToPath(new URL('../data/', import.meta.url));
export const picturesDir = dataDir + 'pictures/';
mkdirSync(picturesDir, {recursive:true});

const db = new DatabaseSync(process.env.DB_FILE || dataDir + 'escuela.db');
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS profile (id INTEGER PRIMARY KEY CHECK (id = 1), name TEXT NOT NULL, icon TEXT NOT NULL, image TEXT, look TEXT, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS stars (key TEXT PRIMARY KEY, created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS stories (id INTEGER PRIMARY KEY, drawing TEXT NOT NULL, read INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL DEFAULT 0,
    finished INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS story_pages (story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE, number INTEGER NOT NULL,
    text TEXT NOT NULL, choice TEXT, picture TEXT, PRIMARY KEY (story_id, number));
  CREATE TABLE IF NOT EXISTS activities (id INTEGER PRIMARY KEY, zone TEXT NOT NULL, kind TEXT NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL);
`);

const now = () => new Date().toISOString();
const firstBuddy = {name:'Pipo', icon:'🐥', image:null, look:''};

// SQLite devuelve objetos sin prototipo: se copian a objetos normales
export const getProfile = () => ({...(db.prepare('SELECT name, icon, image, look FROM profile WHERE id = 1').get() || firstBuddy)});
export const saveProfile = ({name, icon, image, look}) => db.prepare(`INSERT INTO profile (id, name, icon, image, look, updated_at) VALUES (1, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET name = excluded.name, icon = excluded.icon, image = excluded.image, look = excluded.look, updated_at = excluded.updated_at`)
  .run(name, icon, image, look, now());

export const starKeys = () => db.prepare('SELECT key FROM stars ORDER BY created_at').all().map(row => row.key);
export const addStar = key => db.prepare('INSERT OR IGNORE INTO stars (key, created_at) VALUES (?, ?)').run(key, now());

export const createStory = drawing => Number(db.prepare('INSERT INTO stories (drawing, created_at) VALUES (?, ?)').run(drawing, now()).lastInsertRowid);
export const storyExists = id => Boolean(db.prepare('SELECT 1 FROM stories WHERE id = ?').get(id));

// Guarda la página nueva y la elección que llevó a ella (la de la página anterior)
export function savePage(storyId, number, page, previousChoice) {
  if (previousChoice) db.prepare('UPDATE story_pages SET choice = ? WHERE story_id = ? AND number = ?').run(previousChoice, storyId, number - 1);
  db.prepare('INSERT OR REPLACE INTO story_pages (story_id, number, text) VALUES (?, ?, ?)').run(storyId, number, page.text);
  if (page.end) db.prepare('UPDATE stories SET finished = 1 WHERE id = ?').run(storyId);
}

export function savePicture(storyId, number, picture) {
  const file = storyId + '-' + number + '.webp';
  writeFileSync(picturesDir + file, picture.data);
  db.prepare('UPDATE story_pages SET picture = ? WHERE story_id = ? AND number = ?').run(file, storyId, number);
}

export const saveReading = (id, read, total) => db.prepare('UPDATE stories SET read = ?, total = ? WHERE id = ?').run(read, total, id);

export function listStories(page, limit) {
  const items = db.prepare(`SELECT s.id, s.created_at AS createdAt, s.finished, s.read, s.total,
      (SELECT count(*) FROM story_pages p WHERE p.story_id = s.id) AS pages,
      (SELECT text FROM story_pages p WHERE p.story_id = s.id AND p.number = 1) AS opening,
      (SELECT picture FROM story_pages p WHERE p.story_id = s.id AND p.picture IS NOT NULL ORDER BY p.number LIMIT 1) AS cover
    FROM stories s WHERE EXISTS (SELECT 1 FROM story_pages p WHERE p.story_id = s.id) ORDER BY s.id DESC LIMIT ? OFFSET ?`).all(limit, (page - 1) * limit);
  const {total} = db.prepare('SELECT count(*) AS total FROM stories s WHERE EXISTS (SELECT 1 FROM story_pages p WHERE p.story_id = s.id)').get();
  return {items:items.map(item => ({...item, finished:Boolean(item.finished)})), page, limit, total};
}

export function getStory(id) {
  const story = db.prepare('SELECT id, drawing, read, total, finished, created_at AS createdAt FROM stories WHERE id = ?').get(id);
  if (!story) return null;
  const pages = db.prepare('SELECT number, text, choice, picture FROM story_pages WHERE story_id = ? ORDER BY number').all(id);
  return {...story, finished:Boolean(story.finished), pages};
}

export const addActivity = (zone, kind, detail) => db.prepare('INSERT INTO activities (zone, kind, detail, created_at) VALUES (?, ?, ?, ?)')
  .run(zone, kind, JSON.stringify(detail), now());
