import {capsules} from './capsules.mjs';

const description = {
  identify: 'Encuentra una idea en la escena.',
  connect: 'Une dos ideas de la escena.',
  explain: 'Cuenta por qué cambió algo.'
};

const paths = {
  math: [[2, 3, 4], [0, 1, 5, 6], [7, 8, 9]],
  story: [[0, 1, 2], [3, 4, 5, 7], [6, 8, 9]],
  history: [[0, 2, 7], [1, 3, 5, 8], [4, 6, 9]]
};

const stages = [
  ['identify', 'Identificar'],
  ['connect', 'Conectar'],
  ['explain', 'Explicar']
];

const bands = Object.fromEntries(Object.entries(paths).map(([area, groups]) => [
  area, stages.map(([id, label], index) => ({id, label, description: description[id], episodes: groups[index]}))
]));

export function practiceBands(capsuleId) {
  return Object.hasOwn(bands, capsuleId) ? bands[capsuleId] : [];
}

const whyStory = [
  [
    'Lila buscaba un lugar para dormir. Para eso juntó las ramitas.',
    'Lila juntó las ramitas para armar el nido donde iba a dormir.',
    'Cuando terminó el nido, Lila ya tenía un lugar para dormir y se durmió allí.'
  ],
  [
    'Nico se puso la bufanda porque al principio tenía frío.',
    'Nico se puso la bufanda alrededor del cuello para abrigarse.',
    'La bufanda lo ayudó a conservar el calor y se sintió más calentito.'
  ],
  [
    'Mía quería cuidar su planta y por eso la regó.',
    'Mía le echó agua a la planta. El agua llegó a la tierra.',
    'El agua empapó la tierra. Por eso quedó húmeda.'
  ],
  [
    'Tomás quería salir aunque estaba lloviendo. Por eso buscó qué ponerse.',
    'Tomás se puso las botas para proteger sus pies de la lluvia.',
    'Las botas mantuvieron el agua afuera y sus pies quedaron secos.'
  ],
  [
    'Eva hizo un regalo porque quería alegrar a su abuelo.',
    'Eva dibujó una flor para su abuelo. Ese fue su regalo.',
    'Su abuelo sonrió al recibir la flor que Eva había dibujado.'
  ],
  [
    'Sol preparó algo para comer porque tenía hambre.',
    'Sol juntó dos ingredientes, el pan y el queso, para preparar su merienda.',
    'Después de comer el pan con queso se le pasó el hambre.'
  ],
  [
    'Luz quería hacer volar la cometa. Para eso necesitaba viento.',
    'Luz esperó el viento porque el aire en movimiento ayuda a levantar la cometa.',
    'Cuando sopló el viento, la cometa de Luz pudo subir.'
  ],
  [
    'Joel quería leer en el patio. Llevó allí su libro.',
    'Joel buscó la sombra del árbol para que el sol no le diera directo.',
    'Debajo del árbol le daba menos sol y pudo leer más fresco.'
  ],
  [
    'Sara buscaba a su gato Burbuja porque se había perdido.',
    'Sara llamó a Burbuja con su voz para que la oyera.',
    'Burbuja volvió con Sara después de que ella lo llamó.'
  ],
  [
    'Amir quería llevar el carro al otro lado del charco.',
    'Amir puso bloques para hacer un puente por encima del agua.',
    'El puente le dio al carro un camino sobre el agua para pasar al otro lado.'
  ]
];

