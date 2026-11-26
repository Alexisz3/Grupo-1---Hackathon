// Cualquier endpoint compatible con chat completions: Gemini ahora, Ollama en Docker, Bedrock en AWS
export const aiReady = () => Boolean(process.env.MODEL_URL && process.env.MODEL_NAME);
export const voiceReady = () => Boolean(process.env.TTS_URL || process.env.GEMINI_KEY);

// 45 s: un modelo local en CPU tarda más en la primera llamada, mientras se carga
export async function chatJson(messages, timeout = 45000) {
  const headers = {'Content-Type':'application/json'};
  if (process.env.MODEL_KEY) headers.Authorization = 'Bearer ' + process.env.MODEL_KEY;
  const body = {model:process.env.MODEL_NAME, messages, response_format:{type:'json_object'}};
  if (process.env.MODEL_EFFORT) body.reasoning_effort = process.env.MODEL_EFFORT;
  const result = await fetch(process.env.MODEL_URL, {method:'POST', headers, body:JSON.stringify(body), signal:AbortSignal.timeout(timeout)});
  if (!result.ok) throw new Error('El modelo respondió ' + result.status);
  const data = await result.json();
  // Algunos modelos locales envuelven el JSON en ```json
  return JSON.parse(data.choices[0].message.content.trim().replace(/^```(?:json)?\s*|\s*```$/g, ''));
}

// ponytail: caché en memoria de 100 audios, pasar a S3 si se repiten entre reinicios
const voices = new Map();
// Voz local (Kokoro) para cada personaje: [voz, velocidad]
const localVoices = {Leda:['ef_dora', 1], Sulafat:['ef_dora', .88], Puck:['em_alex', 1.08], Charon:['em_santa', .92]};

// Primero la voz local (sin límites); si no está, Gemini (3 audios por minuto en el plan gratis)
export async function speak(text, voice = 'Leda') {
  const key = voice + ':' + text;
  if (voices.has(key)) return voices.get(key);
  const audio = process.env.TTS_URL && await localSpeak(text, voice).catch(() => null) || process.env.GEMINI_KEY && await geminiSpeak(text, voice);
  if (!audio) throw new Error('No hay voz disponible');
  if (voices.size >= 100) voices.delete(voices.keys().next().value);
  voices.set(key, audio);
  return audio;
}

async function localSpeak(text, voice) {
  const [name, speed] = localVoices[voice] || localVoices.Leda;
  const result = await fetch(process.env.TTS_URL, {
    method:'POST', signal:AbortSignal.timeout(30000), headers:{'Content-Type':'application/json'},
    body:JSON.stringify({model:'kokoro', input:text, voice:name, lang_code:'e', response_format:'mp3', speed})
  });
  if (!result.ok) throw new Error('La voz local respondió ' + result.status);
  return {type:'audio/mpeg', data:Buffer.from(await result.arrayBuffer())};
}

async function geminiSpeak(text, voice) {
  const model = process.env.TTS_MODEL || 'gemini-3.8-flash-tts';
  const result = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
    method:'POST', signal:AbortSignal.timeout(30000),
    headers:{'Content-Type':'application/json', 'x-goog-api-key':process.env.GEMINI_KEY},
    body:JSON.stringify({
      contents:[{parts:[{text:'Narra con voz cálida y pausada de cuentacuentos para niños: ' + text}]}],
      generationConfig:{responseModalities:['AUDIO'], speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:voice}}}}
    })
  });
  if (!result.ok) throw new Error('La voz respondió ' + result.status);
  const {mimeType, data} = (await result.json()).candidates[0].content.parts[0].inlineData;
  const audio = Buffer.from(data, 'base64');
  return {type:'audio/wav', data:mimeType.includes('wav') ? audio : withWavHeader(audio, Number(mimeType.match(/rate=(\d+)/)?.[1] || 24000))};
}

// PCM de 16 bits mono, como lo entregan los modelos de voz de Gemini 2.5
function withWavHeader(pcm, rate) {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24); header.writeUInt32LE(rate * 2, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

// Ilustraciones: el ilustrador local (SD-Turbo, IMAGE_URL) o un modelo de imagen de Gemini (IMAGE_MODEL).
// Sin ninguno, el libro muestra el dibujo del niño.
export const pictureReady = () => Boolean(process.env.IMAGE_URL || (process.env.IMAGE_MODEL && process.env.GEMINI_KEY));
const style = "children's picture book illustration, soft watercolor, warm pastel colors, fine ink outlines, cute and whimsical, ";

// El ilustrador local solo usa el texto (la descripción del dibujo ya viene en el prompt); Gemini recibe también el dibujo
export const paint = (prompt, drawing, seed) => process.env.IMAGE_URL ? localPaint(prompt, seed) : geminiPaint(prompt, drawing);

async function localPaint(prompt, seed) {
  const result = await fetch(process.env.IMAGE_URL, {
    method:'POST', signal:AbortSignal.timeout(120000), headers:{'Content-Type':'application/json'},
    body:JSON.stringify({prompt:style + prompt + ', no text', seed})
  });
  if (!result.ok) throw new Error('El ilustrador respondió ' + result.status);
  return {type:'image/webp', data:Buffer.from(await result.arrayBuffer())};
}

async function geminiPaint(prompt, drawing) {
  const parts = [{text:style + (drawing ? "recreate the child's attached drawing in this style, " : '') + prompt + ', no text'}];
  if (drawing) parts.push({inlineData:{mimeType:'image/png', data:drawing.slice(drawing.indexOf(',') + 1)}});
  const result = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + process.env.IMAGE_MODEL + ':generateContent', {
    method:'POST', signal:AbortSignal.timeout(60000),
    headers:{'Content-Type':'application/json', 'x-goog-api-key':process.env.GEMINI_KEY},
    body:JSON.stringify({contents:[{parts}], generationConfig:{responseModalities:['IMAGE'], imageConfig:{aspectRatio:'3:4'}}})
  });
  if (!result.ok) throw new Error('La ilustración respondió ' + result.status);
  const image = (await result.json()).candidates[0].content.parts.find(part => part.inlineData).inlineData;
  return {type:image.mimeType, data:Buffer.from(image.data, 'base64')};
}
