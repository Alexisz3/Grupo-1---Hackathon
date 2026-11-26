export function TimeCard({card}) {
  return <li className="time-card">
    <span><small>Antes</small>{card.before}</span>
    <span aria-hidden="true">→</span>
    <span><small>Ahora</small>{card.now}</span>
  </li>;
}