const whyHistory = [
  [
    'La cuna va al principio porque Ana dormía allí cuando era bebé.',
    'Ana dio sus primeros pasos después de crecer un poco y antes de ir a la escuela.',
    'La escuela va al final porque el álbum dice que Ana va allí hoy.'
  ],
  [
    'El bus va primero porque así llegaba Leo a clase antes de usar su bici.',
    'Practicar va en medio. Leo aprendió a andar en bici antes de usarla para ir a clase.',
    'La bici va al final porque es el transporte que Leo usa para ir a clase hoy.'
  ],
  [
    'Nora preparó la mochila antes de salir. Por eso va al principio.',
    'Nora llegó a la escuela después de preparar la mochila y salir de casa.',
    'Nora volvió a casa cuando terminaron sus clases. Por eso va al final.'
  ],
  [
    'La abuela enviaba cartas de niña. Esa fue la primera forma de comunicarse en este relato.',
    'La abuela usó el teléfono después de enviar cartas y antes de hacer videollamadas.',
    'La videollamada va al final porque así se comunica hoy con su nieta.'
  ],
  [
    'En la casa antigua usaban velas antes de tener iluminación eléctrica.',
    'La familia instaló lámparas cuando llegó la electricidad. Eso pasó después de usar velas.',
    'Los focos LED van al final. La familia cambió a ellos después de instalar lámparas.'
  ],
  [
    'La escuela plantó un árbol pequeño antes de que hubiera sombra para leer.',
    'El árbol creció durante varios años después de plantarlo.',
    'La clase lee hoy debajo del árbol porque, al crecer, ya da sombra.'
  ],
  [
    'El terreno estaba vacío antes de que los vecinos hicieran la cancha.',
    'Los vecinos armaron la cancha después de tener el terreno vacío.',
    'El juego va al final. Hoy los vecinos pueden jugar allí porque construyeron la cancha.'
  ],
  [
    'La primera foto muestra a Dani de bebé. Eso pasó antes de que comenzara la escuela.',
    'La foto de la escuela se tomó después de la de bebé y antes de armar el álbum.',
    'Dani ya tenía las dos fotos y hoy las pegó en el álbum.'
  ],
  [
    'La tía de Luis oía la radio cuando era niña. En su historia eso pasó primero.',
    'La tía usó discos después de escuchar la radio y antes de usar el teléfono.',
    'El teléfono va al final porque ahí escucha su música hoy.'
  ],
  [
    'En la plaza había un camino de tierra antes de que pusieran las baldosas.',
    'Pusieron baldosas después de tener el camino de tierra. Así cambió la superficie.',
    'Hoy la vecina pasea por el camino nuevo en su silla de ruedas.'
  ]
];

const formatList = new Intl.ListFormat('es', {type:'conjunction'});

function withMathExplanations(activity) {
  const {start, added} = activity.garden;
  const addedCount = Array.from({length: added}, (_, index) => String(start + index + 1));
  const explanations = [
    `Al inicio cuenta solo las semillas que ya estaban. Hay ${start}.`,
    added === 1 ? 'Después llega una semilla nueva. Esa es la que se suma al grupo.'
      : `Después llegan ${added} semillas nuevas. Esas son las que se suman al grupo.`,
    `Empieza en ${start} y cuenta cada semilla nueva. ${added === 1 ? 'Llegas a' : 'Dices'} ${formatList.format(addedCount)}.`
  ];
  return withExplanations(activity, explanations);
}

function withExplanations(activity, explanations) {
  return {...activity, steps: activity.steps.map((step, index) => ({
    ...step,
    explanation: explanations[index],
  }))};
}

function mathTransfer(title, setup, start, added, reason) {
  const total = start + added;
  return withMathExplanations({
    title, setup, garden: {start, added},
    steps: [
      {label:'Al inicio', question:'¿Cuántas semillas había al inicio?', hint:'Cuenta el grupo que ya estaba.', answer:String(start)},
      {label:'Llegaron', question:'¿Cuántas semillas llegaron después?', hint:'Cuenta solo el grupo nuevo.', answer:String(added)},
      {label:'Juntas', question:'¿Cuántas semillas hay juntas?', hint:'Junta el primer grupo con el nuevo.', answer:String(total)}
    ],
    cards: [...new Set([total + 1, added, start, total, total - 1])]
      .map(number => ({id:String(number), label:String(number), dots:number})),
    reason
  });
}

function narrativeTransfer(title, setup, scene, slots, facts, decoy, reason) {
  const ids = ['start', 'action', 'end'];
  const steps = facts.map(([, , question, hint, explanation], index) =>
    ({label:slots[index], question, hint, explanation, answer:ids[index]}));
  const cards = facts.map(([label, icon, , , , words], index) => ({id:ids[index], label, icon, words}));
  const [label, icon, words] = decoy;
  return {title, setup, scene, steps, cards:[cards[2], cards[0], {id:'other', label, icon, words}, cards[1]], reason};
}

