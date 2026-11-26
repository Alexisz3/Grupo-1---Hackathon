import {quickCharacters} from '../../../hooks/use-studio.js';

export function CharacterForm({studio}) {
  return <div className="character-form">
    <label htmlFor="buddyName">Nombre</label>
    <input id="buddyName" value={studio.name} onChange={event => studio.setName(event.target.value)} maxLength={24} />
    <label htmlFor="buddyHint">¿Qué dibujaste?</label>
    <input id="buddyHint" value={studio.hint} onChange={event => studio.setHint(event.target.value)} maxLength={80}
      placeholder="Ej.: un dinosaurio verde con alas de mariposa" disabled={studio.busy} />
    <p className="story-note">Dibuja a la izquierda, escribe qué es y toca «Crear mi personaje con IA».</p>
    <p className="feedback" role="status">{studio.message}</p>
    <div className="quick-characters" role="group" aria-label="O elige uno listo">
      {quickCharacters.map(([emoji, label]) => <button key={emoji} type="button" className="chip" data-active={!studio.image && studio.icon === emoji}
        disabled={studio.busy} onClick={() => studio.pick(emoji)}><span aria-hidden="true">{emoji}</span>{label}</button>)}
    </div>
  </div>;
}
