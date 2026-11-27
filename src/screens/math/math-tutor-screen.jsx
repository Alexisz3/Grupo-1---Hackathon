import {useState} from 'react';
import {ArrowRight, ChevronLeft, Star, Volume2} from 'lucide-react';
import {AgentStatus} from '../../components/agent-status.jsx';
import {BuddyBubble} from '../../components/buddy-bubble.jsx';
import {useMathTutor} from '../../hooks/use-math-tutor.js';
import {CountBoard} from './components/count-board.jsx';
import {JudgeButtons} from './components/judge-buttons.jsx';
import {NumberTiles} from './components/number-tiles.jsx';
import {TeachForm} from './components/teach-form.jsx';
import {operations} from '../../math-tutor.mjs';

export default function MathTutorScreen({buddy, onBack, onComplete}) {
  const [operation, setOperation] = useState('add');
  return <MathRound key={operation} buddy={buddy} onBack={onBack} onComplete={onComplete}
    operation={operation} onOperation={setOperation} />;
}

function MathRound({buddy, onBack, onComplete, operation, onOperation}) {
  const tutor = useMathTutor(buddy, onComplete, operation);
  const waiting = tutor.phase === 'loading' || tutor.phase === 'error';
  return <main className="workshop" data-color="green">
    <nav className="workshop-nav" aria-label="Actividad">
      <button type="button" className="control" onClick={onBack}><ChevronLeft size={19} /> Matemáticas</button>
      <span className="progress"><Star size={17} /> Nivel {tutor.level + 1} · {tutor.score.clean} de {tutor.score.rounds} sin ayuda</span>
    </nav>
    <section className="workshop-panel">
      <div className="operation-picker" role="group" aria-label="Operaciones">
        {Object.entries(operations).map(([id, option]) => (
          <button key={id} type="button" className="control" aria-pressed={operation === id}
            onClick={() => onOperation(id)}><b aria-hidden="true">{option.symbol}</b> {option.label}</button>
        ))}
      </div>
      {waiting && <AgentStatus buddy={buddy} text={buddy.name + ' está pensando…'} error={tutor.error} onRetry={tutor.next} />}
      {!waiting && <>
        <div className="mission-header">
          <span className="stage">¡{buddy.name} se equivoca!</span>
          <button type="button" className="control" onClick={tutor.replay}><Volume2 size={20} /> Escuchar</button>
        </div>
        <BuddyBubble buddy={buddy} text={tutor.line} />
        <CountBoard key={tutor.problem.setup + tutor.problem.said} problem={tutor.problem} />
        {tutor.phase === 'judge' && <JudgeButtons buddyName={buddy.name} onJudge={tutor.judge} />}
        {tutor.phase === 'fix' && <NumberTiles choices={tutor.choices} onPick={tutor.pick} />}
        {tutor.phase === 'explain' && <TeachForm dictation={tutor.dictation} onTeach={tutor.teach} />}
        {tutor.phase === 'done' && <button type="button" className="primary next" onClick={tutor.next}>Otro problema <ArrowRight size={22} /></button>}
      </>}
    </section>
  </main>;
}
