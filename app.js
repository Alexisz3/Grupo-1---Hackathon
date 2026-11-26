const $ = id => document.getElementById(id);
const zoneButtons = [...document.querySelectorAll('[data-zone]')];
const canvas = document.querySelector('canvas');
const pen = canvas.getContext('2d');
const completed = new Set();

let avatar = '🐥';
let drawing = false;
let dragging = false;
let zone = 'math';
let round = 0;
let placed = 0;
let view = 'zones';
let nameText = 'Pipo';
let activityVersion = 0;

function button(parent, text, action) {
  const control = document.createElement('button');
  control.type = 'button';
  control.textContent = text;
  control.onclick = action;
  parent.append(control);
  return control;
}

function clearDrawing() {
  pen.clearRect(0, 0, canvas.width, canvas.height);
  drawing = false;
  if (typeof resetCharacter === 'function') resetCharacter();
}

for (const [icon, name] of [['🐥', 'Pollito'], ['🐢', 'Tortuga'], ['🐰', 'Conejo']]) {
  const option = button($('avatars'), icon + ' ' + name, () => {
    avatar = icon;
    clearDrawing();
    for (const item of $('avatars').children) item.setAttribute('aria-pressed', String(item === option));
  });
  option.setAttribute('aria-pressed', String(icon === avatar));
}

function point(event) {
  const rect = canvas.getBoundingClientRect();
  return [(event.clientX - rect.left) * canvas.width / rect.width,
    (event.clientY - rect.top) * canvas.height / rect.height];
}

canvas.onpointerdown = event => {
  if (!event.isPrimary) return;
  canvas.setPointerCapture(event.pointerId);
  dragging = drawing = true;
  pen.strokeStyle = '#285546';
  pen.lineWidth = 5;
  pen.lineCap = 'round';
  pen.beginPath();
  const [x, y] = point(event);
  pen.moveTo(x - .1, y);
  pen.lineTo(x, y);
  pen.stroke();
};
canvas.onpointermove = event => {
  if (!dragging || !event.isPrimary) return;
  pen.lineTo(...point(event));
  pen.stroke();
};
canvas.onlostpointercapture = () => { dragging = false; };
$('erase').onclick = () => {
  clearDrawing();
  for (const item of $('avatars').children) item.setAttribute('aria-pressed', String(item.textContent.startsWith(avatar)));
};

function show(screen) {
  window.speechSynthesis?.cancel();
  view = screen;
  for (const id of ['zones', 'setup', 'lesson', 'done']) $(id).hidden = id !== screen;
  $('activityNav').hidden = screen === 'zones' || screen === 'done';
  $('edit').hidden = screen !== 'lesson';
}

function showZones() {
  activityVersion++;
  show('zones');
  zoneButtons.find(control => control.dataset.zone === zone).focus();
}

$('back').onclick = $('again').onclick = showZones;
$('edit').onclick = () => {
  show('setup');
  $('name').focus();
};
$('start').onclick = () => {
  updateBuddy();
  show('lesson');
  $('prompt').focus();
};

function updateBuddy() {
  nameText = $('name').value.trim() || 'Pipo';
  $('buddyName').textContent = nameText;
  $('face').textContent = avatar;
  if (drawing) {
    const picture = new Image();
    picture.src = characterImage || canvas.toDataURL();
    picture.alt = 'Tu personaje';
    $('face').replaceChildren(picture);
  }
}

for (const control of zoneButtons) {
  control.onclick = () => {
    zone = control.dataset.zone;
    activityVersion++;
    round = 0;
    placed = 0;
    updateBuddy();
    show('lesson');
    if (zone === 'math') startMath();
    else showSequenceIntro();
  };
}

function speak(text) {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(text);
  voice.lang = 'es';
  voice.rate = .85;
  speechSynthesis.speak(voice);
}

function screen(question, audio = question) {
  window.speechSynthesis?.cancel();
  $('stage').textContent = zoneButtons.find(control => control.dataset.zone === zone).textContent.trim();
  $('prompt').textContent = question;
  $('board').replaceChildren();
  $('choices').replaceChildren();
  $('feedback').textContent = '';
  $('hint').hidden = $('next').hidden = $('explain').hidden = true;
  $('explain').open = false;
  $('reply').textContent = '';
  $('answer').value = '';
  $('send').disabled = false;
  $('listen').hidden = !window.speechSynthesis;
  $('listen').onclick = () => speak([audio, $('feedback').textContent].join(' '));
  $('prompt').focus();
}

function next(text, action) {
  $('next').textContent = text;
  $('next').onclick = action;
  $('next').hidden = false;
}

function finish(result) {
  completed.add(zone);
  $('reward').textContent = '⭐ ' + completed.size + ' de 3 estrellas';
  $('result').textContent = result;
  show('done');
  $('finishTitle').focus();
}

