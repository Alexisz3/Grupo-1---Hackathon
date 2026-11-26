# Escuela Semilla

Prototipo del aula interactiva para primer grado. En Matemáticas, el niño mueve y cuenta semillas. En Lenguaje, ordena un cuento. En Historia, arma una línea del tiempo con los recuerdos de Ana. Cada cápsula termina con un mapa ilustrado. El personaje se puede cambiar o dibujar desde cualquier zona.

## Ejecutar

Con Node.js 22 o posterior, ejecutar `node server.js` y abrir http://127.0.0.1:3000. También se puede abrir index.html directamente para la versión local.

## AWS

En una instancia EC2 con Node.js instalado, ejecutar `HOST=0.0.0.0 PORT=3000 node server.js` desde esta carpeta. La URL externa y las reglas de entrada dependen del entorno del Learner Lab. El dictado depende del soporte del navegador y de un contexto seguro (localhost o HTTPS). El texto y las tarjetas funcionan independientemente del micrófono.

## Interpretación de las respuestas

La opción «Contárselo con mis palabras» de Matemáticas usa un intérprete local para frases sencillas. Para usar un modelo, definir MODEL_URL (endpoint completo compatible con chat completions), MODEL_NAME y, cuando corresponda, MODEL_KEY en el proceso del servidor. Solo la explicación escrita o transcrita se envía a ese endpoint. El dibujo y el nombre permanecen en el navegador. El dictado puede utilizar el servicio de voz del navegador. El servidor no persiste las sesiones.

El mapa conserva las cantidades que dijo el niño y señala el siguiente paso que el personaje necesita entender. El reto final cambia las cantidades.

## Dibujar y generar un personaje

Abre la aplicación mediante el servidor HTTP, despliega «Dibujar mi personaje», elige gato, conejo o pájaro y dibuja un contorno parcial. Al pulsar «Crear personaje con IA», Sketch-RNN recibe los trazos del niño y predice nuevos trazos para completar la figura. Los trazos originales aparecen en verde y las adiciones en terracota. Se puede generar otra variante, cambiar de animal o seguir dibujando antes de empezar la cápsula.

El generador se ejecuta en un Web Worker. El navegador descarga el modelo del propio servidor y procesa el dibujo localmente. Cada modelo está especializado en un animal y los resultados varían según el boceto. Para usar el generador se requiere HTTP/HTTPS.

Implementación de referencia y bibliotecas de [Magenta Demos](https://github.com/magenta/magenta-demos/tree/main/sketch-rnn-js). Pesos preentrenados de Sketch-RNN disponibles en [Quick Draw Models](https://github.com/googlecreativelab/quickdraw-dataset#sketch-rnn-quickdraw-dataset). Los recursos distribuidos están en art/.
