import {characters} from '../../../time-travel.mjs';
import {CharacterCard} from './character-card.jsx';

export function CharacterPicker({onPick}) {
  return <div className="character-picker">
    <h1>¿A qué época quieres viajar?</h1>
    <div className="characters-grid">
      {Object.entries(characters).map(([id, character]) => <CharacterCard key={id} character={character} onPick={() => onPick(id)} />)}
    </div>
  </div>;
}