const rounds = [[3, 2], [4, 2]];
let explanation = {};

function seedGroup(parent, count, symbol, label) {
  const group = document.createElement('div');
  group.className = 'seedGroup';
  group.setAttribute('role', 'img');
  group.setAttribute('aria-label', label + ', ' + count);
  group.textContent = symbol.repeat(count);
  parent.append(group);
  return group;
}

function startMath() {
  const [first, extra] = rounds[round];
  let added = 0;
  explanation = {};
  screen('Pon ' + extra + (extra === 1 ? ' semilla más' : ' semillas más'), 'En la caja hay ' + first + ' semillas. Toca ' + extra + ' de las que están abajo para ponerlas en la caja.');
  seedGroup($('board'), first, '🌱', 'Semillas que ya estaban');
  const tray = seedGroup($('board'), 0, '🌰', 'Semillas nuevas en la caja');
  tray.textContent = '◌'.repeat(extra);
  const noun = extra === 1 ? ' semilla' : ' semillas';
  for (let i = 0; i < extra; i++) {
    const seed = button($('choices'), '🌰', () => {
      added++;
      tray.textContent = '🌰'.repeat(added) + '◌'.repeat(extra - added);
      tray.setAttribute('aria-label', added + noun + ' en la caja');
      seed.hidden = true;
      if (added === extra) {
        showTotal();
        return;
      }
      $('choices').querySelector('button:not([hidden])').focus();
    });
    seed.className = 'tile';
    seed.setAttribute('aria-label', 'Mover semilla ' + (i + 1) + ' a la caja');
  }
}

function showTotal() {
  const [first, extra] = rounds[round];
  const total = first + extra;
  screen('¿Cuántas hay juntas?', 'Tienes ' + first + ' semillas y pusiste ' + extra + ' más. ¿Cuántas hay juntas?');
  const garden = document.createElement('div');
  garden.className = 'garden';
  $('board').append(garden);
  let counted = 0;
  for (let i = 0; i < total; i++) {
    const seed = button(garden, i < first ? '🌱' : '🌰', () => {
      if (seed.getAttribute('aria-pressed') === 'true') return;
      seed.setAttribute('aria-pressed', 'true');
      seed.textContent = String(++counted);
      $('feedback').textContent = 'Van ' + counted + '.';
    });
    seed.setAttribute('aria-label', 'Contar semilla ' + (i + 1));
    seed.setAttribute('aria-pressed', 'false');
  }
  $('hint').hidden = false;
  $('hint').onclick = () => {
    $('feedback').textContent = 'Toca cada semilla para contar.';
    garden.querySelector('button').focus();
  };
  const options = round === 0 ? [total + 1, total - 1, total] : [total, total + 1, total - 1];
  for (const number of options) {
    const option = button($('choices'), String(number), () => {
      if (number === total) showMathMap();
      else $('feedback').textContent = 'Cuenta todas y prueba otra vez.';
    });
    option.className = 'tile number';
  }
}

function drawPicture(picture, icon) {
  if (icon === 'nest') picture.classList.add('nest');
  else picture.textContent = icon || '?';
  picture.setAttribute('aria-hidden', 'true');
}

function mapTiles(labels, icons, active = -1) {
  const map = document.createElement('ol');
  map.className = 'pictureMap';
  for (const [index, label] of labels.entries()) {
    const tile = document.createElement('li');
    const picture = document.createElement('span');
    const caption = document.createElement('strong');
    drawPicture(picture, icons[index]);
    caption.textContent = label;
    if (index === active) tile.setAttribute('aria-current', 'step');
    tile.append(picture, caption);
    map.append(tile);
  }
  $('board').append(map);
}

function showMathMap() {
  const [first, extra] = rounds[round];
  const total = first + extra;
  screen('¡Así se suman!', 'Había ' + first + '. Pusiste ' + extra + ' más. Ahora hay ' + total + '.');
  mapTiles([first + ' al inicio', extra + ' más', total + ' juntas'], ['🌱'.repeat(first), '🌰'.repeat(extra), '🌱'.repeat(total)]);
  $('explain').hidden = false;
  if (round === 0) next('Otro reto →', () => { round++; startMath(); });
  else next('Ganar mi estrella', () => finish('Enseñaste a ' + nameText + ' a juntar semillas.'));
}

