// order 0: todavía sin contar
export function CountItem({emoji, order, onToggle}) {
  return <button type="button" className="count-item" aria-pressed={order > 0} onClick={onToggle} aria-label={order ? 'Contado ' + order : 'Contar'}>
    <span aria-hidden="true">{emoji}</span>{order > 0 && <b>{order}</b>}
  </button>;
}
