import {useEffect, useState} from 'react';
import {schoolService} from '../services/school-service.js';

const firstBuddy = {name:'Pipo', icon:'🐥', image:null, look:''};

// Personaje y estrellas del aula, cargados de la base local y guardados en cada cambio
export function useSchool() {
  const [buddy, setBuddy] = useState(firstBuddy);
  const [progress, setProgress] = useState({});
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    schoolService.profile().then(setBuddy, () => setSaveError('No pude cargar tu personaje'));
    schoolService.stars().then(keys => setProgress(Object.fromEntries(keys.map(key => [key, true]))), () => {});
  }, []);

  function saveBuddy(next) {
    setBuddy(next);
    schoolService.saveProfile(next).then(() => setSaveError(''), failure => setSaveError(failure.message));
  }

  function addStar(key) {
    setProgress(value => ({...value, [key]:true}));
    schoolService.addStar(key).catch(failure => setSaveError(failure.message));
  }

  return {buddy, progress, saveError, saveBuddy, addStar};
}
