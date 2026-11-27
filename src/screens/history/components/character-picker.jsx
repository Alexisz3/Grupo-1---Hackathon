import {characters} from '../../../time-travel.mjs';
import {CharacterCard} from './character-card.jsx';

export function CharacterPicker({onPick}) {
  const entries = Object.entries(characters);
  return <div className="character-picker">
    <h1>Viaja por la historia del mundo</h1>
    {[[true,'Explora el mundo'],[false,'Historias de Chile y Ecuador']].map(([world,label]) =>
      <section className="history-region" key={label}>
        <h2>{label}</h2>
        <div className="characters-grid">
          {entries.filter(([, character]) => Boolean(character.topic) === world).map(([id, character]) =>
            <CharacterCard key={id} character={character} onPick={() => onPick(id)} />)}
        </div>
      </section>
    )}
  </div>;
}
