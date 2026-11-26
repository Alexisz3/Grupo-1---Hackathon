# Escuela Semilla

Aula interactiva con agentes del **Grupo 1** para primer grado. Los niños enseñan a un personaje con fichas, texto o dictado. El personaje conserva lo que entendió y pregunta por una idea a la vez. Cuando identifica un error, muestra la respuesta correcta y explica por qué antes de que el niño corrija su mapa. El catálogo tiene diez ejercicios por área de Matemáticas, Lenguaje e Historia. Los niveles son Identificar, Conectar y Explicar. La app alterna entre dos casos reservados por nivel y área. Si ya mostró ambos en esa sesión, el siguiente aparece como reto de repaso.

## Ejecutar

Requiere Node.js 22.12 o posterior y pnpm.

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm start
```

Abre http://127.0.0.1:3000. Para editar la interfaz, `pnpm dev` arranca Vite. Ejecuta también `pnpm start` en el puerto 3000 si quieres que Vite consulte la API. El tablero y el intérprete local siguen disponibles cuando esa API no responde.

## Presentar en AWS

El servidor Node sirve la compilación y la API desde el mismo origen. Desde la instancia EC2, después de instalar y compilar, ejecuta:

```bash
HOST=0.0.0.0 PORT=3000 pnpm start
```

Usa la URL y las reglas de entrada que autorice el Learner Lab. El dictado requiere un navegador compatible y localhost o HTTPS. Escuchar usa las voces que ofrece el dispositivo. Las fichas, el teclado y el texto están disponibles sin permisos de micrófono.

## Agregar cápsulas

- `src/capsules.mjs` y `src/extra-cases.mjs` contienen el catálogo. `src/learning-content.mjs` asigna los niveles, explica la respuesta de cada casilla y define los retos reservados y sus preguntas de razonamiento.
- `src/Workshop.jsx` implementa enseñar, revisar, corregir y aplicar la idea. La revisión contrasta las fichas con el contenido preparado. Para aclarar una expresión dudosa, el personaje le pide al niño que elija una ficha.
- `src/interpreter.mjs` interpreta frases cortas localmente. Si el intérprete local no reconoce ninguna idea, `server.js` puede consultar un endpoint compatible con *chat completions* mediante `MODEL_URL`, `MODEL_NAME` y, si el proveedor la requiere, `MODEL_KEY`. El servidor limita esa sugerencia a fichas válidas y el niño debe confirmarla.
- `src/Studio.jsx` conserva los trazos del niño y permite completarlos con Sketch-RNN. Los modelos de gato, conejo y pájaro se sirven desde `public/art/` y se ejecutan en el dispositivo. El servidor no guarda dibujos, nombres, explicaciones ni resultados. Si se habilita un proveedor para el intérprete, le llega el texto escrito o dictado, junto con las casillas y fichas del caso.

## Qué medir en una prueba con niños

La pantalla final muestra cuántas casillas estaban bien en la primera revisión, si el niño reconoció la explicación correcta en su primer intento y cuántas pistas o correcciones recibió en el reto. Los resultados se mantienen en la sesión. Elegir una explicación entre fichas sirve como evidencia de reconocimiento.

Para observar si un niño puede explicar la idea por su cuenta, prepara dos casos equivalentes que no estén en el catálogo ni en los retos de la app. Antes de la cápsula, presenta uno y pídele que muestre o explique el paso clave. Después, repite con el otro caso y con la misma instrucción. Alterna el orden de los casos entre participantes. Registra el acierto, la explicación del paso clave y la ayuda recibida en columnas distintas. Usa una escala sencilla para la explicación: 0 si no la presenta, 1 si menciona una parte y 2 si conecta las ideas necesarias. Reporta el número de participantes y los resultados observados.

## Referencias de diseño

- [Betty’s Brain, Universidad Vanderbilt](https://www.vanderbilt.edu/oele/bettys-brain/) inspira el mapa editable del personaje que aprende. Escuela Semilla usa tres casillas y preguntas de una en una para primer grado.
- [GCompris · Chronos](https://gcompris.net/screenshots-en.html#chronos) inspira ordenar imágenes en una secuencia. [Repositorio de GCompris](https://github.com/gcompris/GCompris-qt).
- [Khan Academy Kids](https://www.khanacademy.org/kids/ela) inspira la narración repetible y las preguntas breves de un personaje.
- [Sketch-RNN de Magenta](https://github.com/magenta/magenta-demos/tree/main/sketch-rnn-js) aporta la implementación y los modelos de dibujo. Los créditos y recursos del modelo se encuentran en `public/art/`.