function reason(question, options, answer, explanation) {
  return {question, options: options.map(([label, icon]) => ({label, icon})), answer, explanation};
}

function mathReason(activity, variant) {
  const {start, added} = activity.garden;
  const options = [
    [`Conté ${start} y sumé ${added} más`, '➕'],
    [`Conté solo las ${added} nuevas`, '🌱'],
    [`Quité ${added} del primer grupo`, '↩️']
  ];
  const ordered = options.slice(variant).concat(options.slice(0, variant));
  return reason(`¿Por qué hay ${start + added} semillas juntas?`, ordered, (3 - variant) % 3,
    activity.steps[2].explanation);
}

const practiceReasons = {
  story: {
    6: reason('¿Por qué subió la cometa?', [
      ['Luz la dejó en el suelo','🌱'], ['El viento la levantó','🍃'], ['La cuerda se hizo más corta','🧶']
    ], 1, 'El aire en movimiento levantó la cometa. Por eso Luz esperó a que soplara el viento.'),
    8: reason('¿Cómo ayudó Sara a que su gato volviera?', [
      ['Lo llamó para que la oyera','🔊'], ['Le dibujó un camino','✏️'], ['Cerró la puerta para esperarlo','🚪']
    ], 0, 'Sara llamó a Burbuja con su voz. Después de oírla, el gato volvió.'),
    9: reason('¿Por qué pudo cruzar el carro?', [
      ['El charco se secó','☀️'], ['Pasó debajo de los bloques','🚗'], ['El puente le dio un camino','🧱']
    ], 2, 'Los bloques formaron un puente por encima del agua. El carro pudo pasar sobre ellos.')
  },
  history: {
    4: reason('¿Qué cambió para que pudieran encender las lámparas?', [
      ['Abrieron las ventanas','🪟'], ['Llegó la electricidad','💡'], ['Encendieron más velas','🕯️']
    ], 1, 'La electricidad llegó después de las velas y permitió que la familia encendiera las lámparas.'),
    6: reason('¿Qué cambió para que hoy puedan jugar en ese lugar?', [
      ['Dejaron el terreno vacío','🟫'], ['Abrieron una tienda','🏪'], ['Los vecinos hicieron una cancha','⚽']
    ], 2, 'Antes el terreno estaba vacío. Los vecinos hicieron una cancha y ahora pueden jugar allí.'),
    9: reason('¿Qué cambió en el camino de la plaza?', [
      ['Alisaron el camino con baldosas','🧱'], ['Añadieron un mapa de la plaza','🗺️'], ['Colocaron más tierra en la ruta','🟫']
    ], 0, 'Antes el camino era de tierra. Las baldosas cambiaron la superficie y hoy la vecina puede pasar por allí.')
  }
};

