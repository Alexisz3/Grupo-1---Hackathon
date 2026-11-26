import {useEffect, useRef, useState} from 'react';
import {ArrowRight, Check, ChevronLeft, Ear, Lightbulb, Mic, Pencil, RotateCcw, Volume2} from 'lucide-react';
import {filterParts} from './capsules.mjs';
import {localParts} from './interpreter.mjs';

const canListen = 'speechSynthesis' in window;

function speak(text) {
  speechSynthesis.cancel();
  const phrase = new SpeechSynthesisUtterance(text);
  const spanish = speechSynthesis.getVoices().find(voice => voice.lang.startsWith('es'));
  if (spanish) phrase.voice = spanish;
  phrase.lang = spanish?.lang || 'es';
  phrase.rate = .85;
  speechSynthesis.speak(phrase);
}

export function Avatar({buddy, className = ''}) {
  return <span className={'avatar ' + className} aria-hidden="true">
    {buddy.image ? <img src={buddy.image} alt="" /> : buddy.icon}
  </span>;
}

function Art({icon}) {
  return <span aria-hidden="true" className={icon === 'nest' ? 'nest' : 'picture'}>{icon === 'nest' ? '' : icon}</span>;
}

function Dots({count, variant = ''}) {
  return <span className={'dots ' + variant} aria-hidden="true">
    {Array.from({length:count}, (_, index) => <i key={index} />)}
  </span>;
}

function Scene({activity, practice}) {
  const [moved, setMoved] = useState(0);
  const {garden} = activity;
  return <div className="scene-board">
    {garden ? (
      <>
        <div className="planters">
          <div><Dots variant="original" count={garden.start} /><strong>Ya estaban</strong></div>
          <span className="join" aria-hidden="true">+</span>
          <div><Dots variant="new" count={garden.added} /><strong>Llegaron</strong></div>
        </div>
        {practice && <div className="hands">
          <button type="button" className="control" onClick={() => setMoved(moved === garden.added ? 0 : moved + 1)}>
            {moved === garden.added ? <RotateCcw size={20} /> : <span aria-hidden="true">+</span>}
            {moved === garden.added ? 'Volver a juntar' : 'Juntar una semilla'}
          </button>
          <div className="joined" role="status">
            {moved > 0 && <><Dots count={garden.start} variant="original" /><Dots count={moved} variant="new" /><span>{garden.start + moved} juntas</span></>}
          </div>
        </div>}
      </>
    ) : <div className="scene-art">{activity.scene.map((icon, index) => <Art icon={icon} key={index} />)}</div>}
    <p className="scene-text">{activity.setup}</p>
  </div>;
}

