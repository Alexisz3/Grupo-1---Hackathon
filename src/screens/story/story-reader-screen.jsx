import {ChevronLeft, ChevronRight, Square, Volume2} from 'lucide-react';
import {AgentStatus} from '../../components/agent-status.jsx';
import {useStoryReader} from '../../hooks/use-story-reader.js';
import {PageArt} from './components/page-art.jsx';

const owl = {name:'Búho', icon:'🦉'};

// Un cuento guardado, como libro: ilustración a la izquierda, texto a la derecha
export default function StoryReaderScreen({id, onBack}) {
  const reader = useStoryReader(id);
  const {page, story, narration} = reader;
  return <main className="story" data-color="pink">
    <button type="button" className="control" onClick={onBack}><ChevronLeft size={19} /> Mis cuentos</button>
    <div className="book">
      <section className="book-page left">
        {page && <PageArt drawing={story.drawing} picture={page.picture ? '/pictures/' + page.picture : 'none'} scene={[]} />}
      </section>
      <section className="book-page right">
        {!page && <AgentStatus buddy={owl} text="Abriendo tu cuento…" error={reader.error} />}
        {page && <article className="story-page">
          <div className="book-tools">
            <button type="button" className="chip" data-active={narration.speaking} onClick={reader.listen}>
              {narration.speaking ? <Square size={17} /> : <Volume2 size={17} />}{narration.speaking ? 'Narrando… (parar)' : 'Escuchar'}
            </button>
          </div>
          <p className="story-text">{page.text}</p>
          {page.choice && <p className="story-note">Elegiste: {page.choice}</p>}
          <div className="reader-nav">
            <button type="button" className="control" disabled={!reader.previous} onClick={reader.previous}><ChevronLeft size={20} /> Anterior</button>
            <button type="button" className="control" disabled={!reader.next} onClick={reader.next}>Siguiente <ChevronRight size={20} /></button>
          </div>
          <span className="page-number">{reader.index + 1} / {story.pages.length}</span>
        </article>}
      </section>
    </div>
  </main>;
}
