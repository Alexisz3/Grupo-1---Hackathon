import {useEffect, useState} from 'react';
import {schoolService} from '../services/school-service.js';
import {session} from '../services/session.js';

export const childIcons = ['🐥', '🐢', '🐰', '🦊', '🐼', '🦄', '🐸', '🦖'];

// El niño que juega: elige o crea su perfil, y su personaje y estrellas se cargan y guardan con su ID
export function useSchool() {
  const [phase, setPhase] = useState('loading');
  const [children, setChildren] = useState([]);
  const [buddy, setBuddy] = useState(null);
  const [progress, setProgress] = useState({});
  const [saveError, setSaveError] = useState('');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(childIcons[0]);

  useEffect(() => { start(); }, []);

  // Los perfiles que conoce este dispositivo; si había uno jugando, sigue ese
  async function start() {
    const known = await schoolService.findUsers(session.knownIds()).catch(() => []);
    session.knownIds().filter(id => !known.some(child => child.id === id)).forEach(session.forget);
    setChildren(known);
    const current = known.find(child => child.id === session.current());
    if (current) enter(current);
    else setPhase('pick');
  }

  async function enter(child) {
    session.use(child.id);
    setBuddy(child);
    setProgress({});
    setPhase('ready');
    const keys = await schoolService.stars().catch(() => []);
    setProgress(Object.fromEntries(keys.map(key => [key, true])));
  }

  async function create() {
    if (!name.trim()) return;
    try {
      const child = await schoolService.createUser(name.trim(), icon);
      setChildren(value => [...value, child]);
      setName('');
      enter(child);
    } catch (failure) { setSaveError(failure.message); }
  }

  function switchChild() {
    session.use(null);
    setBuddy(null);
    setPhase('pick');
    start();
  }

  function saveBuddy(next) {
    const child = {...buddy, ...next};
    setBuddy(child);
    setChildren(value => value.map(item => item.id === child.id ? child : item));
    schoolService.saveProfile(next).then(() => setSaveError(''), failure => setSaveError(failure.message));
  }

  function addStar(key) {
    setProgress(value => ({...value, [key]:true}));
    schoolService.addStar(key).catch(failure => setSaveError(failure.message));
  }

  return {phase, children, buddy, progress, saveError, saveBuddy, addStar, enter, switchChild,
    form:{name, setName, icon, setIcon, create}};
}
