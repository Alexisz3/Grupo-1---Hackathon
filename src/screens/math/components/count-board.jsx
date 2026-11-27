import {useState} from 'react';
import {CountItem} from './count-item.jsx';

// Los dos grupos de la suma. Tocar cada cosa la numera, para contar una por una
export function CountBoard({problem}) {
  const [counted, setCounted] = useState([]); // visual state
  const {a, b, total, operation} = problem;
  const equalGroups = operation === 'multiply' || operation === 'divide';
  const size = operation === 'divide' ? total : a;
  const groups = equalGroups ? Array(b).fill(size) : operation === 'subtract' ? [total, b] : [a, b];
  function toggle(index) {
    setCounted(value => value.includes(index) ? value.filter(item => item !== index) : [...value,index]);
  }
  const subtracted = operation === 'subtract';
  return <div className="count-board">
    <p className="scene-text">{problem.setup}</p>
    <ul className="count-groups" aria-label="Grupos de objetos">
      {groups.map((count, group) => {
        const removed = subtracted && group === 1;
        const label = equalGroups ? (operation === 'divide' ? 'Plato ' : 'Hoja ') + (group + 1)
          : subtracted ? (removed ? 'Regaló' : 'Quedan') : (group === 0 ? 'Al inicio' : 'Llegaron');
        const picked = operation === 'divide' ? counted.filter(index => index.startsWith(group + ':')) : counted;
        return <li className={removed ? 'removed' : ''} key={group}>
          <strong>{label}</strong>
          <div className="count-items">
            {Array.from({length:count}, (_, i) => {
              const id = group + ':' + i;
              return removed ? <span className="count-item" key={id} aria-hidden="true">{problem.emoji}</span> :
                <CountItem key={id} emoji={problem.emoji} order={picked.indexOf(id) + 1} onToggle={() => toggle(id)} />;
            })}
            {count === 0 && <span>0</span>}
          </div>
        </li>;
      })}
    </ul>
    <p className="count-note" role="status">
      {operation === 'divide' ? 'Cuenta las galletas de un plato.' : counted.length ? 'Contaste ' + counted.length : 'Toca cada ' + problem.emoji + ' para contar'}
    </p>
  </div>;
}
