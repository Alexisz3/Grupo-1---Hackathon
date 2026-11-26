import {useRef, useState} from 'react';
import {aiService} from '../services/ai-service.js';
import {schoolService} from '../services/school-service.js';
import {textWords} from '../utils/reading.mjs';
import {useDrawingPad} from './use-drawing-pad.js';
import {useNarration} from './use-narration.js';
import {useReading} from './use-reading.js';

const sumOf = values => values.reduce((sum, value) => sum + value, 0);
const spoken = page => [page.text, page.question, page.draw].filter(Boolean).join(' ');

// Cuento con IA como un libro (estilo Drawn Worlds): el niño dibuja, la IA entiende el dibujo y escribe
// una página por turno. A mitad del cuento le pide otro dibujo, que entra a la historia.
// Cada página se narra, se puede leer en voz alta y se ilustra a partir del dibujo.
export function useStory(onComplete) {
  const [phase, setPhase] = useState('draw');
  const [pages, setPages] = useState([]);
  const [drawing, setDrawing] = useState('');
  const [pictures, setPictures] = useState({});
  const [error, setError] = useState('');
  const [scores, setScores] = useState({});
  const pad = useDrawingPad();
  const narration = useNarration();
  const reading = useReading(read => {
    const best = {...scores, [pages.length - 1]:Math.max(read, scores[pages.length - 1] || 0)};
    setScores(best);
    if (storyId.current) schoolService.saveReading(storyId.current, sumOf(Object.values(best)), sumOf(pages.map(item => textWords(item.text).length))).catch(() => {});
  });
  const look = useRef('');
  const seed = useRef(0);
  const pending = useRef([]);
  const storyId = useRef(null);

  // La ilustración llega después del texto; si no hay ilustrador queda 'none' y se muestra el dibujo
  function illustrate(index, page, reference) {
    const done = url => setPictures(value => ({...value, [index]:url}));
    if (!page.picture) { done('none'); return; }
    aiService.picture(page.picture, reference, seed.current, storyId.current, index + 1).then(done, () => done('none'));
  }

  // reference: el dibujo que la ilustración de esta página tiene que recrear (si hay)
  async function request(history, reference = '') {
    pending.current = [history, reference];
    setPhase('loading');
    setError('');
    try {
      const page = await aiService.nextPage({storyId:storyId.current, hero:{look:look.current}, pages:history.map(({text, choice}) => ({text, choice}))});
      setPages([...history, page]);
      setPhase('page');
      reading.show(page.text);
      // Voz e ilustración usan la misma CPU: primero la voz (suena en ~1 s) y después se pinta la página
      narration.narrate(spoken(page)).finally(() => illustrate(history.length, page, reference));
      if (page.end) onComplete();
    } catch (failure) {
      setError(failure.message);
      setPhase('error');
    }
  }

  async function start() {
    const image = pad.image();
    seed.current = Math.floor(Math.random() * 1e6);
    setDrawing(image);
    setPictures({});
    setScores({});
    setPhase('loading');
    // El cuento se guarda en la base local; si no se puede, igual se juega
    storyId.current = await schoolService.createStory(image).catch(() => null);
    look.current = await aiService.describe(image).catch(() => '');
    request([], image);
  }

  function choose(choice) {
    narration.stop();
    reading.stop();
    request(pages.with(-1, {...pages.at(-1), choice}));
  }

  // A mitad del cuento: el niño dibuja lo que le pidió la página y eso sigue la historia
  function drawMore() {
    narration.stop();
    reading.stop();
    pad.clear();
    setPhase('redraw');
  }

  async function finishDrawing() {
    const image = pad.image();
    setDrawing(image);
    setPhase('loading');
    const seen = await aiService.describe(image, pages.at(-1).draw).catch(() => '');
    request(pages.with(-1, {...pages.at(-1), choice:'El niño dibujó: ' + (seen || 'algo muy especial')}), image);
  }

  function restart() {
    narration.stop();
    reading.stop();
    pad.clear();
    setPages([]);
    setPhase('draw');
  }

  const page = pages.at(-1);
  const summary = {pages:pages.length, read:sumOf(Object.values(scores)), total:sumOf(pages.map(item => textWords(item.text).length))};

  return {
    phase, error, page, number:pages.length, drawing, picture:pictures[pages.length - 1], summary, pad, reading, narration,
    start, choose, drawMore, finishDrawing, restart,
    retry:() => request(...pending.current),
    listen:() => { narration.stop(); reading.listen(page.text); },
    listenAgain:() => narration.speaking ? narration.stop() : narration.narrate(spoken(page))
  };
}