const reserved = {
  math: [
    mathTransfer('Semillas en una taza', 'Ya había 2 semillas en la taza. Mara puso 1 más.', 2, 1,
      reason('¿Cómo sabes cuántas había al principio?', [
        ['Cuento las que llegaron', '🌱'], ['Cuento las que ya estaban', '☕'], ['Cuento todas juntas', '🌿']
      ], 1, 'Al principio solo cuentas las 2 semillas que estaban en la taza. La semilla nueva llegó después.')),
    mathTransfer('La caja de Simón', 'Simón guardó 5 semillas en la caja. Después encontró 2 más y las juntó.', 5, 2,
      reason('¿Qué hizo que hubiera más semillas?', [
        ['Juntó las 2 nuevas con las 5', '➕'], ['Quitó 2 de la caja', '↩️'], ['Dejó las 5 como estaban', '📦']
      ], 0, 'Las 2 semillas nuevas entraron en el mismo grupo que las 5. Por eso el grupo creció.')),
    mathTransfer('Semillas de la feria', 'Ya había 6 semillas en la bolsa. En la feria, Luz recibió 3 más.', 6, 3,
      reason('¿Por qué hay 9 semillas juntas?', [
        ['Solo contó las nuevas', '🌱'], ['Quitó 3 de las 6', '↩️'], ['Siguió contando desde 6', '➕']
      ], 2, 'Después de 6, cuenta una semilla nueva por cada número. Dices 7, 8 y 9.')),
    mathTransfer('El frasco de Lía', 'Lía tenía 1 semilla en el frasco. Su prima puso 3 más.', 1, 3,
      reason('¿Cuál grupo miras para saber con cuántas empezó Lía?', [
        ['Todas las semillas juntas', '🌿'], ['La que estaba en el frasco', '🫙'], ['Las que trajo su prima', '🌱']
      ], 1, 'Al comienzo, Lía solo tenía la semilla que ya estaba en el frasco. Su prima llegó después.')),
    mathTransfer('La bolsa de Elías', 'En la bolsa de Elías había 6 semillas. Encontró 1 en la mesa y la puso en la bolsa.', 6, 1,
      reason('¿Qué le pasó al grupo cuando Elías puso la semilla?', [
        ['Se quedó con 6', '📦'], ['Perdió una semilla', '↩️'], ['Creció de 6 a 7', '➕']
      ], 2, 'Elías añadió una semilla. Al contar una más desde 6, llegas a 7.')),
    mathTransfer('Semillas de dos amigos', 'Teo puso 5 semillas en la mesa. Rosa puso 5 más al lado.', 5, 5,
      reason('¿Cómo puedes comprobar que hay 10 juntas?', [
        ['Cuento desde 5 otras 5 veces', '➕'], ['Cuento 5 y quito la mitad', '↩️'], ['Cuento solo las de Rosa', '🌱']
      ], 0, 'Ya tienes 5 de Teo. Por cada semilla de Rosa avanzas un número. Dices 6, 7, 8, 9 y 10.'))
  ],
  story: [
    narrativeTransfer('La linterna de Inés', 'Inés quería encontrar su juguete bajo la cama. Encendió su linterna y vio el juguete.', ['🧸','🔦'], ['Quería','Hizo','Al final'], [
      ['Encontrar su juguete','🧸','¿Qué quería hacer Inés?','Piensa en algo que se le perdió.','Quería encontrar su juguete. Para eso buscó debajo de la cama.',['encontrar','juguete perdido','buscar el juguete']],
      ['Encendió la linterna','🔦','¿Qué hizo Inés?','Piensa en lo que usó para hacer luz.','Encendió la linterna para iluminar el espacio bajo la cama.',['linterna','encendió']],
      ['Vio el juguete','👀','¿Qué pasó al final?','Piensa en lo que pudo ver con la luz.','Con la luz de la linterna pudo ver dónde estaba su juguete.',['vio','encontró','lo vio']]
    ], ['Cerró la ventana','🪟',['ventana']],
      reason('¿Por qué buscó debajo de la cama?', [
        ['Quería hacer una sombra','🌑'], ['Quería dejar la linterna','🔦'], ['Quería encontrar su juguete','🧸']
      ], 2, 'Inés buscaba su juguete. Iluminó debajo de la cama para encontrarlo.')),
    narrativeTransfer('El vaso de Bruno', 'Bruno tenía sed. Llenó su vaso con agua y bebió. Después ya no tenía sed.', ['🥤','💧'], ['Al inicio','Hizo','Al final'], [
      ['Tenía sed','💧','¿Qué sentía Bruno al inicio?','Piensa en lo que sentimos cuando nos falta beber.','Antes de beber, Bruno tenía sed. Por eso buscó agua.',['tenía sed','con sed']],
      ['Llenó el vaso y bebió','🥤','¿Qué hizo Bruno?','Mira el recipiente que usó para beber.','Bruno llenó el vaso con agua y se la tomó para quitarse la sed.',['llenó','vaso','bebió','tomó agua']],
      ['Se le pasó la sed','🙂','¿Qué cambió después de beber?','Piensa en lo que deja de sentir al tomar agua.','Después de beber agua, Bruno ya no tenía sed.',['sin sed','se le pasó la sed','ya no tenía sed']]
    ], ['Comió pan','🍞',['pan']],
      reason('¿Por qué llenó el vaso?', [
        ['Quería lavar el vaso','🫧'], ['Tenía sed y quería beber','💧'], ['Quería regar una planta','🌱']
      ], 1, 'Bruno tenía sed. Llenó el vaso con agua para beberla.')),
    narrativeTransfer('La pelota de Celia', 'La pelota de Celia rodó bajo un banco. Celia la acercó con una escoba y pudo recogerla.', ['⚽','🧹'], ['Problema','Hizo','Al final'], [
      ['Pelota bajo el banco','⚽','¿Cuál era el problema de Celia?','Busca dónde quedó la pelota.','La pelota quedó debajo del banco y Celia no la tenía a su alcance.',['debajo','bajo el banco','rodó']],
      ['La acercó con la escoba','🧹','¿Cómo acercó la pelota?','Piensa en el objeto largo que usó.','Celia usó la escoba para mover la pelota desde debajo del banco hacia ella.',['escoba','acercó','empujó']],
      ['Recogió la pelota','🙌','¿Qué pudo hacer al final?','Piensa qué hizo cuando la pelota quedó cerca.','Al quedar cerca, Celia pudo alcanzar la pelota y recogerla.',['recogió','alcanzó','la tomó']]
    ], ['Pintó el banco','🎨',['pintó','pintura']],
      reason('¿Cómo ayudó la escoba a resolver el problema?', [
        ['Acercó la pelota hasta su mano','🧹'], ['Cambió el color de la pelota','🎨'], ['Tapó la pelota con hojas','🍂']
      ], 0, 'La escoba alcanzó la pelota debajo del banco y la movió hasta que Celia pudo recogerla.')),
    narrativeTransfer('El botón de Paula', 'Paula quería cerrar su abrigo, pero le faltaba un botón. Su papá cosió otro y Paula pudo cerrarlo.', ['🧥','🪡'], ['Quería','Hizo','Al final'], [
      ['Cerrar su abrigo','🧥','¿Qué quería hacer Paula?','Piensa qué intentó antes de notar que faltaba un botón.','Paula quería cerrar su abrigo. El botón que faltaba se lo impedía.',['cerrar','cerrar el abrigo']],
      ['Su papá cosió un botón','🪡','¿Qué hizo su papá?','Piensa cómo se fija un botón al abrigo.','Su papá cosió otro botón en el lugar que estaba vacío.',['cosió','coser','otro botón']],
      ['Cerró el abrigo','🙂','¿Qué pudo hacer Paula al final?','Piensa cómo le ayudó el botón.','Paula pudo cerrar su abrigo porque ya tenía un botón en ese lugar.',['cerró','pudo cerrar']]
    ], ['Se puso botas','🥾',['botas']],
      reason('¿Qué le faltaba a Paula al principio?', [
        ['Un par de botas','🥾'], ['Un botón en el abrigo','🪡'], ['Una mochila','🎒']
      ], 1, 'Al principio faltaba un botón. Cuando cosieron otro, Paula pudo cerrar el abrigo.')),
    narrativeTransfer('El cuaderno de Luz', 'Luz vio que empezaba a llover. Guardó el cuaderno en la mochila y llegó a casa con sus hojas secas.', ['🌧️','🎒'], ['Al inicio','Hizo','Al final'], [
      ['Empezó a llover','🌧️','¿Qué vio Luz al inicio?','Piensa qué podía mojar el cuaderno.','Luz vio que caían gotas de lluvia. Por eso protegió su cuaderno.',['llover','llovía','lluvia']],
      ['Guardó el cuaderno','🎒','¿Qué hizo con el cuaderno?','Busca el lugar donde lo guardó.','Guardó el cuaderno dentro de la mochila, lejos de las gotas de lluvia.',['guardó','mochila','metió']],
      ['Las hojas quedaron secas','📖','¿Cómo llegaron las hojas?','Piensa si la lluvia alcanzó las hojas.','Las hojas quedaron secas porque Luz protegió el cuaderno.',['secas','secó','sin mojarse']]
    ], ['Abrió su cuaderno','📔',['abrió','abrir']],
      reason('¿Para qué guardó el cuaderno en la mochila?', [
        ['Para dibujar en la mochila','✏️'], ['Para enseñar las hojas a sus amigos','🙌'], ['Para protegerlo de la lluvia','🌧️']
      ], 2, 'Luz vio que llovía y guardó el cuaderno para que las gotas quedaran afuera.')),
    narrativeTransfer('La torre de Mei', 'Mei armó una torre sobre una alfombra blanda y la torre cayó. Armó otra sobre el piso firme y se mantuvo de pie.', ['🧱','🏠'], ['Problema','Hizo','Al final'], [
      ['La torre cayó','🧱','¿Qué pasó con la primera torre?','Piensa en cómo quedó la torre sobre la alfombra.','La primera torre cayó sobre la alfombra blanda.',['cayó','se cayó','se derrumbó']],
      ['Armó otra en el piso','🏠','¿Dónde armó Mei la segunda torre?','Busca el lugar más firme.','Mei cambió la alfombra por el piso firme para armar la segunda torre.',['piso','suelo','firme']],
      ['La torre quedó de pie','⭐','¿Qué pasó con la segunda torre?','Piensa en qué fue distinto al final.','La segunda torre se mantuvo de pie porque tenía una base firme.',['de pie','se mantuvo','siguió en pie']]
    ], ['Guardó las piezas','📦',['guardó','caja']],
      reason('¿Por qué la segunda torre se mantuvo de pie?', [
        ['El piso le dio una base firme','🏠'], ['Mei la puso en la alfombra blanda','🧱'], ['Mei guardó los bloques','📦']
      ], 0, 'El piso firme sostuvo los bloques sin hundirse. Así Mei pudo dejar la torre de pie.'))
  ],
  history: [
    narrativeTransfer('El rincón de juegos', 'Antes los bloques estaban en el piso. Luego pusieron una repisa. Hoy guardan allí los bloques.', ['🧱','📦'], ['Antes','Luego','Hoy'], [
      ['Bloques en el piso','🧱','¿Dónde estaban los bloques antes?','Piensa cómo era el rincón antes de la repisa.','Antes de la repisa, los bloques estaban en el piso.',['piso','suelo']],
      ['Pusieron una repisa','🔧','¿Qué pusieron después?','Busca algo que sirve para guardar cosas.','Pusieron la repisa después de ver los bloques en el piso.',['repisa','estante','pusieron repisa']],
      ['Guardan los bloques','📦','¿Dónde quedan los bloques hoy?','Piensa en el lugar nuevo para guardarlos.','Hoy los bloques se guardan en la repisa que pusieron.',['guardan','guardados','se guardan']]
    ], ['Pintaron la puerta','🎨',['pintaron','puerta']],
      reason('¿Qué ocurrió primero?', [
        ['Los bloques estaban en el piso','🧱'], ['Pusieron una repisa','🔧'], ['Guardaron todo en la repisa','📦']
      ], 0, 'Al comienzo todavía faltaba la repisa. Por eso los bloques estaban en el piso.')),
    narrativeTransfer('El agua de la plaza', 'Antes Rita llevaba agua a la plaza en un balde. Luego pusieron una llave. Hoy Rita llena el balde allí.', ['🪣','🚰'], ['Antes','Luego','Hoy'], [
      ['Llevaba el agua','🪣','¿Qué hacía Rita antes?','Piensa cómo llegaba el agua a la plaza.','Antes de poner la llave, Rita llevaba agua en el balde hasta la plaza.',['llevaba','llevó agua']],
      ['Pusieron una llave','🚰','¿Qué cambió después?','Busca de dónde puede salir el agua.','Pusieron una llave para que hubiera agua en la plaza.',['pusieron una llave','pusieron llave','instalaron','grifo']],
      ['Llena el balde allí','💧','¿Qué hace Rita hoy?','Piensa dónde puede llenar el balde ahora.','Con la llave en la plaza, hoy Rita puede llenar el balde allí mismo.',['llena el balde','llena allí','lo llena']]
    ], ['Llevó un juguete','🧸',['juguete']],
      reason('¿Qué pasó entre llevar el agua y llenar el balde allí?', [
        ['Rita cambió el color del balde','🎨'], ['Rita dejó el balde en casa','🏠'], ['Pusieron una llave en la plaza','🚰']
      ], 2, 'Primero Rita llevaba el agua. Después pusieron la llave. Así pudo llenar el balde en la plaza.')),
    narrativeTransfer('La feria en dos fotos', 'Antes la feria cerraba cuando llovía. Un día pusieron un techo. Ahora el techo cubre los puestos y pueden abrir aunque llueva.', ['🌧️','🏘️'], ['Antes','Cambió','Ahora'], [
      ['Cerraba con lluvia','🌧️','¿Qué pasaba antes cuando llovía?','Piensa qué hacían los puestos al mojarse.','Antes los puestos quedaban al aire libre. Por eso cerraban cuando llovía.',['cerraba','cerraban']],
      ['Pusieron un techo','🏠','¿Qué pusieron después?','Busca algo que cubre y protege de la lluvia.','Pusieron un techo sobre los puestos para protegerlos de la lluvia.',['techo','cubrieron']],
      ['Abre con lluvia','🛍️','¿Qué puede hacer la feria ahora?','Piensa qué pueden hacer los puestos bajo el techo.','Ahora pueden abrir aunque llueva porque el techo protege los puestos.',['abre','abren','pueden abrir']]
    ], ['Cambiaron el reloj','⌚',['reloj']],
      reason('¿Por qué ahora la feria abre aunque llueva?', [
        ['La lluvia dejó de caer','☀️'], ['El techo protege los puestos','🏠'], ['Los puestos abren antes de salir el sol','🌅']
      ], 1, 'La lluvia todavía puede caer. El techo mantiene cubiertos los puestos y permite que abran.')),
    narrativeTransfer('El cartel de la biblioteca', 'Antes la biblioteca del barrio no tenía cartel. Un día pusieron un cartel con un libro. Hoy los vecinos reconocen la entrada.', ['📚','🚪'], ['Antes','Luego','Hoy'], [
      ['Entrada sin cartel','🚪','¿Cómo era la entrada antes?','Imagina la puerta al principio de la historia.','La entrada estaba sin cartel antes de que pusieran el del libro.',['sin cartel','sin letrero']],
      ['Pusieron un cartel','📖','¿Qué pusieron después?','Busca dónde aparece el dibujo del libro.','Después pusieron un cartel con un dibujo de un libro.',['cartel','letrero','pusieron cartel']],
      ['Reconocen la entrada','👀','¿Qué pueden hacer los vecinos hoy?','Piensa cómo encuentran la puerta correcta.','Hoy los vecinos ven el cartel y reconocen la entrada de la biblioteca.',['reconocen','encuentran','reconoce']]
    ], ['Cerraron la puerta','🔒',['cerraron','cerrada']],
      reason('¿Cómo era la entrada antes de poner el cartel?', [
        ['Ya tenía un cartel con un libro','📖'], ['Había una caja en la puerta','📦'], ['La entrada estaba sin cartel','🚪']
      ], 2, 'Primero la entrada estaba sin cartel. El del libro llegó después.')),
    narrativeTransfer('Agua para la huerta', 'Antes los vecinos llevaban agua en latas para su huerta. Luego pusieron un barril para juntar lluvia. Hoy usan el agua del barril para regar.', ['🪴','🌧️'], ['Antes','Luego','Hoy'], [
      ['Llevaban agua en latas','💧','¿Cómo llevaban el agua antes?','Busca los recipientes que cargaban.','Antes de tener el barril, los vecinos llevaban el agua en latas.',['latas','llevaban agua']],
      ['Pusieron un barril','🛢️','¿Qué pusieron después?','Busca el recipiente que junta lluvia.','El barril se instaló para juntar el agua que cae cuando llueve.',['barril','pusieron un barril']],
      ['Riegan con agua de lluvia','🌱','¿Con qué riegan hoy?','Piensa en el agua que guardaron en el barril.','Hoy usan el agua de lluvia que quedó en el barril para regar la huerta.',['riegan','agua de lluvia','riegan la huerta']]
    ], ['Quitaron las plantas','🪴',['quitaron','sacaron']],
      reason('¿Qué ocurrió entre llevar agua y regar con lluvia?', [
        ['Vendieron la huerta','🪴'], ['Instalaron un barril','🛢️'], ['Guardaron las semillas','🌱']
      ], 1, 'Antes llevaban agua en latas. Pusieron el barril para juntar lluvia y así pudieron regar con esa agua.')),
    narrativeTransfer('La biblioteca que viaja', 'Antes los libros solo se prestaban en la biblioteca del centro. Luego organizaron un bus con libros. Hoy el bus presta libros en otros barrios.', ['📚','🚌'], ['Antes','Cambió','Hoy'], [
      ['Préstamos en el centro','🏢','¿Dónde prestaban libros antes?','Busca el lugar al que todos debían ir.','Antes el préstamo era en la biblioteca del centro.',['centro','biblioteca del centro']],
      ['Prepararon un bus con libros','🚌','¿Qué hicieron después?','Busca el vehículo que puede llevar libros.','Organizaron el bus para que los libros pudieran viajar a otros lugares.',['bus','autobús','biblioteca que viaja']],
      ['Prestan libros en más barrios','📚','¿Dónde prestan libros hoy?','Piensa en los lugares que visita el bus.','Como el bus viaja, hoy también prestan libros en otros barrios.',['barrios','otros barrios','más barrios']]
    ], ['Cerraron la biblioteca','🔒',['cerraron','cerró']],
      reason('¿Qué cambió para que más barrios reciban libros?', [
        ['Un bus llevó los libros a los barrios','🚌'], ['Los libros se quedaron en el centro','🏢'], ['Cerraron la biblioteca','🔒']
      ], 0, 'Antes había que ir al centro. Con el bus, los libros pueden ir hasta otros barrios.'))
  ]
};

