import {Palette} from 'lucide-react';

// El cuento le pide al niño que dibuje lo que pasa; onDraw vacío mientras ya está dibujando
export function DrawRequest({request, onDraw}) {
  return <div className="draw-request">
    <p><span aria-hidden="true">🎨</span> {request}</p>
    {onDraw ? <button type="button" className="tell-story" onClick={onDraw}><Palette size={22} /> ¡A dibujar!</button>
      : <p className="story-note">Dibuja en la página de la izquierda y toca «¡Listo! Sigue el cuento».</p>}
  </div>;
}