$('tell').onsubmit = async event => {
  event.preventDefault();
  const input = $('answer').value.trim();
  if (!input) { $('answer').focus(); return; }
  const version = activityVersion;
  const submittedRound = round;
  const [first, extra] = rounds[round];
  $('send').disabled = true;
  $('reply').textContent = 'Te escucho…';
  let parts = Semilla.extract(input);
  try {
    const response = await fetch('/api/map', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({input}),
      signal: AbortSignal.timeout(6500)
    });
    if (response.ok) parts = (await response.json()).parts;
  } catch { /* The local interpreter can still offer a hint. */ }
  if (version !== activityVersion || submittedRound !== round || view === 'done') return;
  const expected = [first, extra, first + extra];
  const questions = ['¿Cuántas había al inicio?', '¿Cuántas pusiste después?', '¿Cuántas hay juntas?'];
  const previousGap = expected.findIndex((number, index) => explanation[index] !== number);
  const shortAnswer = /^(?:\p{Letter}+|\d+)[.!]?$/u.test(input) ? Semilla.extract('son ' + input)[2] : undefined;
  if (previousGap >= 0 && !Object.keys(parts).length && Number.isSafeInteger(shortAnswer)) {
    parts[previousGap] = shortAnswer;
  }
  for (const [index, number] of Object.entries(parts)) {
    if (Number.isSafeInteger(number)) explanation[index] = number;
  }
  const gap = expected.findIndex((number, index) => explanation[index] !== number);
  const captions = ['Al inicio', 'Más', 'Juntas'].map((label, index) =>
    explanation[index] === undefined ? label : label + ' · ' + explanation[index]);
  $('board').replaceChildren();
  mapTiles(captions, expected.map((number, index) => {
    const heard = explanation[index];
    if (heard === undefined) return null;
    return heard === number ? (index === 1 ? '🌰' : '🌱').repeat(number) : String(heard);
  }), gap);
  $('reply').textContent = gap < 0 ? '¡Gracias! Ya puedo contarlo.' : 'Ayúdame con un paso. ' + questions[gap];
  $('send').disabled = false;
};

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (Recognition && window.isSecureContext) {
  $('speak').hidden = false;
  $('speak').onclick = () => {
    const recognition = new Recognition();
    const version = activityVersion;
    const spokenRound = round;
    recognition.lang = 'es';
    recognition.onresult = event => {
      if (version === activityVersion && spokenRound === round) $('answer').value = event.results[0][0].transcript;
    };
    recognition.onerror = () => {
      if (version === activityVersion && spokenRound === round) $('reply').textContent = 'También puedes escribir.';
    };
    recognition.start();
  };
}

const sequences = {
  story: {
    intro: 'El nido de Lila',
    labels: ['Ramita', 'Nido', 'Siesta'],
    icons: ['🌿', 'nest', '🌙'],
    beats: ['Lila junta una ramita.', 'Hace un nido.', 'Se duerme.'],
    slots: ['Primero', 'Después', 'Al final'],
    questions: ['¿Qué hizo primero?', '¿Qué hizo después?', '¿Cómo terminó?'],
    hints: ['Busca la ramita.', 'Con la ramita hizo su casa.', 'Cerró los ojos.'],
    finish: 'Enseñaste a ordenar un cuento.'
  },
  history: {
    intro: 'Los recuerdos de Ana',
    labels: ['Cuna', 'Pasos', 'Escuela'],
    icons: ['👶', '👣', '🎒'],
    beats: ['De bebé, Ana dormía en una cuna.', 'Al crecer, aprendió a caminar.', 'Hoy va a la escuela.'],
    slots: ['De bebé', 'Al crecer', 'Hoy'],
    questions: ['¿Qué hacía de bebé?', '¿Qué aprendió al crecer?', '¿Qué hace hoy?'],
    hints: ['Busca dónde dormía.', 'Busca sus huellas.', 'Busca su mochila.'],
    finish: 'Enseñaste a ordenar los recuerdos de Ana.'
  }
};

function showSequenceIntro() {
  const activity = sequences[zone];
  screen(activity.intro, activity.beats.join(' '));
  mapTiles(activity.beats, activity.icons);
  next('¡Te enseño! →', showSequence);
}

function showSequence() {
  const activity = sequences[zone];
  const order = [2, 0, 1];
  screen(activity.questions[placed], activity.questions[placed] + ' ' + order.map(i => activity.labels[i]).join('. '));
  mapTiles(activity.slots.map((label, i) => i < placed ? activity.labels[i] : label),
    activity.icons.slice(0, placed), placed);
  $('hint').hidden = false;
  $('hint').onclick = () => { $('feedback').textContent = activity.hints[placed]; };
  // Keep a real choice on the last prompt, using only pictures the child has seen.
  for (const index of order) {
    const option = button($('choices'), '', () => {
      if (index !== placed) {
        $('feedback').textContent = activity.hints[placed];
        return;
      }
      placed++;
      if (placed < activity.labels.length) showSequence();
      else showSequenceMap();
    });
    option.className = 'tile';
    const icon = document.createElement('span');
    drawPicture(icon, activity.icons[index]);
    option.append(icon, activity.labels[index]);
  }
}

function showSequenceMap() {
  const activity = sequences[zone];
  screen('¡Lo contaste en orden!', activity.beats.join(' '));
  mapTiles(activity.labels, activity.icons);
  next('Ganar mi estrella', () => finish(activity.finish));
}
