import {useEffect, useRef, useState} from 'react';
import {ArrowRight, Check, ChevronLeft, Ear, Lightbulb, Mic, Pencil, RotateCcw, Volume2} from 'lucide-react';
import {useNarration} from './hooks/use-narration.js';
import {getActivity} from './learning-content.mjs';
import {interpretExplanation, mapModelTimeout} from './interpreter.mjs';
import {countUnderstood, inspectMap} from './workshop-review.mjs';

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
    let result = interpretExplanation(capsuleId, activity, slot, explanation);
    try {
      const timeout = AbortSignal.timeout(mapModelTimeout + 2000);
      const signal = typeof AbortSignal.any === 'function'
        ? AbortSignal.any([controller.signal, timeout])
        : timeout;
      const response = await fetch('/api/map', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({capsule:capsuleId, episode, slot, input:explanation}),
        signal
      });
      if (response.ok) {
        const remote = await response.json();
        if (remote.parts && Array.isArray(remote.uncertainSlots)) result = remote;
      }
    } catch { /* The local interpreter is already available. */ }
    if (controller.signal.aborted) return;
    active.current = null;
    onBusy(false);
    setMessage('');
    if (Object.keys(result.parts).length) setInput('');
    onInterpret(result);
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

function Correction({answer, why, garden, index}) {
  return <div className="correction" role="status">
    <p><strong>La respuesta es {answer.label}.</strong> {why}</p>
    {garden && index === 2
      ? <div className="count-on" aria-label={garden.start + ' más ' + garden.added + ' son ' + (garden.start + garden.added)}>
          <span>{garden.start}</span>
          {Array.from({length:garden.added}, (_, position) => (
            <span className="count-step" style={{'--count-index':position}} key={position}>
              <span aria-hidden="true">→</span> {garden.start + position + 1}
            </span>
          ))}
        </div>
      : answer.dots
        ? <Dots count={answer.dots} />
        : answer.icon ? <Art icon={answer.icon} /> : null}
  </div>;
}

const emptyMetrics = {mapFirst:null, reasonFirst:null, hints:0, corrections:0};

