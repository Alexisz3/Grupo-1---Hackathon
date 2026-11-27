import {useEffect, useState} from 'react';
import {aiService} from '../services/ai-service.js';
import {schoolService} from '../services/school-service.js';
import {useDictation} from './use-dictation.js';
import {useNarration} from './use-narration.js';
import {explainProblem} from '../math-tutor.mjs';

const decision = problem => problem.operation === 'divide' ? '¿Cuántas van en cada grupo?' : '¿Cuál es la respuesta?';

// «Pipo se equivoca»: el niño revisa el cálculo del personaje, lo corrige y le explica.
// Tres aciertos seguidos sin ayuda suben el nivel; cada 5 problemas hay una estrella.
export function useMathTutor(buddy, onComplete, operation) {
  const [level, setLevel] = useState(0);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState({rounds:0, clean:0});
  const [phase, setPhase] = useState('loading');
  const [problem, setProblem] = useState(null);
  const [line, setLine] = useState('');
  const [helped, setHelped] = useState(false);
  const [error, setError] = useState('');
  const narration = useNarration();
  const dictation = useDictation();

  useEffect(() => { next(); }, []);

  function say(text, spoken = text) {
    setLine(text);
    narration.narrate(spoken);
  }

  async function next() {
    setPhase('loading');
    setError('');
    setHelped(false);
    dictation.clear();
    try {
      const fresh = await aiService.mathProblem({name:buddy.name}, level, operation);
      setProblem(fresh);
      setPhase('judge');
      say(fresh.said, fresh.setup + ' ' + fresh.said);
    } catch (failure) {
      setError(failure.message);
      setPhase('error');
    }
  }

  function finish(clean, text) {
    const rounds = score.rounds + 1;
    const nextStreak = clean ? streak + 1 : 0;
    const levelUp = nextStreak === 3 && level < 2;
    setScore({rounds, clean:score.clean + (clean ? 1 : 0)});
    setStreak(levelUp ? 0 : nextStreak);
    if (levelUp) setLevel(level + 1);
    if (rounds % 5 === 0) onComplete();
    schoolService.addActivity('math', 'round', {operation, level:level + 1, clean, a:problem.a, b:problem.b, claim:problem.claim}).catch(() => {});
    setPhase('done');
    say(text + (levelUp ? ' ¡Subimos de nivel!' : ''));
  }

  function judge(saysRight) {
    const pipoRight = problem.claim === problem.total;
    if (pipoRight && saysRight) return finish(true, '¡Sí! ' + explainProblem(problem) + '. ¡Gracias por revisar!');
    if (pipoRight) return finish(false, 'Revisemos juntos. ' + explainProblem(problem) + '. Esta vez lo hice bien.');
    if (saysRight) setHelped(true);
    setPhase('fix');
    say((saysRight ? 'Revisemos juntos. ' : '¡Uy! ¿Me equivoqué? ') + decision(problem));
  }

  function pick(number) {
    if (number !== problem.total) {
      setHelped(true);
      say('La respuesta es ' + problem.total + '. ' + explainProblem(problem) + '. Elige la respuesta en las fichas.');
      return;
    }
    setPhase('explain');
    say('¡Son ' + problem.total + '! ¿Cómo me lo explicas para no equivocarme otra vez?');
  }

  async function teach(explanation = '') {
    setPhase('loading');
    const reply = await aiService.mathTeach({name:buddy.name}, problem, explanation).catch(() => '¡Gracias, profe! ' + explainProblem(problem) + '.');
    finish(!helped, reply);
  }

  const choices = problem ? [...new Set([problem.total - 1, problem.total, problem.total + 1, problem.claim])]
    .filter(number => number >= 0).sort((x, y) => x - y) : [];

  return {level, score, phase, problem, line, error, choices, dictation, narration, next, judge, pick, teach,
    replay:() => narration.narrate(line)};
}