function Explanation({capsuleId, activity, episode, slot, onInterpret, onBusy, busy}) {
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [recording, setRecording] = useState(false);
  const active = useRef(null);
  const speech = useRef(null);
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => () => {
    active.current?.abort();
    if (speech.current) {
      speakCleanup(speech.current);
      speech.current = null;
    }
  }, []);

  function toggleSpeech() {
    if (speech.current) { speech.current.stop(); return; }
    const recognition = new Recognition();
    recognition.lang = 'es';
    recognition.onresult = event => setInput(event.results[0][0].transcript);
    recognition.onerror = () => setMessage('Puedes escribir o usar las fichas.');
    recognition.onend = () => { speech.current = null; setRecording(false); };
    try {
      recognition.start();
      speech.current = recognition;
      setMessage('');
      setRecording(true);
    } catch { setMessage('Puedes escribir o usar las fichas.'); }
  }

  async function submit(event) {
    event.preventDefault();
    const explanation = input.trim();
    if (!explanation || active.current) return;
    const controller = new AbortController();
    active.current = controller;
    onBusy(true);
    setMessage('Estoy escuchando…');
    let parts = localParts(capsuleId, episode, slot, explanation);
    try {
      const response = await fetch('/api/map', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({capsule:capsuleId, episode, slot, input:explanation}),
        signal:AbortSignal.any([controller.signal, AbortSignal.timeout(6000)])
      });
      if (response.ok) {
        const remote = filterParts(activity, (await response.json()).parts);
        if (Object.keys(remote).length) parts = remote;
      }
    } catch { /* The local interpreter is already available. */ }
    if (controller.signal.aborted) return;
    active.current = null;
    onBusy(false);
    if (!Object.keys(parts).length) {
      setMessage('Todavía no sé qué poner. Muéstramelo con una ficha.');
      return;
    }
    setMessage('Mira el mapa. Puedes cambiar lo que escribí.');
    setInput('');
    onInterpret(parts);
  }

  return <details className="free-answer">
    <summary><Pencil size={18} /> Con mis palabras</summary>
    <form onSubmit={submit}>
      <label htmlFor="explanation">Cuéntame sobre «{activity.steps[slot].label}»</label>
      <textarea id="explanation" value={input} onChange={event => setInput(event.target.value)} rows={2} maxLength={1000} />
      <div className="speech-actions">
        {Recognition && window.isSecureContext && <button className="control" type="button" onClick={toggleSpeech} disabled={busy}>
          <Mic size={19} />{recording ? 'Parar' : 'Dictar'}
        </button>}
        <button className="control" type="submit" disabled={busy || recording || !input.trim()}>Contárselo</button>
      </div>
    </form>
    <p role="status">{message}</p>
  </details>;
}

function speakCleanup(recognition) {
  recognition.onresult = recognition.onerror = recognition.onend = null;
  recognition.abort();
}

