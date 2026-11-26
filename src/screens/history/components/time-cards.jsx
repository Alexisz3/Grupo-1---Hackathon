import {TimeCard} from './time-card.jsx';

export function TimeCards({cards}) {
  return <section className="time-cards" aria-label="Tu álbum del tiempo">
    <h2>Tu álbum del tiempo · {Math.min(cards.length, 3)} de 3 {cards.length >= 3 ? '⭐' : ''}</h2>
    {cards.length ? <ol>{cards.map((card, index) => <TimeCard key={index} card={card} />)}</ol>
      : <p className="story-note">Pregunta algo y guarda cómo era antes y cómo es ahora.</p>}
  </section>;
}
