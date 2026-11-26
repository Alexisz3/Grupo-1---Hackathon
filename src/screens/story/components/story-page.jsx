import {Mic, Square, Volume2} from 'lucide-react';
import {ReadingWords} from './reading-words.jsx';
import {DrawRequest} from './draw-request.jsx';
import {StoryEnd} from './story-end.jsx';

const readCount = words => words.filter(word => word.ok).length;

// Página derecha del libro: el texto, narrar, leer en voz alta y elegir qué pasa
export function StoryPage({story, onBack}) {
  const {page, reading, narration} = story;
  const attempted = !reading.listening && reading.words.some(word => word.ok !== null);
  return <article className="story-page">
    <div className="book-tools">
      <button type="button" className="chip" data-active={narration.speaking} onClick={story.listenAgain}>
        {narration.speaking ? <Square size={17} /> : <Volume2 size={17} />}{narration.speaking ? 'Narrando… (parar)' : 'Escuchar'}
      </button>
      {reading.supported && <button type="button" className="chip" data-active={reading.listening} onClick={story.listen}>
        <Mic size={17} />{reading.listening ? 'Terminé de leer' : 'Leer yo'}
      </button>}
    </div>
    <ReadingWords words={reading.words} listening={reading.listening} />
    <p className="feedback" role="status">{attempted ? '¡Leíste ' + readCount(reading.words) + ' de ' + reading.words.length + ' palabras!' : ''}</p>
    {page.end && <StoryEnd summary={story.summary} onRestart={story.restart} onBack={onBack} />}
    {page.draw && <DrawRequest request={page.draw} onDraw={story.phase === 'page' ? story.drawMore : null} />}
    {page.options.length > 0 && <div className="story-choice">
      <h2>{page.question}</h2>
      <div className="places">
        {page.options.map(option => <button key={option} type="button" className="place" onClick={() => story.choose(option)}>{option}</button>)}
      </div>
    </div>}
    <span className="page-number">{story.number} / 5</span>
  </article>;
}
