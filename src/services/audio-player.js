// Parlante único de la app (Web Audio). El navegador bloquea el audio que no nace de un toque,
// y la narración llega segundos después (cuando la IA termina). El primer toque «abre» el parlante
// y desde ahí todo suena solo, sin depender de que el niño toque «Escuchar».
let context = null;
let source = null;
let turn = 0; // un stopClip mientras se decodifica cancela ese audio

function unlock() {
  context ||= new AudioContext();
  if (context.state === 'suspended') context.resume();
}

window.addEventListener('pointerdown', unlock, {capture:true});
window.addEventListener('keydown', unlock, {capture:true});

export function stopClip() {
  turn++;
  if (!source) return;
  // Avisa el final al que esperaba este audio, para que no quede colgado
  const ended = source.onended;
  source.onended = null;
  source.stop();
  source = null;
  ended?.();
}

// clip: ArrayBuffer de audio (mp3 o wav). Se copia porque decodeAudioData lo consume
export async function playClip(clip, onEnded) {
  unlock();
  stopClip();
  const mine = turn;
  const audio = await context.decodeAudioData(clip.slice(0));
  if (mine !== turn) return;
  source = context.createBufferSource();
  source.buffer = audio;
  source.connect(context.destination);
  source.onended = onEnded;
  source.start();
}
