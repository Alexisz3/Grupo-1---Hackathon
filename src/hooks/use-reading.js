import {useEffect, useRef, useState} from 'react';
import {matchWords, textWords} from '../utils/reading.mjs';
import {canDictate, Recognition} from '../utils/speech.js';

// El niño lee en voz alta y cada palabra se marca en cuanto el navegador la reconoce
export function useReading(onScore) {
  const [words, setWords] = useState([]);
  const [listening, setListening] = useState(false);
  const active = useRef(null);
  const report = useRef(onScore);
  report.current = onScore;

  useEffect(() => () => active.current?.abort(), []);

  function show(text) {
    active.current?.abort();
    setWords(textWords(text).map(word => ({word, ok:null})));
  }

  function listen(text) {
    if (active.current) { active.current.stop(); return; }
    const recognition = new Recognition();
    let result = [];
    recognition.lang = 'es';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = event => {
      result = matchWords(text, [...event.results].map(item => item[0].transcript).join(' '));
      setWords(result);
      if (result.every(word => word.ok)) recognition.stop();
    };
    recognition.onend = () => {
      active.current = null;
      setListening(false);
      if (result.length) report.current(result.filter(word => word.ok).length, result.length);
    };
    try {
      recognition.start();
      active.current = recognition;
      setListening(true);
    } catch { setListening(false); }
  }

  const stop = () => active.current?.stop();
  return {supported:canDictate, words, listening, show, listen, stop};
}
