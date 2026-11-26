import {moreHistory, moreStories} from './extra-cases.mjs';

const mathSteps = (start, added) => [
  {label:'Al inicio', question:'¿Cuántas había al inicio?', hint:'Mira el grupo que ya estaba en el huerto.', answer:String(start)},
  {label:'Llegaron', question:'¿Cuántas llegaron después?', hint:'Cuenta el grupo que se acaba de sumar.', answer:String(added)},
  {label:'Juntas', question:'¿Cuántas hay juntas?', hint:'Cuenta ambos grupos, semilla por semilla.', answer:String(start + added)}
];

function garden(title, start, added) {
  const numbers = new Set([start + added + 1, added, start, start + added, start + added - 1]);
  return {
    title, setup: 'Había ' + start + ' semillas. Llegaron ' + added + ' más.',
    garden: {start, added},
    steps: mathSteps(start, added),
    cards: [...numbers].map(number => ({id:String(number), label:String(number), dots:number}))
  };
}

export const capsules = {
  math: {
    label:'Matemáticas', title:'El huerto de Pipo', detail:'Junta y cuenta semillas',
    image:'contar', color:'green',
    cases:[
      garden('Llegan semillas',3,2), garden('Otro huerto',4,3),
      garden('La primera maceta',1,2), garden('El huerto de Rosa',2,2),
      garden('Cerca de la ventana',4,1), garden('La jardinera azul',3,3),
      garden('El patio de la escuela',6,2), garden('Semillas para compartir',5,3),
      garden('La maceta de Lila',4,5), garden('Siembra en equipo',7,3)
    ]
  },
  story: {
    label:'Lenguaje', title:'Cuentos con sentido', detail:'Explica por qué pasa algo',
    image:'relato', color:'pink', cases:[
      {
        title:'El nido de Lila',
        setup:'Lila quería un lugar para dormir. Juntó ramitas, hizo un nido y se durmió en él.',
        scene:['🐦','🌿','🌙'],
        steps:[
          {label:'Quería', question:'¿Qué quería hacer Lila?', hint:'Piensa en lo que haces cuando tienes sueño.', answer:'sleep'},
          {label:'Hizo', question:'¿Qué hizo con las ramitas?', hint:'Construyó algo para poder descansar.', answer:'nest'},
          {label:'Al final', question:'¿Qué pasó cuando terminó?', hint:'Ya tenía un lugar para cerrar los ojos.', answer:'nap'}
        ],
        cards:[
          {id:'nest', label:'Hizo un nido', icon:'nest', words:['nido','construyó']},
          {id:'play', label:'Quería jugar', icon:'⚽', words:['jugar','pelota']},
          {id:'sleep', label:'Quería dormir', icon:'😴', words:['quería dormir','tenía sueño','descansar']},
          {id:'nap', label:'Se durmió', icon:'🌙', words:['se durmió','durmió','se quedó dormida','se acostó']}
        ]
      },
      {
        title:'Nico tiene frío',
        setup:'Nico tenía frío. Se puso una bufanda y se sintió más calentito.',
        scene:['❄️','🧣','☀️'],
        steps:[
          {label:'Al inicio', question:'¿Cómo se sentía Nico?', hint:'Nota lo que le pasa antes de ponerse la bufanda.', answer:'cold'},
          {label:'Hizo', question:'¿Qué se puso Nico?', hint:'Se puso algo alrededor del cuello.', answer:'scarf'},
          {label:'Al final', question:'¿Cómo se sintió después?', hint:'Piensa para qué le sirvió la bufanda.', answer:'warm'}
        ],
        cards:[
          {id:'warm', label:'Se abrigó', icon:'☀️', words:['se abrigó','calentito','calor','más caliente']},
          {id:'cold', label:'Tenía frío', icon:'❄️', words:['frío','helado']},
          {id:'scarf', label:'Se puso la bufanda', icon:'🧣', words:['bufanda','abrigo']},
          {id:'wet', label:'Se mojó', icon:'💧', words:['se mojó','mojado']}
        ]
      },
      ...moreStories
    ]
  },
  history: {
    label:'Historia', title:'Antes y ahora', detail:'Arma una línea del tiempo',
    image:'recuerdos', color:'gold', cases:[
      {
        title:'El álbum de Ana',
        setup:'De bebé, Ana dormía en una cuna. Después aprendió a caminar. Hoy va a la escuela.',
        scene:['📷','📚'],
        steps:[
          {label:'De bebé', question:'¿Dónde dormía Ana de bebé?', hint:'Busca la imagen de cuando era más pequeña.', answer:'crib'},
          {label:'Al crecer', question:'¿Qué aprendió al crecer?', hint:'Piensa en sus primeros pasos.', answer:'walk'},
          {label:'Hoy', question:'¿Adónde va Ana hoy?', hint:'Piensa en lo que llevaría en su mochila.', answer:'school'}
        ],
        cards:[
          {id:'school', label:'Va a la escuela', icon:'🎒', words:['escuela','colegio','clases']},
          {id:'walk', label:'Aprendió a caminar', icon:'👣', words:['caminar','pasos','caminó']},
          {id:'crib', label:'Dormía en cuna', icon:'👶', words:['cuna','bebé']},
          {id:'trip', label:'Sale de viaje', icon:'🚗', words:['viaje','viajó','carro','auto']}
        ]
      },
      {
        title:'Los viajes de Leo',
        setup:'Antes Leo iba a clase en bus. Luego practicó con su bici. Hoy va a clase en bici.',
        scene:['🚌','🚲'],
        steps:[
          {label:'Antes', question:'¿Cómo iba a clase antes?', hint:'Busca el vehículo en el que caben muchos pasajeros.', answer:'bus'},
          {label:'Luego', question:'¿Qué hizo para aprender?', hint:'Piensa en qué haces para aprender algo nuevo.', answer:'train'},
          {label:'Hoy', question:'¿Cómo va a clase hoy?', hint:'Piensa en el vehículo de dos ruedas.', answer:'bike'}
        ],
        cards:[
          {id:'bike', label:'Va en bici', icon:'🚲', words:['va en bici','en bicicleta','va a clase en bici']},
          {id:'train', label:'Practicó con su bici', icon:'⭐', words:['practicó','practicar','aprendió a pedalear']},
          {id:'walk', label:'Va a pie', icon:'👟', words:['a pie','caminando']},
          {id:'bus', label:'Iba en bus', icon:'🚌', words:['bus','autobús','micro']}
        ]
      },
      ...moreHistory
    ]
  }
};

