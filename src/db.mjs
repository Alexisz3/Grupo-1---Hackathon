// Guardado por niño: SQLite (incluido en Node) en DATA_DIR; en Docker es el volumen «data».
// Cada niño tiene un ID secreto (UUID) y todo lo suyo se guarda y se lee con ese ID.
import {randomUUID} from 'node:crypto';
import {mkdirSync, writeFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath} from 'node:url';

export const dataDir = process.env.DATA_DIR || fileURLToPath(new URL('../data/', import.meta.url));
export const picturesDir = dataDir + 'pictures/';
mkdirSync(picturesDir, {recursive:true});

// escuela-v2: la base anterior (un solo perfil) queda como respaldo en escuela.db
const db = new DatabaseSync(process.env.DB_FILE || dataDir + 'escuela-v2.db');
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, name TEXT NOT NULL, icon TEXT NOT NULL, image TEXT, look TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS stars (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, key TEXT NOT NULL, created_at TEXT NOT NULL,
    PRIMARY KEY (user_id, key));
  CREATE TABLE IF NOT EXISTS stories (id INTEGER PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, drawing TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL DEFAULT 0, finished INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS stories_by_user ON stories (user_id, id);
  CREATE TABLE IF NOT EXISTS story_pages (story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE, number INTEGER NOT NULL,
    text TEXT NOT NULL, choice TEXT, picture TEXT, PRIMARY KEY (story_id, number));
  CREATE TABLE IF NOT EXISTS activities (id INTEGER PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, zone TEXT NOT NULL,
    kind TEXT NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL);
`);

const now = () => new Date().toISOString();
// SQLite devuelve objetos sin prototipo: se copian a objetos normales
const plain = row => row && {...row};

export const isUserId = value => typeof value === 'string' && /^[0-9a-f-]{36}$/.test(value);
export const userExists = id => isUserId(id) && Boolean(db.prepare('SELECT 1 FROM users WHERE id = ?').get(id));

export function createUser(name, icon) {
  const id = randomUUID();
  db.prepare('INSERT INTO users (id, name, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(id, name, icon, now(), now());
  return getProfile(id);
}

export const getProfile = id => plain(db.prepare('SELECT id, name, icon, image, look FROM users WHERE id = ?').get(id)) || null;
export const findProfiles = ids => ids.filter(isUserId).map(getProfile).filter(Boolean);
export const saveProfile = (id, {name, icon, image, look}) => db.prepare('UPDATE users SET name = ?, icon = ?, image = ?, look = ?, updated_at = ? WHERE id = ?')
  .run(name, icon, image, look, now(), id);

export const starKeys = userId => db.prepare('SELECT key FROM stars WHERE user_id = ? ORDER BY created_at').all(userId).map(row => row.key);
export const addStar = (userId, key) => db.prepare('INSERT OR IGNORE INTO stars (user_id, key, created_at) VALUES (?, ?, ?)').run(userId, key, now());

export const createStory = (userId, drawing) => Number(db.prepare('INSERT INTO stories (user_id, drawing, created_at) VALUES (?, ?, ?)')
  .run(userId, drawing, now()).lastInsertRowid);
export const ownsStory = (userId, id) => Number.isInteger(id) && Boolean(db.prepare('SELECT 1 FROM stories WHERE id = ? AND user_id = ?').get(id, userId));

// Guarda la página nueva y la elección que llevó a ella (la de la página anterior)
export function savePage(storyId, number, page, previousChoice) {
  if (previousChoice) db.prepare('UPDATE story_pages SET choice = ? WHERE story_id = ? AND number = ?').run(previousChoice, storyId, number - 1);
  db.prepare('INSERT OR REPLACE INTO story_pages (story_id, number, text) VALUES (?, ?, ?)').run(storyId, number, page.text);
  if (page.end) db.prepare('UPDATE stories SET finished = 1 WHERE id = ?').run(storyId);
}

// Nombre aleatorio: nadie puede adivinar la ilustración de otro niño
export function savePicture(storyId, number, picture) {
  const file = randomUUID() + '.webp';
  writeFileSync(picturesDir + file, picture.data);
  db.prepare('UPDATE story_pages SET picture = ? WHERE story_id = ? AND number = ?').run(file, storyId, number);
}

export const saveReading = (id, read, total) => db.prepare('UPDATE stories SET read = ?, total = ? WHERE id = ?').run(read, total, id);

export function listStories(userId, page, limit) {
  const items = db.prepare(`SELECT s.id, s.created_at AS createdAt, s.finished, s.read, s.total,
      (SELECT count(*) FROM story_pages p WHERE p.story_id = s.id) AS pages,
      (SELECT text FROM story_pages p WHERE p.story_id = s.id AND p.number = 1) AS opening,
      (SELECT picture FROM story_pages p WHERE p.story_id = s.id AND p.picture IS NOT NULL ORDER BY p.number LIMIT 1) AS cover
    FROM stories s WHERE s.user_id = ? AND EXISTS (SELECT 1 FROM story_pages p WHERE p.story_id = s.id) ORDER BY s.id DESC LIMIT ? OFFSET ?`)
    .all(userId, limit, (page - 1) * limit);
  const {total} = db.prepare('SELECT count(*) AS total FROM stories s WHERE s.user_id = ? AND EXISTS (SELECT 1 FROM story_pages p WHERE p.story_id = s.id)').get(userId);
  return {items:items.map(item => ({...item, finished:Boolean(item.finished)})), page, limit, total};
}

export function getStory(userId, id) {
  const story = db.prepare('SELECT id, drawing, read, total, finished, created_at AS createdAt FROM stories WHERE id = ? AND user_id = ?').get(id, userId);
  if (!story) return null;
  const pages = db.prepare('SELECT number, text, choice, picture FROM story_pages WHERE story_id = ? ORDER BY number').all(id).map(plain);
  return {...story, finished:Boolean(story.finished), pages};
}

export const addActivity = (userId, zone, kind, detail) => db.prepare('INSERT INTO activities (user_id, zone, kind, detail, created_at) VALUES (?, ?, ?, ?, ?)')
  .run(userId, zone, kind, JSON.stringify(detail), now());
