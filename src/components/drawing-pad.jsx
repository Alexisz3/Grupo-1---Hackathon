import {Brush, Eraser, Sparkles, Trash2, Undo2} from 'lucide-react';
import {padColors} from '../hooks/use-drawing-pad.js';

// Tablero de dibujo del cuento y de «Mi personaje»: colores, tamaño, borrar, deshacer y la acción con IA
export function DrawingPad({pad, action, busy = false, onDone}) {
  return <div className="drawing-pad">
    <div className="pad-tools">
      <div className="pad-colors" role="group" aria-label="Colores">
        {padColors.map(value => <button key={value} type="button" aria-label={'Color ' + value} aria-pressed={!pad.erasing && pad.color === value}
          style={{'--swatch':value}} onClick={() => pad.setColor(value)} />)}
      </div>
      <div className="pad-actions">
        <label>Tamaño <input type="range" min="4" max="30" value={pad.size} onChange={event => pad.setSize(Number(event.target.value))} /></label>
        <button type="button" className="chip" data-active={!pad.erasing} onClick={() => pad.setErasing(false)}><Brush size={17} /> Dibujar</button>
        <button type="button" className="chip" data-active={pad.erasing} onClick={() => pad.setErasing(true)}><Eraser size={17} /> Borrar</button>
        <button type="button" className="chip" onClick={pad.undo} disabled={pad.empty}><Undo2 size={17} /> Deshacer</button>
        <button type="button" className="chip danger" onClick={pad.clear} disabled={pad.empty}><Trash2 size={17} /> Limpiar</button>
      </div>
    </div>
    <canvas ref={pad.canvas} width={600} height={720} aria-label="Hoja para dibujar" {...pad.handlers} />
    <button type="button" className="tell-story" onClick={onDone} disabled={pad.empty || busy}><Sparkles size={22} /> {action}</button>
  </div>;
}
