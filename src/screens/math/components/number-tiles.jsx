export function NumberTiles({choices, onPick}) {
  return <div className="tiles" role="group" aria-label="¿Cuál es el total?">
    {choices.map(number => <button key={number} type="button" className="tile number-tile" onClick={() => onPick(number)}><strong>{number}</strong></button>)}
  </div>;
}
