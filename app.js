const $ = id => document.getElementById(id);
const zoneButtons = [...document.querySelectorAll('[data-zone]')];
const canvas = document.querySelector('canvas');
const pen = canvas.getContext('2d');
const completed = new Set();

let avatar = '🐥';
let drawing = false;
let dragging = false;
let zone = 'math';
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
    updateBuddy();
    show('lesson');
    $('lesson').dataset.zone = zone;
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

function screen(question, audio = question, phase = 'Practica') {
  window.speechSynthesis?.cancel();
  $('stage').textContent = zoneButtons.find(control => control.dataset.zone === zone).querySelector('strong').textContent;
  $('phase').textContent = phase;
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
  $('listen').onclick = () => {
    const options = [...$('choices').querySelectorAll('button:not([hidden])')]
      .map(choice => choice.getAttribute('aria-label') || choice.textContent);
    speak([audio, ...options, $('feedback').textContent].join('. '));
  };
  $('prompt').focus();
}

function next(text, action) {
  $('next').textContent = text;
  $('next').onclick = action;
  $('next').hidden = false;
}

function finish(result, independent) {
  completed.add(zone);
  zoneButtons.find(control => control.dataset.zone === zone).classList.add('completed');
  $('reward').textContent = '⭐ ' + completed.size + ' de 3 estrellas';
  $('result').textContent = result;
  $('challengeResult').textContent = independent ? 'Reto nuevo: ¡a la primera!' : 'Reto nuevo: ¡lo lograste al volver a intentar!';
  show('done');
  $('finishTitle').focus();
}

