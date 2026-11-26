import {ChevronLeft} from 'lucide-react';
import {AgentStatus} from '../../components/agent-status.jsx';
import {DrawingPad} from '../../components/drawing-pad.jsx';
import {useStory} from '../../hooks/use-story.js';
import {PageArt} from './components/page-art.jsx';
import {StoryPage} from './components/story-page.jsx';

const owl = {name:'Búho', icon:'🦉'};

// El cuento es un libro abierto: a la izquierda el dibujo o la ilustración, a la derecha el texto
export default function StoryScreen({onBack, onComplete}) {
  const story = useStory(onComplete);
  const waiting = story.phase === 'loading' || story.phase === 'error';
  return <main className="story" data-color="pink">
    <button type="button" className="control" onClick={onBack}><ChevronLeft size={19} /> Rincón del Cuento</button>
    <div className="book">
      <section className="book-page left">
        {story.phase === 'draw' && <DrawingPad pad={story.pad} action="¡Cuenta mi cuento!" onDone={story.start} />}
        {story.phase === 'redraw' && <DrawingPad pad={story.pad} action="¡Listo! Sigue el cuento" onDone={story.finishDrawing} />}
        {story.phase !== 'draw' && story.phase !== 'redraw' && <PageArt drawing={story.drawing} picture={story.page ? story.picture : null} scene={story.page?.scene || []} />}
      </section>
      <section className="book-page right">
        {story.phase === 'draw' && <p className="book-intro"><span aria-hidden="true">📖</span>Dibuja tu mundo y toca <strong>«¡Cuenta mi cuento!»</strong> para empezar tu aventura.</p>}
        {waiting && <AgentStatus buddy={owl} text={story.page ? 'Escribiendo la página…' : 'Mirando tu dibujo…'} error={story.error} onRetry={story.retry} />}
        {(story.phase === 'page' || story.phase === 'redraw') && <StoryPage story={story} onBack={onBack} />}
      </section>
    </div>
  </main>;
}
