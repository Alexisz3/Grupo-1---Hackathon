import {session} from './session.js';

// Lo que se guarda de cada niño en la base local (SQLite): personaje, estrellas, cuentos y actividades
async function call(method, path, body) {
  const result = await fetch(path, {method, headers:session.headers(body ? {'Content-Type':'application/json'} : {}), body:body && JSON.stringify(body)});
  if (!result.ok) throw new Error((await result.json().catch(() => ({}))).error || 'No pude guardar');
  return result.json();
}

export const schoolService = {
  createUser: (name, icon) => call('POST', '/api/users', {name, icon}),
  findUsers: async ids => (await call('POST', '/api/users/lookup', {ids})).items,
  profile: () => call('GET', '/api/profile'),
  saveProfile: buddy => call('PUT', '/api/profile', buddy),
  stars: async () => (await call('GET', '/api/stars')).keys,
  addStar: key => call('POST', '/api/stars', {key}),
  createStory: async drawing => (await call('POST', '/api/stories', {drawing})).id,
  saveReading: (id, read, total) => call('POST', '/api/stories/' + id + '/reading', {read, total}),
  stories: (page, limit = 20) => call('GET', '/api/stories?page=' + page + '&limit=' + limit),
  story: id => call('GET', '/api/stories/' + id),
  addActivity: (zone, kind, detail) => call('POST', '/api/activities', {zone, kind, detail})
};