export default function Workshop({capsuleId, capsule, initial, buddy, onBack, onStudio, onFinish}) {
  const [episode, setEpisode] = useState(initial);
  const [phase, setPhase] = useState('look');
  const [map, setMap] = useState([null,null,null]);
  const [selected, setSelected] = useState(0);
  const [reviewedMap, setReviewedMap] = useState(null);
  const [hinted, setHinted] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const heading = useRef(null);
  const activity = capsule.cases[episode];
  const cards = Object.fromEntries(activity.cards.map(card => [card.id,card]));
  const gap = activity.steps.findIndex((step, index) => map[index] !== step.answer);
  const complete = gap === -1;
  const reviewed = reviewedMap !== null;
  const confirmed = reviewedMap === map && complete;
  const isNew = episode !== initial;
  const question = phase === 'look' ? activity.title
    : confirmed ? '¡Ya lo entendí!' : activity.steps[selected].question;
  const reviewMessage = reviewedMap === map && !complete && map[gap] !== null
    ? 'Tengo una duda. ¿Me ayudas a revisar «' + activity.steps[gap].label + '»?'
    : reviewedMap === map && !complete ? 'Me falta una idea en «' + activity.steps[gap].label + '».'
    : '';

  useEffect(() => {
    heading.current?.focus();
    return () => window.speechSynthesis?.cancel();
  }, [episode, phase]);

  function selectStep(index) {
    setSelected(index);
    setHintVisible(false);
  }

  function addCard(id) {
    setMap(map.map((value,index) => index === selected ? id : value));
    setHintVisible(false);
    const nextStep = map.findIndex((value,index) => value === null && index !== selected);
    if (!reviewed && nextStep >= 0) setSelected(nextStep);
  }

  function applyParts(parts) {
    setMap(map.map((value,index) => parts[index] ?? value));
    setHintVisible(false);
  }

  function review() {
    setReviewedMap(map);
    setHintVisible(false);
    if (!complete) {
      setHinted(true);
      setSelected(gap);
    }
    heading.current?.focus();
  }

  function nextCase() {
    if (isNew) { onFinish(!hinted); return; }
    setEpisode((initial + 1) % capsule.cases.length);
    setPhase('look');
    setMap([null,null,null]);
    setSelected(0);
    setReviewedMap(null);
    setHinted(false);
    setHintVisible(false);
  }

  const label = isNew ? 'Reto nuevo' : phase === 'look' ? '1 · Mira'
    : reviewed ? '3 · Revisa' : '2 · Enseña';

  return <main className="workshop" data-color={capsule.color}>
    <nav className="workshop-nav" aria-label="Actividad">
      <button type="button" className="control" onClick={onBack}><ChevronLeft size={19} /> Ejercicios</button>
      <span className="subject">{capsule.label}</span>
      <button type="button" className="control" onClick={onStudio} disabled={busy}><Pencil size={17} /> Personaje</button>
    </nav>
    <section className="workshop-panel">
      <div className="mission-header">
        <span className="stage">{label}</span>
        {canListen && <button type="button" className="control sound" onClick={() => speak(
          [phase === 'look' ? activity.setup : question, reviewMessage, hintVisible ? activity.steps[selected].hint : '',
            phase === 'teach' && !confirmed ? activity.cards.map(card => card.label).join('. ') : ''].join(' ')
        )}><Volume2 size={20} /> Escuchar</button>}
      </div>
      <div className="speech-bubble">
        <Avatar buddy={buddy} />
        <div><strong>{buddy.name}</strong><h1 tabIndex={-1} ref={heading}>{question}</h1></div>
      </div>
      {phase === 'look' ? <>
        <Scene key={episode} activity={activity} practice={!isNew} />
        <button type="button" className="primary next" onClick={() => setPhase('teach')}>¡Te enseño! <ArrowRight size={22} /></button>
      </> : <>
        <p role="status" className="feedback">{reviewMessage}</p>
        <div className="map" aria-label="Mapa de lo que enseñaste" role="group">
          {activity.steps.map((step,index) => {
            const card = cards[map[index]];
            const accepted = reviewedMap?.[index] === step.answer && map[index] === step.answer;
            return <button type="button" key={step.label} aria-pressed={selected === index}
                className="map-slot" data-confirmed={accepted} disabled={busy}
                onClick={() => { if (confirmed) setReviewedMap(null); selectStep(index); }}>
              <span>{step.label}</span>
              <strong>{card?.label || '…'}</strong>
              {card?.dots ? <Dots count={card.dots} /> : card?.icon ? <Art icon={card.icon} /> : null}
              {accepted && <Check className="check" size={17} aria-label="Entendido" />}
            </button>;
          })}
        </div>
        {!confirmed && <>
          <div className="tiles" aria-label="Fichas para enseñar" role="group">
            {activity.cards.map(card => <button className="tile" type="button" key={card.id} disabled={busy}
              onClick={() => addCard(card.id)}>
              {card.dots ? <Dots count={card.dots} /> : <Art icon={card.icon} />}
              <strong>{card.label}</strong>
            </button>)}
          </div>
          <button type="button" className="primary next review-action" onClick={review} disabled={busy || map.every(value => value === null)}>
            {reviewed ? 'Volver a revisar' : 'Revisar mi mapa'} <ArrowRight size={22} />
          </button>
          <div className="extra-controls">
            <button type="button" className="control" onClick={() => {setHinted(true);setHintVisible(true);}}><Lightbulb size={18} /> Pista</button>
            <details className="recap">
              <summary><Ear size={18} /> Ver la escena</summary>
              <Scene activity={activity} practice={false} />
              {canListen && <button className="control" type="button" onClick={() => speak(activity.setup)}><Volume2 size={17} /> Escuchar escena</button>}
            </details>
          </div>
          {hintVisible && <p role="status" className="hint">{activity.steps[selected].hint}</p>}
          <Explanation capsuleId={capsuleId} activity={activity} episode={episode} slot={selected}
            onInterpret={applyParts} onBusy={setBusy} busy={busy} />
        </>}
        {confirmed && <button type="button" className="primary next" onClick={nextCase}>
              {isNew ? 'Guardar mi estrella' : 'Probar otro caso'} <ArrowRight size={22} />
            </button>}
      </>}
    </section>
  </main>;
}
