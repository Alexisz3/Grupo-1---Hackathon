function guide(name, topic, where, era, emoji, intro, cards) {
  const lessons = cards.map(([question, reply, before, now]) => ({question, reply, before, now}));
  return {name, topic, where, era, emoji, voice:'Leda', intro, lessons,
    questions:lessons.map(lesson => lesson.question),
    facts:lessons.map(lesson => lesson.reply)};
}

export const worldGuides = {
  stone:guide('Guía de las primeras herramientas', 'Prehistoria', 'África oriental', 'Edad de Piedra', '🪨',
    'Vamos a mirar las huellas que dejaron los primeros humanos. ¿Qué pregunta te da curiosidad?', [
      ['¿Cómo hacían herramientas?', 'Golpeaban una piedra con otra para sacar pedazos con filo. Esas piezas servían para cortar.', '🪨 Piedra tallada', '🔧 Herramientas de varios materiales'],
      ['¿Para qué usaban las piedras?', 'Algunas piedras con filo servían para cortar. Con herramientas pesadas también podían machacar alimentos.', '🪨 Piedra para machacar', '🥣 Mortero de cocina'],
      ['¿Cómo sabemos lo que hacían?', 'Los arqueólogos encuentran piedras talladas y las estudian. Su forma ayuda a saber cómo se usaron.', '🪨 Huellas en las piedras', '🔍 Arqueólogos las estudian']
    ]),
  greek:guide('Guía del taller de Atenas', 'Grecia antigua', 'Atenas, Grecia', 'Hace unos 2.500 años', '🏺',
    'Visitemos un taller de cerámica de la antigua Atenas. ¿Qué quieres descubrir?', [
      ['¿De qué eran las vasijas?', 'Se hacían de arcilla. Los alfareros le daban forma y la cocían para que quedara dura.', '🏺 Vasija de arcilla', '🥣 Recipientes de varios materiales'],
      ['¿Para qué servían?', 'Las vasijas tenían distintas formas según su uso. Algunas servían para guardar o transportar líquidos como aceite.', '🏺 Vasijas para aceite', '🫙 Frascos y botellas'],
      ['¿Qué pintaban en ellas?', 'Algunas vasijas tenían figuras pintadas. Las escenas nos ayudan a conocer historias y costumbres de la antigua Grecia.', '🏺 Escenas pintadas', '📷 Fotos y dibujos']
    ]),
  norse:guide('Guía del barco comerciante', 'Pueblos nórdicos', 'Dinamarca y el mar Báltico', 'Época vikinga', '⛵',
    'Subamos a un barco mercante de la época vikinga y viajemos por la costa.', [
      ['¿Para qué servía el barco?', 'Este barco llevaba mercancías entre lugares de Dinamarca y del mar Báltico.', '⛵ Barco mercante de vela', '🚢 Barcos de carga'],
      ['¿Por dónde viajaba?', 'Podía viajar por la costa danesa y el mar Báltico. Los puertos conectaban a pueblos de distintos lugares.', '⚓ Rutas por la costa', '🗺️ Mapas para navegar'],
      ['¿Cómo sabemos cómo era?', 'Se conservan partes de un barco de esa época. En el museo estudiaron esas piezas y construyeron una copia.', '🪵 Piezas del barco', '🔍 Copia en el museo']
    ]),
  egypt:guide('Guía de los jeroglíficos', 'Egipto antiguo', 'Valle del Nilo, Egipto', 'Egipto antiguo', '📜',
    'Visitemos el valle del Nilo para descubrir cómo escribían en el antiguo Egipto.', [
      ['¿Qué eran los jeroglíficos?', 'Eran signos para escribir. Algunos representaban sonidos y otros ayudaban a entender una palabra.', '📜 Escritura con jeroglíficos', '✍️ Escritura con letras'],
      ['¿Dónde escribían?', 'Podían tallarlos en piedra. También escribían a mano sobre papiro y otros materiales.', '🪨 Signos tallados', '📓 Cuadernos de papel'],
      ['¿Los signos eran solo dibujos?', 'Algunos parecen dibujos de personas, aves u objetos. También podían servir para escribir sonidos.', '🐦 Signos con dibujos', '🔤 Letras para escribir sonidos']
    ]),
  maya:guide('Guía de la escritura maya', 'Ciudades mayas', 'Mesoamérica', 'Período Clásico maya', '📚',
    'Visitemos las ciudades mayas y descubramos cómo sus escribas guardaban historias.', [
      ['¿Cómo escribían los mayas?', 'Usaban muchos signos llamados glifos. Con ellos escribían, entre otras cosas, historias y fechas.', '🪧 Glifos mayas', '✍️ Muchas formas de escribir'],
      ['¿Dónde dejaban sus historias?', 'Sus escribas escribían en libros y en objetos. También quedaron textos tallados en monumentos.', '🪨 Historias en piedra', '📚 Libros y archivos'],
      ['¿Vivían en una sola ciudad?', 'Había muchas ciudades mayas. Cada una tenía su propio gobierno y podía hacer alianzas con otras.', '🏛️ Muchas ciudades mayas', '🗺️ Ciudades de la región']
    ]),
  china:guide('Guía del taller de impresión', 'China antigua', 'China, época Tang', 'Año 868', '🖨️',
    'Visitemos un taller de hace muchos siglos. Descubriremos cómo se imprimía con madera.', [
      ['¿Cómo copiaban una página?', 'Tallaban los signos en un bloque de madera. Le ponían tinta y lo apoyaban sobre el papel para dejar una copia.', '🪵 Bloque de madera', '🖨️ Impresora'],
      ['¿Sobre qué imprimían?', 'En China se imprimían textos con tinta sobre papel. Uno de los libros que conocemos de esa época tiene fecha del año 868.', '📜 Tinta sobre papel', '📄 Libros impresos'],
      ['¿Servía el bloque más de una vez?', 'Sí. Podían ponerle tinta otra vez para imprimir otra copia de la misma página.', '🪵 Un bloque, varias copias', '🖨️ Varias copias impresas']
    ])
};
