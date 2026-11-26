import {useState} from 'react';
import {aiService} from '../services/ai-service.js';
import {schoolService} from '../services/school-service.js';
import {characters} from '../time-travel.mjs';
import {useDictation} from './use-dictation.js';
import {useNarration} from './use-narration.js';

// «Viaje en el tiempo»: el niño conversa por voz con una persona del pasado
// y junta tarjetas de «antes y ahora». Con 3 tarjetas gana una estrella.
export function useTimeTravel(onComplete) {
  const [id, setId] = useState(null);
  const [turns, setTurns] = useState([]);
  const [cards, setCards] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const narration = useNarration();
  const dictation = useDictation();
  const character = id ? characters[id] : null;

  function visit(nextId) {
    setId(nextId);
    setTurns([]);
    setCards([]);
    setError('');
    dictation.clear();
    narration.narrate(characters[nextId].intro, characters[nextId].voice);
  }

  async function ask(question) {
    if (busy) return;
    dictation.clear();
    narration.stop();
    setBusy(true);
    setError('');
    try {
      const answer = await aiService.visit(id, question, turns);
      setTurns([...turns, {question, reply:answer.reply}]);
      if (answer.before && answer.now) {
        setCards([...cards, {before:answer.before, now:answer.now}]);
        schoolService.addActivity('history', 'card', {character:id, question, before:answer.before, now:answer.now}).catch(() => {});
        if (cards.length + 1 === 3) onComplete();
      }
      narration.narrate(answer.reply, character.voice);
    } catch (failure) {
      setError(failure.message);
    }
    setBusy(false);
  }

  function leave() {
    narration.stop();
    dictation.clear();
    setId(null);
  }

  const asked = new Set(turns.map(turn => turn.question));
  return {character, turns, cards, busy, error, dictation, ask, visit, leave,
    suggestions:character ? character.questions.filter(question => !asked.has(question)) : [],
    replay:text => narration.narrate(text, character.voice)};
}
