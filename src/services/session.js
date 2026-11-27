// El niño que está jugando. Cada pedido a la API lleva su ID secreto en la cabecera X-User,
// y este dispositivo recuerda los niños que se crearon en él (solo sus IDs, en el navegador).
const devicesKey = 'escuela.ninos', currentKey = 'escuela.actual';
let userId = null;

const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };

export const session = {
  headers: (extra = {}) => userId ? {...extra, 'X-User':userId} : extra,
  current: () => read(currentKey, null),
  knownIds: () => read(devicesKey, []),
  use(id) {
    userId = id;
    write(currentKey, id);
    if (id && !read(devicesKey, []).includes(id)) write(devicesKey, [...read(devicesKey, []), id]);
  },
  forget: id => write(devicesKey, read(devicesKey, []).filter(known => known !== id))
};
