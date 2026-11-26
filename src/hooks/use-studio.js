import {useState} from 'react';
import {aiService} from '../services/ai-service.js';
import {useDrawingPad} from './use-drawing-pad.js';

export const quickCharacters = [['🐥', 'Pollito'], ['🐢', 'Tortuga'], ['🐰', 'Conejo']];

// «Mi personaje»: el niño dibuja y escribe qué es; la IA lo entiende y pinta su retrato
export function useStudio(buddy, onSave) {
  const [name, setName] = useState(buddy.name);
  const [icon, setIcon] = useState(buddy.icon);
  const [hint, setHint] = useState('');
  const [image, setImage] = useState(buddy.image);
  const [look, setLook] = useState(buddy.look || '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const pad = useDrawingPad();

  function pick(emoji) {
    setIcon(emoji);
    setImage(null);
    setLook('');
    setMessage('');
  }

  async function create() {
    if (busy || pad.empty) return;
    const drawing = pad.image();
    setBusy(true);
    setMessage('Estoy mirando tu dibujo y pintando tu personaje…');
    try {
      const result = await aiService.character(drawing, hint.trim());
      setImage(result.image || drawing);
      setLook(result.look);
      setMessage(result.image ? '¡Listo! ' + result.look : 'Entendí tu dibujo: ' + result.look);
    } catch (failure) {
      setImage(drawing);
      setMessage(failure.message + ' Por ahora uso tu dibujo.');
    }
    setBusy(false);
  }

  const save = () => onSave({name:name.trim() || 'Pipo', icon, image:image || (pad.empty ? null : pad.image()), look});

  return {name, setName, icon, hint, setHint, image, busy, message, pad, pick, create, save};
}