const catalogues = Object.fromEntries(Object.entries(capsules).map(([area, capsule]) => {
  const groups = practiceBands(area);
  const regular = capsule.cases.map((activity, index) => {
    const bandIndex = groups.findIndex(group => group.episodes.includes(index));
    const assessed = area === 'math' ? withMathExplanations(activity)
      : withExplanations(activity, (area === 'story' ? whyStory : whyHistory)[index]);
    const check = bandIndex === 2 && (area === 'math'
      ? mathReason(assessed, groups[bandIndex].episodes.indexOf(index))
      : practiceReasons[area][index]);
    return {...assessed, band:groups[bandIndex], keyStep:bandIndex, ...(check && {reason:check})};
  });
  const transfers = reserved[area].map((activity, index) => {
    const bandIndex = index % groups.length;
    return {...activity, band:groups[bandIndex], keyStep:bandIndex, reserved:true};
  });
  return [area, regular.concat(transfers)];
}));

export function getActivity(capsuleId, episode) {
  return Object.hasOwn(catalogues, capsuleId) && Number.isInteger(episode)
    ? catalogues[capsuleId][episode] : undefined;
}

export function getTransferVariantCount(capsuleId, initialEpisode) {
  const groups = practiceBands(capsuleId);
  return groups.some(band => band.episodes.includes(initialEpisode))
    ? reserved[capsuleId].length / groups.length : 0;
}

export function getTransferEpisode(capsuleId, initialEpisode, attempt = 0) {
  const groups = practiceBands(capsuleId);
  const bandIndex = groups.findIndex(band => band.episodes.includes(initialEpisode));
  if (bandIndex === -1) return undefined;
  const variant = Number.isInteger(attempt) && attempt >= 0
    ? attempt % getTransferVariantCount(capsuleId, initialEpisode) : 0;
  return capsules[capsuleId].cases.length + bandIndex + variant * groups.length;
}
