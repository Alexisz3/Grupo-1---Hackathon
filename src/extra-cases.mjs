// Each row describes one idea that the child can put in the map.
function narrative(title, setup, scene, labels, facts, extra) {
  const ids = ['start', 'action', 'end'];
  const steps = facts.map(([, , question, hint], i) => ({label:labels[i], question, hint, answer:ids[i]}));
  const options = facts.map(([label, icon, , , words], i) => ({id:ids[i], label, icon, words}));
  const [label, icon, words] = extra;
  return {title, setup, scene, steps, cards:[options[2], options[0], {id:'other',label,icon,words}, options[1]]};
}

const story = (title, setup, scene, facts, extra) =>
  narrative(title, setup, scene, ['Quería', 'Hizo', 'Al final'], facts, extra);

export const moreStories = [
  story('Una planta con sed', 'Mía quería cuidar su planta. Le echó agua y la tierra quedó húmeda.', ['🪴','💧'], [
    ['Cuidar la planta','🪴','¿Qué quería hacer Mía?','Piensa en lo que le preocupaba a Mía.',['cuidar la planta','cuidarla']],
    ['Echó agua','💧','¿Qué hizo Mía?','Piensa en lo que puso en la tierra.',['agua','regó']],
    ['Tierra húmeda','🌱','¿Cómo quedó la tierra?','Piensa en cómo queda la tierra al regarla.',['húmeda','mojada']]
  ], ['Jugar fútbol','⚽',['fútbol','pelota']]),
  story('Los pies de Tomás', 'Tomás quería salir con lluvia. Se puso botas y sus pies quedaron secos.', ['🌧️','🥾'], [
    ['Salir con lluvia','🌧️','¿Qué quería hacer Tomás?','Mira cómo estaba el tiempo.',['salir','lluvia']],
    ['Se puso botas','🥾','¿Qué se puso Tomás?','Lo puso en sus pies.',['botas']],
    ['Pies secos','☀️','¿Cómo quedaron sus pies?','Las botas separan los pies del agua.',['secos','secaron']]
  ], ['Se puso un gorro','🧢',['gorro','sombrero']]),
  story('El regalo de Eva', 'Eva quería alegrar a su abuelo. Le dibujó una flor y él sonrió.', ['🌼','👴'], [
    ['Alegrar al abuelo','👴','¿Qué quería hacer Eva?','Piensa en cómo quería que se sintiera su abuelo.',['alegrar','contento']],
    ['Dibujó una flor','🌼','¿Qué hizo Eva?','Piensa en algo que puedes dibujar con pétalos.',['flor','dibujó']],
    ['El abuelo sonrió','🙂','¿Qué hizo el abuelo?','Mira la cara que pondría al recibir el regalo.',['sonrió','sonrisa']]
  ], ['Compró una pelota','⚽',['pelota']]),
  story('La merienda de Sol', 'Sol tenía hambre. Preparó un pan con queso y dejó de tener hambre.', ['🍞','🧀'], [
    ['Tenía hambre','😋','¿Cómo se sentía Sol?','Piensa en lo que sentimos antes de comer.',['tenía hambre','con hambre']],
    ['Pan con queso','🧀','¿Qué preparó Sol?','Mira los dos ingredientes del dibujo.',['pan','queso']],
    ['Quedó satisfecha','🙂','¿Cómo quedó después de comer?','Piensa en lo que te pasa cuando ya comiste suficiente.',['satisfecha','llena','dejó de tener hambre']]
  ], ['Preparó jugo','🥤',['jugo','zumo']]),
  story('La cometa de Luz', 'Luz quería volar su cometa. Esperó el viento y la cometa subió.', ['🪁','🍃'], [
    ['Volar la cometa','🪁','¿Qué quería hacer Luz?','Busca el juguete que se usa al aire libre.',['volar la cometa','jugar con su cometa']],
    ['Esperó el viento','🍃','¿Qué esperó Luz?','Piensa en lo que mueve las hojas.',['viento','esperó']],
    ['La cometa subió','⬆️','¿Qué pasó al final?','Piensa hacia dónde fue la cometa.',['subió','levantó vuelo']]
  ], ['Se puso a cantar','🎵',['cantar','cantó']]),
  story('Un lugar para leer', 'Joel quería leer en el patio. Buscó la sombra de un árbol y pudo leer fresco.', ['📖','🌳'], [
    ['Leer en el patio','📖','¿Qué quería hacer Joel?','Busca lo que llevaba en las manos.',['leer','lectura']],
    ['Buscó la sombra','🌳','¿Adónde fue Joel?','Busca el lugar donde el sol pega menos.',['sombra','árbol']],
    ['Leyó fresco','😊','¿Cómo se sintió al leer?','Estaba fuera del sol directo.',['fresco','fresquito']]
  ], ['Se fue a correr','🏃',['correr','corrió']]),
  story('Burbuja se perdió', 'Sara quería encontrar a su gato. Lo llamó con su voz y el gato volvió.', ['🐈','🏠'], [
    ['Encontrar a su gato','🐈','¿Qué quería hacer Sara?','Busca a quién estaba buscando.',['encontrar','buscar a su gato']],
    ['Lo llamó','🔊','¿Qué hizo para encontrarlo?','Piensa en lo que puedes hacer con tu voz.',['llamó','llamar']],
    ['El gato volvió','🏠','¿Qué pasó con el gato?','Al final, el gato se reunió con Sara.',['volvió','regresó']]
  ], ['El gato se durmió','🌙',['durmió']]),
  story('El puente de bloques', 'Amir quería que su carro cruzara un charco. Puso dos bloques como puente y el carro pasó.', ['🚗','💧'], [
    ['Cruzar el charco','🚗','¿Qué quería hacer Amir?','Piensa hacia dónde quería llevar el carro.',['cruzar','pasar el charco']],
    ['Hizo un puente','🧱','¿Qué puso sobre el charco?','Busca lo que hizo con los bloques.',['puente','bloques']],
    ['El carro pasó','🏁','¿Qué logró al final?','El carro ya quedó al otro lado.',['pasó','logró cruzar']]
  ], ['Se mojó el carro','💧',['mojó','empapó']])
];

