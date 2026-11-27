import {ArrowRight} from 'lucide-react';
import {childIcons} from '../../../hooks/use-school.js';

export function NewChildForm({form, first}) {
  return <form className="new-child" onSubmit={event => { event.preventDefault(); form.create(); }}>
    <h2>{first ? '¡Hola! ¿Cómo te llamas?' : '¿Eres nuevo? Crea tu perfil'}</h2>
    <input aria-label="Tu nombre" value={form.name} onChange={event => form.setName(event.target.value)} maxLength={24} placeholder="Tu nombre" />
    <div className="icon-choices" role="group" aria-label="Elige tu personaje">
      {childIcons.map(icon => <button key={icon} type="button" aria-pressed={form.icon === icon} aria-label={'Personaje ' + icon}
        onClick={() => form.setIcon(icon)}>{icon}</button>)}
    </div>
    <button type="submit" className="primary" disabled={!form.name.trim()}>¡A jugar! <ArrowRight size={22} /></button>
  </form>;
}
