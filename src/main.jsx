import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowRight, BookOpen, Check, ChevronLeft, Clock3, Pencil, Shapes, Sprout, Star} from 'lucide-react';
import {capsules} from './capsules.mjs';
import {getTransferEpisode, getTransferVariantCount, practiceBands} from './learning-content.mjs';
import Studio from './Studio.jsx';
import Workshop, {Avatar} from './Workshop.jsx';
import './style.css';

const icons = {math:Shapes, story:BookOpen, history:Clock3};
const firstBuddy = {name:'Pipo',icon:'🐥',image:null};
const exerciseCount = Object.values(capsules).reduce((total, capsule) => total + capsule.cases.length, 0);

function Home({buddy, progress, onOpen, onStudio}) {
  const earned = Object.keys(progress).length;
  return <main className="home">
    <section className="hero">
      <div className="hero-copy">
        <span className="hero-label"><Sprout size={17} /> Un aula para primer grado</span>
        <h1>Hoy tú<br />enseñas<span>.</span></h1>
        <p>Tu personaje aprende de ti.</p>
        <a href="#capsules" className="primary">Elegir aventura <ArrowRight size={21} /></a>
      </div>
      <img src="/art/aula.webp" alt="" width="800" height="533" />
      <button className="buddy-chip" type="button" onClick={onStudio}>
        <Avatar buddy={buddy} /><span><small>Mi personaje</small><strong>{buddy.name}</strong></span><Pencil size={17} />
      </button>
    </section>
    <section id="capsules" aria-labelledby="areas">
      <div className="section-heading">
        <h2 id="areas">Elige tu aventura</h2>
        <span className="progress"><Star size={18} /> {earned} de {exerciseCount} estrellas</span>
      </div>
      <div className="capsule-grid">
        {Object.entries(capsules).map(([id,capsule]) => {
          const Icon = icons[id];
          const count = capsule.cases.filter((_,index) => progress[id + ':' + index]).length;
          return <button key={id} type="button" className="capsule" data-color={capsule.color} onClick={() => onOpen(id)} aria-label={capsule.label}>
            <img src={'/art/'+capsule.image+'.webp'} width="620" height="410" alt="" />
            <span className="capsule-body">
              <span className="subject"><Icon size={16} /> {capsule.label}</span>
              <strong>{capsule.title}</strong>
              <span className="capsule-detail">{capsule.cases.length} ejercicios</span>
              <span className="card-arrow">{count === capsule.cases.length ? <Check size={22} /> : <ArrowRight size={22} />}</span>
            </span>
          </button>;
        })}
      </div>
    </section>
  </main>;
}

function Catalog({capsule, zone, progress, onHome, onSelect}) {
  const heading = useRef(null);
  const count = capsule.cases.filter((_,index) => progress[zone + ':' + index]).length;
  const bands = practiceBands(zone);
  const order = bands.flatMap(band => band.episodes);
  useEffect(() => { heading.current?.focus(); }, [zone]);
  return <main className="catalog" data-color={capsule.color}>
    <button type="button" className="control" onClick={onHome}><ChevronLeft size={19} /> Aula</button>
    <section aria-labelledby="catalogTitle">
      <div className="catalog-banner">
        <div>
          <h1 id="catalogTitle" tabIndex={-1} ref={heading}>{capsule.label}</h1>
          <p>{capsule.detail}</p>
        </div>
        <img src={'/art/' + capsule.image + '.webp'} alt="" />
      </div>
      <div className="section-heading">
        <h2>Elige un ejercicio</h2>
        <span className="progress"><Star size={17} /> {count} de {capsule.cases.length}</span>
      </div>
      {bands.map(band => <section key={band.id} className="catalog-band" aria-labelledby={'band-' + band.id}>
        <div className="band-heading">
          <h3 id={'band-' + band.id}>{band.label}</h3>
          <p>{band.description}</p>
        </div>
        <ol className="exercise-list">
          {band.episodes.map(index => {
            const activity = capsule.cases[index];
            const completed = progress[zone + ':' + index];
            return <li key={activity.title}>
              <button type="button" onClick={() => onSelect(index)}>
                <span className="exercise-number" aria-hidden="true">{order.indexOf(index) + 1}</span>
                <strong>{activity.title}</strong>
                {completed ? <Check size={20} aria-label="Completado" /> : <ArrowRight size={20} aria-hidden="true" />}
              </button>
            </li>;
          })}
        </ol>
      </section>)}
    </section>
  </main>;
}