const normalize = text => text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'');
const timeMarkers = [
  /\b(?:al inicio|primero|al principio|antes|de bebe|queria)\b/,
  /\b(?:despues|luego|al crecer|mas tarde|con ella)\b/,
  /\b(?:al final|ahora|hoy|por ultimo|finalmente)\b/
];

export function interpretWords(capsule, episode, input, selected) {
  const activity = capsules[capsule].cases[episode];
  const parts = {};
  const unplaced = new Set();
  const clauses = normalize(input).split(/[.;,]+|\s+y\s+(?=(?:luego|despues|al final|ahora|hoy)\b)/);
  for (const clause of clauses) {
    if (/\b(?:no|nunca|jamas)\b/.test(clause)) continue;
    const sentence = ' ' + clause.trim().replace(/[^a-z0-9 ]/g,'') + ' ';
    const ranked = activity.cards.map(card => ({
      card, length:Math.max(0, ...card.words.map(normalize)
        .filter(word => sentence.includes(' ' + word + ' ')).map(word => word.length))
    })).filter(item => item.length > 0).sort((a,b) => b.length - a.length);
    if (!ranked.length || ranked[1]?.length === ranked[0].length && ranked[1].card !== ranked[0].card) continue;
    const explicit = timeMarkers.findIndex(marker => marker.test(clause));
    if (explicit === -1) unplaced.add(ranked[0].card.id);
    else parts[explicit] = ranked[0].card.id;
  }
  if (parts[selected] === undefined && unplaced.size === 1) parts[selected] = [...unplaced][0];
  return parts;
}

export function filterParts(activity, parts) {
  if (!parts || typeof parts !== 'object' || Array.isArray(parts)) return {};
  return Object.fromEntries(Object.entries(parts).filter(([key, value]) =>
    ['0','1','2'].includes(key) && activity.cards.some(card => card.id === String(value))
  ).map(([key,value]) => [key,String(value)]));
}
