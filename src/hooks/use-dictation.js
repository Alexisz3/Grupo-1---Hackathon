import {useEffect, useRef, useState} from 'react';
import {canDictate, Recognition} from '../utils/speech.js';

// Texto que el niño escribe o dicta: el micrófono va llenando el mismo campo
export function useDictation() {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const active = useRef(null);

  useEffect(() => () => active.current?.abort(), []);

  function toggle() {
    if (active.current) { active.current.stop(); return; }
    const recognition = new Recognition();
    recognition.lang = 'es';
    recognition.interimResults = true;
    recognition.onresult = event => setText([...event.results].map(item => item[0].transcript).join(' '));
    recognition.onend = () => { active.current = null; setListening(false); };
    try {
      recognition.start();
      active.current = recognition;
      setListening(true);
    } catch { setListening(false); }
  }

  function clear() {
    active.current?.abort();
    setText('');
  }

  return {supported:canDictate, text, setText, listening, toggle, clear};
}
