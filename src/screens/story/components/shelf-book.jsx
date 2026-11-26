const date = new Intl.DateTimeFormat('es', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'});

export function ShelfBook({story, onRead}) {
  return <li>
    <button type="button" className="shelf-book" onClick={onRead}>
      {story.cover ? <img src={'/pictures/' + story.cover} alt="" /> : <span className="shelf-cover" aria-hidden="true">📖</span>}
      <strong>{story.opening}</strong>
      <small>{date.format(new Date(story.createdAt))} · {story.pages} {story.pages === 1 ? 'página' : 'páginas'}{story.finished ? ' · terminado' : ''}
        {story.total ? ' · leíste ' + story.read + ' de ' + story.total + ' palabras' : ''}</small>
    </button>
  </li>;
}
