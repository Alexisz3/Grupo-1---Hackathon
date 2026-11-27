import {ChevronLeft} from 'lucide-react';
import {AgentStatus} from '../../components/agent-status.jsx';
import {BuddyBubble} from '../../components/buddy-bubble.jsx';
import {VoiceInput} from '../../components/voice-input.jsx';
import {useTimeTravel} from '../../hooks/use-time-travel.js';
import {CharacterPicker} from './components/character-picker.jsx';
import {ChatTurn} from './components/chat-turn.jsx';
import {TimeCards} from './components/time-cards.jsx';

export default function TimeTravelScreen({onBack, onComplete}) {
  const travel = useTimeTravel(onComplete);
  const {character} = travel;
  const person = character && {name:character.name, icon:character.emoji};
  return <main className="workshop time-travel" data-color="gold">
    <nav className="workshop-nav" aria-label="Actividad">
      <button type="button" className="control" onClick={character ? travel.leave : onBack}>
        <ChevronLeft size={19} /> {character ? 'Otra época' : 'Historia'}
      </button>
      {character && <span className="progress">📍 {character.where} · {character.era || character.year}</span>}
    </nav>
    <section className="workshop-panel">
      {!character && <CharacterPicker onPick={travel.visit} />}
      {character && <>
        <BuddyBubble buddy={person} text={character.intro} />
        <ol className="chat">{travel.turns.map((turn, index) => <ChatTurn key={index} character={character} turn={turn} onReplay={travel.replay} />)}</ol>
        {(travel.busy || travel.error) && <AgentStatus buddy={person} text={character.name + ' está recordando…'} error={travel.error} />}
        <div className="suggestions">
          {travel.suggestions.map(question => <button key={question} type="button" className="control" disabled={travel.busy} onClick={() => travel.ask(question)}>{question}</button>)}
        </div>
        <VoiceInput id="pregunta" label={'Pregúntale a ' + character.name} dictation={travel.dictation} submitLabel="Preguntar" busy={travel.busy} onSubmit={travel.ask} />
        <TimeCards cards={travel.cards} />
      </>}
    </section>
  </main>;
}
