export function CharacterCard({character, onPick}) {
  return <button type="button" className="character-card" onClick={onPick}>
    <span className="character-emoji" aria-hidden="true">{character.emoji}</span>
    <strong>{character.topic || character.name}</strong>
    <span>{character.where}</span>
    <span className="year">{character.era || 'Año ' + character.year}</span>
  </button>;
}
