import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowRight, Check, ChevronLeft, Sparkles, Sprout, Star} from 'lucide-react';
import '@fontsource-variable/fredoka';
import '@fontsource-variable/lora';
import {capsules} from './capsules.mjs';
import Workshop from './Workshop.jsx';
import TimeTravelScreen from './screens/history/time-travel-screen.jsx';
import HomeScreen from './screens/home/home-screen.jsx';
import MathTutorScreen from './screens/math/math-tutor-screen.jsx';
import StoryReaderScreen from './screens/story/story-reader-screen.jsx';
import StoryScreen from './screens/story/story-screen.jsx';
import {StoryShelf} from './screens/story/components/story-shelf.jsx';
import StudioScreen from './screens/studio/studio-screen.jsx';
import {useSchool} from './hooks/use-school.js';
import './style.css';

// La actividad con IA de cada zona, arriba de los ejercicios
const agents = {
  math:buddy => ['¡' + buddy.name + ' se equivoca!', 'Descubre su error y enséñale a sumar'],
  story:() => ['Crear un cuento con IA', 'Haz un dibujo y la IA lo convierte en un cuento'],
  history:() => ['Viaje en el tiempo', 'Conversa por voz con personas del pasado']
};

function Catalog({capsule, zone, buddy, progress, onHome, onSelect, onAgent, onRead}) {
  const [agentTitle, agentDetail] = agents[zone](buddy);
  const heading = useRef(null);
  const count = capsule.cases.filter((_,index) => progress[zone + ':' + index]).length;
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
      <button type="button" className="agent-entry" onClick={onAgent}>
        <Sparkles size={30} /><span><strong>{agentTitle}</strong>{agentDetail}</span><ArrowRight size={24} />
      </button>
      {zone === 'story' && <StoryShelf onRead={onRead} />}
      <div className="section-heading">
        <h2>Elige un ejercicio</h2>
        <span className="progress"><Star size={17} /> {count} de {capsule.cases.length}</span>
      </div>
      <ol className="exercise-list">
        {capsule.cases.map((activity,index) => {
          const completed = progress[zone + ':' + index];
          return <li key={activity.title}>
            <button type="button" onClick={() => onSelect(index)}>
              <span className="exercise-number" aria-hidden="true">{index + 1}</span>
              <strong>{activity.title}</strong>
              {completed ? <Check size={20} aria-label="Completado" /> : <ArrowRight size={20} aria-hidden="true" />}
            </button>
          </li>;
        })}
      </ol>
    </section>
  </main>;
}

function Result({buddy, independent, onCatalog, onReplay}) {
  const heading = useRef(null);
  useEffect(() => {heading.current?.focus();}, []);
  return <main className="result">
    <section className="workshop-panel">
      <Star aria-hidden="true" className="award" size={78} />
      <h1 tabIndex={-1} ref={heading}>¡Gracias, profe!</h1>
      <p>Le enseñaste a {buddy.name} en dos situaciones.</p>
      <p className="progress">{independent ? 'Reto nuevo completado sin pistas' : 'Reto nuevo completado con ayuda'}</p>
      <div className="result-actions">
        <button type="button" className="control" onClick={onReplay}>Volver a jugar</button>
        <button type="button" className="primary" onClick={onCatalog}>Más ejercicios <ArrowRight size={22} /></button>
      </div>
    </section>
  </main>;
}

function App() {
  const {buddy, progress, saveError, saveBuddy, addStar} = useSchool();
  const [screen,setScreen] = useState('home');
  const [zone,setZone] = useState(null);
  const [exercise,setExercise] = useState(0);
  const [studio,setStudio] = useState(false);
  const [attempt,setAttempt] = useState(0);
  const [independent,setIndependent] = useState(false);
  const [reading,setReading] = useState(null);

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

  // Las estrellas de la IA no cuentan en «N de 10» del catálogo, solo en los premios de la portada
  const earnAgentStar = () => addStar(zone + ':ia:' + Date.now());

  function finish(withoutHelp) {
    addStar(zone + ':' + exercise);
    setIndependent(withoutHelp);
    setScreen('result');
    window.scrollTo(0,0);
  }

  return <>
    <header className="site-bar" hidden={screen === 'home'}><div>
      <button type="button" className="wordmark" onClick={goHome}><span><Sprout size={22} /></span> Escuela Semilla</button>
    </div></header>
    <div hidden={studio}>
      {screen === 'home' && <HomeScreen buddy={buddy} stars={Object.keys(progress).length} onOpen={openZone} onStudio={() => setStudio(true)} />}
      {screen === 'catalog' && <Catalog capsule={capsules[zone]} zone={zone} buddy={buddy} progress={progress}
        onHome={goHome} onSelect={openExercise} onAgent={() => setScreen('agent')} onRead={id => {setReading(id);setScreen('reader');window.scrollTo(0,0);}} />}
      {screen === 'reader' && <StoryReaderScreen id={reading} onBack={() => openZone('story')} />}
      {screen === 'agent' && zone === 'math' && <MathTutorScreen buddy={buddy} onBack={() => openZone(zone)} onComplete={earnAgentStar} />}
      {screen === 'agent' && zone === 'story' && <StoryScreen onBack={() => openZone(zone)} onComplete={earnAgentStar} />}
      {screen === 'agent' && zone === 'history' && <TimeTravelScreen onBack={() => openZone(zone)} onComplete={earnAgentStar} />}
      {screen === 'workshop' && <Workshop key={zone + attempt} capsuleId={zone} capsule={capsules[zone]} initial={exercise}
        buddy={buddy} onBack={() => openZone(zone)} onStudio={() => setStudio(true)} onFinish={finish} />}
      {screen === 'result' && <Result buddy={buddy} independent={independent} onCatalog={() => openZone(zone)} onReplay={() => openExercise(exercise)} />}
    </div>
    {studio && <StudioScreen buddy={buddy}
      onSave={next => {saveBuddy(next);setStudio(false);}} onBack={() => setStudio(false)} />}
    {saveError && <p className="save-error" role="alert">{saveError}</p>}
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
