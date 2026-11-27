import {useEffect, useRef, useState} from 'react';
import {aiService} from '../services/ai-service.js';
import {playClip, stopClip} from '../services/audio-player.js';

const withoutEmoji = text => text.replace(/\p{Extended_Pictographic}|️/gu, '').trim();
const sentences = text => withoutEmoji(text).split(/(?<=[.!?…])\s+/).filter(Boolean);

// Narra con la voz local del servidor (Kokoro) y, si no responde, con la voz del navegador
export function useNarration() {
  const [speaking, setSpeaking] = useState(false);
  const clips = useRef(new Map());
  const turn = useRef(0);

  useEffect(() => stop, []);

  function load(text, voice) {
    const key = voice + ':' + text;
    // Si la voz falla no se guarda, para reintentar después
    if (!clips.current.has(key)) clips.current.set(key, aiService.speak(withoutEmoji(text), voice).catch(() => { clips.current.delete(key); return null; }));
    return clips.current.get(key);
  }

  function stop() {
    turn.current++;
    stopClip();
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  // Se narra por frases: la primera suena apenas está lista mientras se generan las siguientes.
  // La promesa termina cuando todas las frases tienen audio (o falló alguna).
  async function narrate(text, voice = 'Leda') {
    stop();
    const current = turn.current;
    setSpeaking(true);
    // Una frase a la vez: si se piden juntas, la voz local las entrega todas al mismo tiempo y la primera tarda más
    let previous = Promise.resolve();
    const clips = sentences(text).map(part => [part, previous = previous.then(() => load(part, voice))]);
    playAll(clips, current);
    await Promise.all(clips.map(([, clip]) => clip));
  }

  async function playAll(clips, current) {
    for (const [index, [, pending]] of clips.entries()) {
      const clip = await pending;
      if (current !== turn.current) return;
      if (!clip) { browserVoice(clips.slice(index).map(([part]) => part).join(' ')); return; }
      await new Promise(done => playClip(clip, done).catch(done));
    }
    if (current === turn.current) setSpeaking(false);
  }

  function browserVoice(text) {
    if (!window.speechSynthesis) { setSpeaking(false); return; }
    const phrase = new SpeechSynthesisUtterance(withoutEmoji(text));
    const spanish = speechSynthesis.getVoices().find(voice => voice.lang.startsWith('es'));
    if (spanish) phrase.voice = spanish;
    phrase.lang = spanish?.lang || 'es';
    phrase.rate = .85;
    phrase.onend = phrase.onerror = () => setSpeaking(false);
    speechSynthesis.speak(phrase);
  }

  return {speaking, narrate, stop};
}
