import {useState} from 'react';
import {CountItem} from './count-item.jsx';

// Los dos grupos de la suma. Tocar cada cosa la numera, para contar una por una
export function CountBoard({problem}) {
  const [counted, setCounted] = useState([]); // visual state
  const items = Array.from({length:problem.total}, (_, index) => index);
  const toggle = index => setCounted(value => value.includes(index) ? value.filter(item => item !== index) : [...value, index]);
  return <div className="count-board">
    <p className="scene-text">{problem.setup}</p>
    <div className="count-groups">
      <div>{items.slice(0, problem.a).map(index => <CountItem key={index} emoji={problem.emoji} order={counted.indexOf(index) + 1} onToggle={() => toggle(index)} />)}</div>
      <span className="join" aria-hidden="true">+</span>
      <div className="added">{items.slice(problem.a).map(index => <CountItem key={index} emoji={problem.emoji} order={counted.indexOf(index) + 1} onToggle={() => toggle(index)} />)}</div>
    </div>
    <p className="count-note" role="status">{counted.length ? 'Contaste ' + counted.length : 'Toca cada ' + problem.emoji + ' para contar'}</p>
  </div>;
}
