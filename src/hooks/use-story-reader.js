import {useEffect, useState} from 'react';
import {schoolService} from '../services/school-service.js';
import {useNarration} from './use-narration.js';

// Releer un cuento guardado, página por página, con narración
export function useStoryReader(id) {
  const [story, setStory] = useState(null);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState('');
  const narration = useNarration();

  useEffect(() => { schoolService.story(id).then(setStory, failure => setError(failure.message)); }, [id]);

  function go(next) {
    narration.stop();
    setIndex(next);
  }

  const page = story?.pages[index];
  return {story, page, index, error, narration,
    previous:index > 0 ? () => go(index - 1) : null,
    next:story && index < story.pages.length - 1 ? () => go(index + 1) : null,
    listen:() => narration.speaking ? narration.stop() : narration.narrate(page.text)};
}