export default function Workshop({capsuleId, capsule, initial, buddy, onBack, onStudio, onTransfer, onFinish}) {
  const [episode, setEpisode] = useState(initial);
  const [phase, setPhase] = useState('look');
  const [map, setMap] = useState([null,null,null]);
  const [selected, setSelected] = useState(0);
  const [checked, setChecked] = useState([false,false,false]);
  const [reviewed, setReviewed] = useState(false);
  const [issue, setIssue] = useState(null);
  const [uncertain, setUncertain] = useState([]);
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [hintVisible, setHintVisible] = useState(false);
  const [reasonChoice, setReasonChoice] = useState(null);
  const [fresh, setFresh] = useState(true);
  const [busy, setBusy] = useState(false);
  const heading = useRef(null);
  const narration = useNarration();
  const activity = getActivity(capsuleId, episode);
  const cards = Object.fromEntries(activity.cards.map(card => [card.id,card]));
  const isNew = episode !== initial;
  const reason = activity.reason;
  const practiceReason = activity.band.id === 'explain' && reason;
  const confirmed = reviewed && issue === null && checked.every(Boolean);
  const step = activity.steps[selected];
  const reasonDone = reasonChoice !== null && reasonChoice === reason?.answer;
  const visibleIssue = issue?.index === selected ? issue.kind : null;
  const correct = cards[step.answer];
  const question = phase === 'look' ? activity.title
    : phase === 'reason' ? reason.question
    : confirmed ? '¡Ya lo entendí!' : step.question;

  useEffect(() => {
    heading.current?.focus();
    return narration.stop;
  }, [episode, phase]);

  function review(values, ambiguities = uncertain) {
    const unresolved = inspectMap(activity.steps, values, ambiguities);
    setReviewed(true);
    setChecked(activity.steps.map((part,index) => part.answer === values[index] && !ambiguities.includes(index)));
    setIssue(unresolved);
    setHintVisible(false);
    if (unresolved) setSelected(unresolved.index);
    if (isNew) {
      setMetrics(previous => ({
        ...previous,
        mapFirst:previous.mapFirst ?? countUnderstood(activity.steps, values, ambiguities),
        corrections:previous.corrections + Number(unresolved?.kind === 'mistake')
      }));
    }
    heading.current?.focus();
  }

  function selectStep(index) {
    setSelected(index);
    setHintVisible(false);
    if (confirmed) setReviewed(false);
  }

  function addCard(id) {
    const nextMap = map.map((value,index) => index === selected ? id : value);
    const remaining = uncertain.filter(index => index !== selected);
    setMap(nextMap);
    setUncertain(remaining);
    setHintVisible(false);
    if (reviewed) {
      review(nextMap, remaining);
    } else {
      setChecked(checked.map((value,index) => index === selected ? false : value));
      const next = nextMap.indexOf(null);
      if (next >= 0) setSelected(next);
    }
  }

  function applyParts({parts, uncertainSlots}) {
    const nextMap = map.map((value,index) => parts[index] ?? value);
    const pending = new Set(uncertain.filter(index => parts[index] === undefined));
    for (const index of uncertainSlots) pending.add(index);
    if (!Object.keys(parts).length && !uncertainSlots.length) pending.add(selected);
    const ambiguities = [...pending];
    setMap(nextMap);
    setUncertain(ambiguities);
    review(nextMap, ambiguities);
  }

  function startTeaching() {
    setSelected(activity.keyStep ?? 0);
    setPhase('teach');
  }

  function nextCase() {
    const transfer = onTransfer();
    setEpisode(transfer.episode);
    setFresh(transfer.fresh);
    setPhase('look');
    setMap([null,null,null]);
    setChecked([false,false,false]);
    setReviewed(false);
    setIssue(null);
    setUncertain([]);
    setMetrics(emptyMetrics);
    setHintVisible(false);
    setReasonChoice(null);
  }

  function chooseReason(index) {
    setReasonChoice(index);
    if (isNew) {
      setMetrics(previous => ({
        ...previous,
        reasonFirst:previous.reasonFirst ?? (index === reason.answer),
        corrections:previous.corrections + Number(index !== reason.answer)
      }));
    }
  }

  function giveHint() {
    if (hintVisible) return;
    setHintVisible(true);
    if (isNew) setMetrics(previous => ({...previous,hints:previous.hints + 1}));
  }

  const label = isNew ? (fresh ? 'Reto nuevo' : 'Reto de repaso') : phase === 'look' ? activity.band.label
    : phase === 'reason' ? 'Explícalo' : reviewed ? 'Revisa tu mapa' : 'Enséñale a tu personaje';
  let spoken = question;
  if (phase === 'look') spoken = activity.setup;
  if (phase === 'teach' && !confirmed) {
    if (visibleIssue === 'mistake') spoken += ' La respuesta es ' + correct.label + '. ' + step.explanation;
    else if (hintVisible) spoken += ' ' + step.hint;
    else spoken += ' ' + activity.cards.map(card => card.label).join('. ');
  }
  if (phase === 'reason') {
    spoken += reasonChoice === null
      ? ' ' + reason.options.map(option => option.label).join('. ')
      : ' ' + reason.options[reason.answer].label + '. ' + reason.explanation;
  }

  return <main className="workshop" data-color={capsule.color}>
    <nav className="workshop-nav" aria-label="Actividad">
      <button type="button" className="control" onClick={onBack}><ChevronLeft size={19} /> Ejercicios</button>
      <span className="subject">{capsule.label}</span>
      <button type="button" className="control" onClick={onStudio} disabled={busy}><Pencil size={17} /> Personaje</button>
    </nav>
    <section className="workshop-panel">
      <div className="mission-header">
        <span className="stage">{label}</span>
        <button type="button" className="control sound" onClick={() => narration.narrate(spoken)}>
          <Volume2 size={20} /> Escuchar
        </button>
      </div>
      <div className="speech-bubble">
        <Avatar buddy={buddy} />
        <div><strong>{buddy.name}</strong><h1 tabIndex={-1} ref={heading}>{question}</h1></div>
      </div>
      {phase === 'look' && <>
        <Scene key={episode} activity={activity} practice={!isNew} />
        <button type="button" className="primary next" onClick={startTeaching}>¡Te enseño! <ArrowRight size={22} /></button>
      </>}
      {phase === 'teach' && <>
        <div className="map" aria-label="Mapa de lo que enseñaste" role="group">
          {activity.steps.map((part,index) => {
            const card = cards[map[index]];
            const accepted = checked[index];
            return <button type="button" key={part.label} aria-pressed={selected === index}
                className="map-slot" data-confirmed={accepted} disabled={busy}
                onClick={() => selectStep(index)}>
              <span>{part.label}</span>
              <strong>{card?.label || map[index] || '…'}</strong>
              {card?.dots ? <Dots count={card.dots} /> : card?.icon ? <Art icon={card.icon} /> : null}
              {accepted && <Check className="check" size={17} aria-label="Entendido" />}
            </button>;
          })}
        </div>
        {!confirmed && <>
          {visibleIssue === 'mistake' && <Correction answer={correct} why={step.explanation}
            garden={activity.garden} index={selected} />}
          {visibleIssue === 'clarify' && <p className="feedback" role="status">Quiero entenderte bien. ¿Qué ficha querías mostrarme?</p>}
          {visibleIssue === 'missing' && <p className="feedback" role="status">Me falta esta idea. ¿Me la enseñas?</p>}
          <div className="tiles" aria-label="Fichas para enseñar" role="group">
            {activity.cards.map(card => <button className="tile" type="button" key={card.id} disabled={busy}
              onClick={() => addCard(card.id)}>
              {card.dots ? <Dots count={card.dots} /> : <Art icon={card.icon} />}
              <strong>{card.label}</strong>
            </button>)}
          </div>
          {!reviewed && <button type="button" className="primary next review-action"
            onClick={() => review(map)} disabled={busy || map.every(value => value === null)}>
            Revisar mi mapa <ArrowRight size={22} />
          </button>}
          <div className="extra-controls">
            {visibleIssue !== 'mistake' && <button type="button" className="control" onClick={giveHint}>
              <Lightbulb size={18} /> Pista
            </button>}
            <details className="recap">
              <summary><Ear size={18} /> Ver la escena</summary>
              <Scene activity={activity} practice={false} />
              <button className="control" type="button" onClick={() => narration.narrate(activity.setup)}><Volume2 size={17} /> Escuchar escena</button>
            </details>
          </div>
          {hintVisible && <p role="status" className="hint">{step.hint}</p>}
          <Explanation capsuleId={capsuleId} activity={activity} episode={episode} slot={selected}
            onInterpret={applyParts} onBusy={setBusy} busy={busy} />
        </>}
        {confirmed && <button type="button" className="primary next" onClick={
          isNew || practiceReason ? () => setPhase('reason') : nextCase
        }>
          {isNew || practiceReason ? 'Explícale por qué' : 'Probar otro caso'} <ArrowRight size={22} />
        </button>}
      </>}
      {phase === 'reason' && <>
        {reasonChoice !== null && !reasonDone && <Correction answer={reason.options[reason.answer]} why={reason.explanation} />}
        {reasonDone
          ? <p className="reason-confirmed" role="status">{reason.explanation}</p>
          : <div className="reason-options" role="group" aria-label="Formas de explicarlo">
            {reason.options.map((option,index) => <button className="control" type="button" key={option.label}
              onClick={() => chooseReason(index)}>
              {option.icon && <Art icon={option.icon} />}{option.label}
            </button>)}
          </div>}
        {reasonDone && <button type="button" className="primary next" onClick={isNew ? () => onFinish({...metrics,fresh}) : nextCase}>
          {isNew ? 'Guardar mi estrella' : 'Probar otro caso'} <ArrowRight size={22} />
        </button>}
      </>}
    </section>
  </main>;
}
