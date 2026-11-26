import {ArrowRight, Star} from 'lucide-react';

export function StoryEnd({summary, onRestart, onBack}) {
  return <div className="story-end">
    <Star aria-hidden="true" className="award" size={52} />
    <h2>¡Fin! Tu dibujo se volvió un cuento</h2>
    <p className="progress">{summary.pages} páginas · leíste {summary.read} de {summary.total} palabras</p>
    <div className="result-actions">
      <button type="button" className="control" onClick={onBack}>Volver al rincón</button>
      <button type="button" className="primary" onClick={onRestart}>Dibujar otro cuento <ArrowRight size={22} /></button>
    </div>
  </div>;
}
