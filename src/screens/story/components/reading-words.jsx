// ok: true leída, false no reconocida, null todavía sin leer
const state = (ok, listening) => ok ? 'read' : ok === false && !listening ? 'missed' : '';

export function ReadingWords({words, listening}) {
  return <p className="story-text" aria-live="polite">
    {words.map(({word, ok}, index) => <span key={index} className={state(ok, listening)}>{word} </span>)}
  </p>;
}