function Result({buddy, result, onCatalog, onReplay}) {
  const heading = useRef(null);
  useEffect(() => {heading.current?.focus();}, []);
  return <main className="result">
    <section className="workshop-panel">
      <Star aria-hidden="true" className="award" size={78} />
      <h1 tabIndex={-1} ref={heading}>¡Gracias, profe!</h1>
      <p>Le enseñaste a {buddy.name} en dos situaciones.</p>
      <p className="progress">{result.fresh ? 'Reto nuevo' : 'Reto de repaso'} {result.hints || result.corrections ? 'completado con ayuda' : 'completado sin pistas ni correcciones'}</p>
      <dl className="result-metrics" aria-label="Tu reto">
        <div><dt>Mapa al primer intento</dt><dd>{result.mapFirst} de 3</dd></div>
        <div><dt>Explicación al primer intento</dt><dd>{result.reasonFirst ? 'Sí' : 'Después de corregir'}</dd></div>
        <div><dt>Ayuda en el reto</dt><dd>{result.hints || result.corrections ? [
          result.hints ? result.hints + (result.hints === 1 ? ' pista' : ' pistas') : '',
          result.corrections ? result.corrections + (result.corrections === 1 ? ' corrección' : ' correcciones') : ''
        ].filter(Boolean).join(' y ') : 'Sin ayuda'}</dd></div>
      </dl>
      <div className="result-actions">
        <button type="button" className="control" onClick={onReplay}>Volver a jugar</button>
        <button type="button" className="primary" onClick={onCatalog}>Más ejercicios <ArrowRight size={22} /></button>
      </div>
    </section>
  </main>;
}

function App() {
  const [buddy,setBuddy] = useState(firstBuddy);
  const [progress,setProgress] = useState({});
  const [screen,setScreen] = useState('home');
  const [zone,setZone] = useState(null);
  const [exercise,setExercise] = useState(0);
  const [studio,setStudio] = useState(false);
  const [attempt,setAttempt] = useState(0);
  const [result,setResult] = useState(null);
  const transfersSeen = useRef(new Set());

  function goHome() {
    setScreen('home');
    setStudio(false);
    window.scrollTo(0,0);
  }

  function openZone(id) {
    setZone(id);
    setScreen('catalog');
    window.scrollTo(0,0);
  }

  function openExercise(index) {
    setExercise(index);
    setAttempt(value => value + 1);
    setScreen('workshop');
    window.scrollTo(0,0);
  }

  function finish(metrics) {
    setProgress(value => ({...value,[zone + ':' + exercise]:true}));
    setResult(metrics);
    setScreen('result');
    window.scrollTo(0,0);
  }

  function chooseTransfer() {
    const variants = Array.from({length:getTransferVariantCount(zone, exercise)}, (_, index) =>
      getTransferEpisode(zone, exercise, index));
    const unseen = variants.find(episode => !transfersSeen.current.has(zone + ':' + episode));
    const episode = unseen ?? variants[0];
    transfersSeen.current.add(zone + ':' + episode);
    return {episode, fresh:unseen !== undefined};
  }

  return <>
    <header className="site-bar"><div>
      <button type="button" className="wordmark" onClick={goHome}><span><Sprout size={22} /></span> Escuela Semilla</button>
    </div></header>
    <div hidden={studio}>
      {screen === 'home' && <Home buddy={buddy} progress={progress} onOpen={openZone} onStudio={() => setStudio(true)} />}
      {screen === 'catalog' && <Catalog capsule={capsules[zone]} zone={zone} progress={progress}
        onHome={goHome} onSelect={openExercise} />}
      {screen === 'workshop' && <Workshop key={zone + attempt} capsuleId={zone} capsule={capsules[zone]} initial={exercise}
        buddy={buddy} onBack={() => openZone(zone)} onStudio={() => {window.speechSynthesis?.cancel();setStudio(true);}}
        onTransfer={chooseTransfer} onFinish={finish} />}
      {screen === 'result' && <Result buddy={buddy} result={result} onCatalog={() => openZone(zone)} onReplay={() => openExercise(exercise)} />}
    </div>
    {studio && <Studio buddy={buddy}
      onSave={next => {setBuddy(next);setStudio(false);}} onBack={() => setStudio(false)} />}
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
