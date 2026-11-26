import {ArrowRight, ChevronLeft} from 'lucide-react';
import {DrawingPad} from '../../components/drawing-pad.jsx';
import {useStudio} from '../../hooks/use-studio.js';
import {Avatar} from '../../Workshop.jsx';
import {CharacterForm} from './components/character-form.jsx';

// Mismo libro que el cuento: a la izquierda el tablero, a la derecha el nombre, qué es y el retrato
export default function StudioScreen({buddy, onSave, onBack}) {
  const studio = useStudio(buddy, onSave);
  return <main className="story studio">
    <button type="button" className="control" onClick={onBack}><ChevronLeft size={19} /> Volver</button>
    <div className="book">
      <section className="book-page left">
        <DrawingPad pad={studio.pad} action="Crear mi personaje con IA" busy={studio.busy} onDone={studio.create} />
      </section>
      <section className="book-page right studio-page">
        <div className="studio-head">
          <Avatar buddy={{icon:studio.icon, image:studio.image}} className={studio.busy ? 'thinking' : ''} />
          <h1>Mi personaje</h1>
        </div>
        <CharacterForm studio={studio} />
        <button type="button" className="primary" disabled={studio.busy} onClick={studio.save}>Usar mi personaje <ArrowRight size={22} /></button>
      </section>
    </div>
  </main>;
}
