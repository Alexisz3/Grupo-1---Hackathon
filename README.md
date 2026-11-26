# Escuela Semilla

Prototipo del aula interactiva para los tres primeros grados. La cápsula de suma invita a enseñar a un personaje, revisar su mapa, aclarar pasos y aplicar la explicación a otro caso. El personaje puede elegirse o dibujarse.

## Ejecutar

Con Node.js 22 o posterior, ejecutar `node server.js` y abrir http://127.0.0.1:3000. También se puede abrir index.html directamente para la versión local.

## AWS

En una instancia EC2 con Node.js instalado, ejecutar `HOST=0.0.0.0 PORT=3000 node server.js` desde esta carpeta. La URL externa y las reglas de entrada dependen del entorno del Learner Lab. El dictado depende del soporte del navegador y de un contexto seguro (localhost o HTTPS). El texto y las tarjetas funcionan independientemente del micrófono.

## Interpretación de las respuestas

Por defecto se usa un intérprete local para las expresiones de las tarjetas y frases sencillas. Para usar un modelo, definir MODEL_URL (endpoint completo compatible con chat completions), MODEL_NAME y, cuando corresponda, MODEL_KEY en el proceso del servidor. Solo la explicación escrita o transcrita se envía a ese endpoint. El dibujo y el nombre permanecen en el navegador. El dictado puede utilizar el servicio de voz del navegador. El servidor no persiste las sesiones.

La cápsula representa las cantidades inicial, añadida y total. El alumno puede borrar la interpretación y explicarse otra vez. El reto final cambia las cantidades.
