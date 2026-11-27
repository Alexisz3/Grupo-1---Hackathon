import {Avatar} from '../../../Workshop.jsx';

export function ChildCard({child, onPick}) {
  return <li>
    <button type="button" className="child-card" onClick={onPick}>
      <Avatar buddy={child} />
      <strong>{child.name}</strong>
    </button>
  </li>;
}
