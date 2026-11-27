import {Pencil} from 'lucide-react';
import {capsules} from '../../capsules.mjs';
import {Avatar} from '../../Workshop.jsx';
import {ZoneCard} from './components/zone-card.jsx';

export default function HomeScreen({buddy, stars, onOpen, onStudio, onSwitch}) {
  return <main className="zones">
    <span className="deco" aria-hidden="true"><i>⭐</i><i>😊</i><i>☁️</i><i>✏️</i><i>😊</i><i>⭐</i><i>☁️</i></span>
    <div className="zones-top">
      <button type="button" className="pill" onClick={onStudio}>
        <Avatar buddy={buddy} />Mi personaje: <strong>{buddy.name}</strong><Pencil size={16} />
      </button>
      <span className="pill">Premios Ganados: {stars} {stars === 1 ? 'Estrella' : 'Estrellas'}</span>
      <button type="button" className="pill" onClick={onSwitch}>Cambiar de niño</button>
    </div>
    <h1>¡Selecciona tu Zona de Aprendizaje!</h1>
    <div className="zone-grid">
      {Object.entries(capsules).map(([id, capsule]) => <ZoneCard key={id} capsule={capsule} onOpen={() => onOpen(id)} />)}
    </div>
    <p className="zones-banner">¡Puedes elegir cualquier zona para jugar y aprender!<br />¡Tu enfoque divertido y creativo te dará puntos extra!</p>
  </main>;
}