const timeline = (title, setup, scene, facts, extra) =>
  narrative(title, setup, scene, ['Antes', 'Después', 'Al final'], facts, extra);

export const moreHistory = [
  timeline('Mi primer día de clases', 'Nora preparó su mochila. Después llegó a la escuela. Al terminar volvió a casa.', ['🎒','🏫'], [
    ['Preparó su mochila','🎒','¿Qué hizo antes de salir?','Piensa en lo que llevaba en la espalda.',['mochila','preparó']],
    ['Llegó a la escuela','🏫','¿Adónde llegó después?','Es el lugar donde fue a estudiar.',['escuela','colegio']],
    ['Volvió a casa','🏠','¿Adónde volvió al final?','Piensa en dónde empezó su día.',['casa','volvió']]
  ], ['Fue al cine','🎬',['cine','película']]),
  timeline('La carta de la abuela', 'Cuando era niña, la abuela enviaba cartas. Después usó el teléfono. Hoy hace videollamadas con su nieta.', ['✉️','📱'], [
    ['Enviaba cartas','✉️','¿Cómo se comunicaba de niña?','Piensa en un mensaje dentro de un sobre.',['cartas','sobre']],
    ['Usó el teléfono','☎️','¿Qué usó después?','Podía escuchar la voz de otra persona.',['teléfono','llamaba']],
    ['Hace videollamadas','📱','¿Qué hace hoy con su nieta?','Ahora también pueden verse.',['videollamadas','video']]
  ], ['Mandaba regalos','🎁',['regalos']]),
  timeline('Luz en la casa', 'En su antigua casa, la familia de Vera usaba velas. Cuando llegó la electricidad instaló lámparas. Hoy cambió a focos LED.', ['🕯️','💡'], [
    ['Encendían velas','🕯️','¿Qué usaba esta familia antes?','Busca la pequeña llama.',['velas','vela']],
    ['Instaló lámparas','💡','¿Qué puso cuando llegó la electricidad?','Busca lo que se enciende con interruptor.',['lámparas','lampara']],
    ['Usa focos LED','🔆','¿Qué usa hoy?','Busca el tipo de foco que cambió al final.',['led','focos led']]
  ], ['Cerró las ventanas','🪟',['ventanas']]),
  timeline('El árbol del patio', 'Hace tiempo, la escuela plantó un árbol. Durante varios años creció. Hoy la clase lee bajo su sombra.', ['🌱','🌳'], [
    ['Plantaron un árbol','🌱','¿Qué hizo la escuela hace tiempo?','Al principio el árbol era pequeño.',['plantó','plantaron']],
    ['El árbol creció','🌳','¿Qué pasó con los años?','Mira cómo cambió de tamaño.',['creció','crecer']],
    ['Leen a la sombra','📖','¿Qué hace la clase hoy?','Busca lo que sostienen en sus manos.',['lee','leen','sombra']]
  ], ['Juegan en el río','🌊',['rio','río']]),
  timeline('La cancha del barrio', 'Antes había un terreno vacío. Luego los vecinos armaron una cancha. Hoy juegan juntos allí.', ['🏘️','⚽'], [
    ['Terreno vacío','🟫','¿Qué había antes?','Piensa en el terreno antes de construir.',['terreno','vacío']],
    ['Armaron una cancha','🥅','¿Qué hicieron los vecinos después?','Busca un lugar para jugar en equipo.',['cancha','armaron']],
    ['Juegan juntos','⚽','¿Qué hacen hoy allí?','Mira lo que podrían hacer con una pelota.',['juegan','partido']]
  ], ['Abren una tienda','🏪',['tienda']]),
  timeline('El álbum de Dani', 'Dani tenía una foto de bebé. Más tarde le tomaron otra en su primer día de clases. Hoy pega ambas en un álbum.', ['👶','📷'], [
    ['Foto de bebé','👶','¿Cuál foto fue primero?','Busca a Dani cuando era más pequeño.',['bebé']],
    ['Foto de la escuela','🏫','¿Qué foto llegó después?','Fue el día que empezó a estudiar.',['escuela','clases']],
    ['Pegó las fotos','📚','¿Qué hace Dani hoy?','Piensa dónde quiere guardar sus recuerdos.',['pegó','álbum']]
  ], ['Rompió las fotos','🗑️',['rompió','botó']]),
  timeline('Dos formas de oír música', 'De niña, la tía de Luis oía música en la radio. Más tarde usó discos. Hoy escucha canciones en el teléfono.', ['📻','📱'], [
    ['Oía la radio','📻','¿Qué usaba de niña?','Piensa en el aparato que busca estaciones.',['radio']],
    ['Usó discos','💿','¿Qué usó más tarde?','Busca la forma redonda.',['discos','disco']],
    ['Usa el teléfono','📱','¿Dónde escucha hoy?','Ahora lo lleva en el bolsillo.',['teléfono','celular']]
  ], ['Guardó un reloj','⌚',['reloj']]),
  timeline('El camino a la plaza', 'La plaza tenía un camino de tierra. Después colocaron baldosas. Hoy una vecina usa la ruta para pasear en silla de ruedas.', ['🏞️','🛞'], [
    ['Camino de tierra','🟫','¿Cómo era el camino antes?','Imagina el suelo antes de las baldosas.',['tierra']],
    ['Pusieron baldosas','🧱','¿Qué colocaron después?','Busca las piezas que alisan el camino.',['baldosas','pavimento']],
    ['Pasea por la plaza','🏞️','¿Qué hace la vecina hoy?','Piensa en cómo usa la ruta nueva.',['pasea','pasear','silla de ruedas']]
  ], ['Nada en una piscina','🏊',['piscina','nada']])
];
