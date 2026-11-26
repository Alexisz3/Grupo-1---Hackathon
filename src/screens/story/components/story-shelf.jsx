import {useStoryShelf} from '../../../hooks/use-story-shelf.js';
import {ShelfBook} from './shelf-book.jsx';

export function StoryShelf({onRead}) {
  const shelf = useStoryShelf();
  return <section className="story-shelf" aria-label="Mis cuentos">
    <div className="section-heading"><h2>Mis cuentos</h2><span className="progress">📚 {shelf.total}</span></div>
    {shelf.items.length ? <ol>{shelf.items.map(story => <ShelfBook key={story.id} story={story} onRead={() => onRead(story.id)} />)}</ol>
      : <p className="story-note">{shelf.loading ? 'Buscando tus cuentos…' : 'Todavía no hay cuentos. ¡Crea el primero con un dibujo!'}</p>}
    {shelf.more && <button type="button" className="control" disabled={shelf.loading} onClick={shelf.more}>Ver más cuentos</button>}
  </section>;
}