const first = 3;
const extra = 2;
const total = first + extra;
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
  const options = [total + 1, total - 1, total];
  for (const number of options) {
    const option = button($('choices'), String(number), () => {
      if (number === total) teachMathMap();
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

function teachMathMap() {
  const facts = [
    {label: first + ' al inicio', icon: '🌱'.repeat(first)},
    {label: extra + ' más', icon: '🌰'.repeat(extra)},
    {label: total + ' juntas', icon: '🌱'.repeat(total)}
  ];
  teachMissing({
    facts,
    slots: ['Al inicio', 'Llegaron', 'Juntas'],
    questions: ['¿Cuántas había al inicio?', '¿Cuántas pusiste?', '¿Cuántas hay juntas?'],
    hints: ['Cuenta las verdes del inicio.', 'Cuenta las que moviste.', 'Cuenta los dos grupos.'],
    options: [{label: '2'}, {label: '4'}, {label: '3'}],
    answers: [2, 0],
    support: step => seedGroup($('board'), [first, extra][step], step === 0 ? '🌱' : '🌰',
      step === 0 ? 'Semillas del inicio' : 'Semillas que llegaron'),
    complete: showMathMap
  }, [false, false, true]);
}

function showMathMap() {
  screen('¡Así se suman!', 'Había ' + first + '. Pusiste ' + extra + ' más. Ahora hay ' + total + '.', 'Tu mapa');
  mapTiles([first + ' al inicio', extra + ' más', total + ' juntas'], ['🌱'.repeat(first), '🌰'.repeat(extra), '🌱'.repeat(total)]);
  $('explain').hidden = false;
  next('Otro reto →', () => showTransfer({
    question: '¿Cuántas vas a tener?',
    context: 'Cuatro semillas y dos más.',
    pictures: ['🌱🌱🌱🌱', '🌰🌰'],
    options: [{label:'7'}, {label:'6'}, {label:'5'}],
    answer: 1,
    hint: 'Cuenta las cuatro y luego las dos.',
    result: 'Enseñaste a ' + nameText + ' a juntar semillas.'
  }));
}

$('tell').onsubmit = async event => {
  event.preventDefault();
  const input = $('answer').value.trim();
  if (!input) { $('answer').focus(); return; }
  const version = activityVersion;
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
  if (version !== activityVersion || $('explain').hidden || view === 'done') return;
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
    recognition.lang = 'es';
    recognition.onresult = event => {
      if (version === activityVersion && !$('explain').hidden) $('answer').value = event.results[0][0].transcript;
    };
    recognition.onerror = () => {
      if (version === activityVersion && !$('explain').hidden) $('reply').textContent = 'También puedes escribir.';
    };
    recognition.start();
  };
}

function choiceTile(option, choose) {
  const tile = button($('choices'), '', choose);
  tile.className = option.icon ? 'tile' : 'tile number';
  if (option.icon) {
    const icon = document.createElement('span');
    drawPicture(icon, option.icon);
    tile.append(icon);
  }
  tile.append(option.label);
  return tile;
}

function showHint(hint) {
  $('hint').hidden = false;
  $('hint').onclick = () => { $('feedback').textContent = hint; };
}

function teachMissing(activity, learned) {
  const step = learned.indexOf(false);
  if (step === -1) { activity.complete(); return; }
  const question = activity.questions[step];
  const context = activity.beats?.join(' ');
  screen(question, context ? context + ' ' + question : question, 'Tu mapa');
  mapTiles(activity.slots.map((slot, i) => learned[i] ? activity.facts[i].label : slot),
    activity.facts.map((fact, i) => learned[i] ? fact.icon : null), step);
  activity.support?.(step);
  showHint(activity.hints[step]);
  activity.options.forEach((option, i) => {
    choiceTile(option, () => {
      if (i !== activity.answers[step]) {
        $('feedback').textContent = activity.hints[step];
        return;
      }
      learned[step] = true;
      teachMissing(activity, learned);
    });
  });
}

function showTransfer(challenge) {
  screen(challenge.question, challenge.context + ' ' + challenge.question, 'Reto nuevo');
  const context = document.createElement('p');
  context.className = 'challengeContext';
  context.textContent = challenge.context;
  $('board').append(context);
  for (const picture of challenge.pictures) {
    const illustration = document.createElement('span');
    illustration.className = 'challengePicture';
    drawPicture(illustration, picture);
    $('board').append(illustration);
  }
  let independent = true;
  challenge.options.forEach((option, i) => {
    choiceTile(option, () => {
      if (i === challenge.answer) { finish(challenge.result, independent); return; }
      independent = false;
      $('feedback').textContent = challenge.hint;
    });
  });
}

const sequences = {
  story: {
    intro: 'El nido de Lila',
    facts: [{label: 'Ramita', icon: '🌿'}, {label: 'Nido', icon: 'nest'}, {label: 'Siesta', icon: '🌙'}],
    beats: ['Lila junta una ramita.', 'Con ella hace un nido.', 'Se duerme en él.'],
    slots: ['Primero', '¿Para qué?', 'Al final'],
    questions: ['¿Qué juntó Lila?', '¿Para qué usó la ramita?', '¿Qué hizo al final?'],
    hints: ['Busca lo que juntó del suelo.', 'Hizo un lugar para dormir.', 'Cerró los ojos.'],
    challenge: {
      question: '¿Para qué se puso la bufanda?',
      context: 'Nico tenía frío. Se puso una bufanda.',
      pictures: ['🧣'],
      options: [{label: 'Abrigarse', icon: '🧥'}, {label: 'Jugar', icon: '⚽'}, {label: 'Dormir', icon: '🌙'}],
      answer: 0,
      hint: 'Piensa en cómo se sentía Nico.',
      result: 'Le enseñaste a tu personaje para qué hacemos algo.'
    }
  },
  history: {
    intro: 'Los recuerdos de Ana',
    facts: [{label: 'Cuna', icon: '👶'}, {label: 'Pasos', icon: '👣'}, {label: 'Escuela', icon: '🎒'}],
    beats: ['De bebé, Ana dormía en una cuna.', 'Al crecer, aprendió a caminar.', 'Hoy va a la escuela.'],
    slots: ['De bebé', 'Al crecer', 'Hoy'],
    questions: ['¿Qué hacía de bebé?', '¿Qué aprendió al crecer?', '¿Qué hace hoy?'],
    hints: ['Busca dónde dormía.', 'Busca sus huellas.', 'Busca su mochila.'],
    challenge: {
      question: '¿Cómo iba Leo antes?',
      context: 'Leo iba a clase en bus. Hoy va en bici.',
      pictures: ['🎒'],
      options: [{label: 'Bici', icon: '🚲'}, {label: 'A pie', icon: '👟'}, {label: 'Bus', icon: '🚌'}],
      answer: 2,
      hint: 'Escucha o lee de nuevo cómo empieza la historia de Leo.',
      result: 'Le enseñaste a tu personaje a distinguir antes y ahora.'
    }
  }
};

function showSequenceIntro() {
  const activity = sequences[zone];
  screen(activity.intro, activity.beats.join(' '));
  mapTiles(activity.beats, activity.facts.map(fact => fact.icon));
  next('¡Te enseño! →', () => {
    screen('Muéstrame un dibujo');
    const order = [2, 0, 1];
    for (const index of order) {
      choiceTile(activity.facts[index], () => {
        const learned = activity.facts.map((_, i) => i === index);
        teachMissing({
          ...activity,
          options: order.map(i => activity.facts[i]),
          answers: activity.facts.map((_, i) => order.indexOf(i)),
          complete: () => {
            screen('¡Ya lo entendí!', activity.beats.join(' '), 'Tu mapa');
            mapTiles(activity.facts.map(fact => fact.label), activity.facts.map(fact => fact.icon));
            next('Otro reto →', () => showTransfer(activity.challenge));
          }
        }, learned);
      });
    }
  });
}
