// Toda la IA es propia: texto con Ollama (cualquier endpoint compatible con chat completions), voz con Kokoro e ilustraciones con SD-Turbo.
// Corre en la misma máquina o en otra (modo dividido: la IA en la PC del equipo detrás de la puerta con clave AI_TOKEN).

// Con AI_TOKEN, cada pedido a la IA lleva la clave que pide la puerta de entrada (gateway)
const headers = () => ({'Content-Type':'application/json', ...(process.env.AI_TOKEN && {Authorization:'Bearer ' + process.env.AI_TOKEN})});
export const aiReady = () => Boolean(process.env.MODEL_URL && process.env.MODEL_NAME);
export const voiceReady = () => Boolean(process.env.TTS_URL);

// 90 s: en CPU la primera llamada carga el modelo y los modelos grandes escriben lento
export async function chatJson(messages, timeout = 90000) {
  const result = await fetch(process.env.MODEL_URL, {
    method:'POST', headers:headers(), signal:AbortSignal.timeout(timeout),
    body:JSON.stringify({model:process.env.MODEL_NAME, messages, response_format:{type:'json_object'}})
  });
  if (!result.ok) throw new Error('El modelo respondió ' + result.status);
  const data = await result.json();
  // Algunos modelos locales envuelven el JSON en ```json
  return JSON.parse(data.choices[0].message.content.trim().replace(/^```(?:json)?\s*|\s*```$/g, ''));
}

// ponytail: caché en memoria de 100 audios, pasar a S3 si se repiten entre reinicios
const voices = new Map();
// Voz local (Kokoro) para cada personaje: [voz, velocidad]
const localVoices = {Leda:['ef_dora', 1], Sulafat:['ef_dora', .88], Puck:['em_alex', 1.08], Charon:['em_santa', .92]};

export async function speak(text, voice = 'Leda') {
  const key = voice + ':' + text;
  if (voices.has(key)) return voices.get(key);
  const audio = await localSpeak(text, voice);
  if (voices.size >= 100) voices.delete(voices.keys().next().value);
  voices.set(key, audio);
  return audio;
}

async function localSpeak(text, voice) {
  const [name, speed] = localVoices[voice] || localVoices.Leda;
  const result = await fetch(process.env.TTS_URL, {
    method:'POST', signal:AbortSignal.timeout(30000), headers:headers(),
    body:JSON.stringify({model:'kokoro', input:text, voice:name, lang_code:'e', response_format:'mp3', speed})
  });
  if (!result.ok) throw new Error('La voz local respondió ' + result.status);
  return {type:'audio/mpeg', data:Buffer.from(await result.arrayBuffer())};
}

// Ilustraciones con el ilustrador local. Sin él, el libro muestra el dibujo del niño.
// Solo usa texto: la descripción del dibujo ya viene en el prompt.
export const pictureReady = () => Boolean(process.env.IMAGE_URL);
const style = "children's picture book illustration, soft watercolor, warm pastel colors, fine ink outlines, cute and whimsical, ";

export async function paint(prompt, seed) {
  const result = await fetch(process.env.IMAGE_URL, {
    method:'POST', signal:AbortSignal.timeout(120000), headers:headers(),
    body:JSON.stringify({prompt:style + prompt + ', no text', seed})
  });
  if (!result.ok) throw new Error('El ilustrador respondió ' + result.status);
  return {type:'image/webp', data:Buffer.from(await result.arrayBuffer())};
}
