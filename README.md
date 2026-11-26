# Escuela Semilla

Aula interactiva con agentes del **Grupo 1** para primer grado. Los niños enseñan a un personaje con fichas, texto o dictado. El personaje devuelve un mapa editable, pregunta por la primera idea que necesita aclarar y propone otra situación para practicar. El catálogo tiene diez ejercicios en cada área de Matemáticas, Lenguaje e Historia. Cada ejercicio utiliza el siguiente caso del área como reto.

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

- `src/capsules.mjs` y `src/extra-cases.mjs` contienen los casos y sus mapas. Cada caso declara la escena, las tres casillas, las fichas, la respuesta esperada y una pista por casilla. El catálogo y los totales se generan a partir de esos datos.
- `src/Workshop.jsx` implementa enseñar, revisar, editar y probar un caso nuevo. La corrección contrasta las fichas con el contenido preparado de cada caso.
- `src/interpreter.mjs` interpreta frases cortas localmente. `server.js` puede consultar un endpoint compatible con *chat completions* mediante `MODEL_URL`, `MODEL_NAME` y, si el proveedor la requiere, `MODEL_KEY`. El servidor acepta únicamente IDs de fichas incluidas en el caso. El modelo interpreta la explicación y la revisión del tablero aplica las reglas de la cápsula.
- `src/Studio.jsx` conserva los trazos del niño y permite completarlos con Sketch-RNN. Los modelos de gato, conejo y pájaro se sirven desde `public/art/` y se ejecutan en el dispositivo. El servidor no guarda dibujos, nombres, explicaciones ni resultados. Si se habilita un proveedor para el intérprete, le llega el texto escrito o dictado, junto con las casillas y fichas del caso.

La pantalla final indica si se resolvió el nuevo mapa sin corrección ni pistas. El resultado corresponde a esa sesión. Para evaluar aprendizaje, conviene observar también cómo explica el niño su respuesta con sus propias palabras o dibujos.

## Referencias de diseño

- [Betty’s Brain, Universidad Vanderbilt](https://www.vanderbilt.edu/oele/bettys-brain/) inspira el mapa editable del personaje que aprende. Escuela Semilla usa tres casillas y preguntas de una en una para primer grado.
- [GCompris · Chronos](https://gcompris.net/screenshots-en.html#chronos) inspira ordenar imágenes en una secuencia. [Repositorio de GCompris](https://github.com/gcompris/GCompris-qt).
- [Khan Academy Kids](https://www.khanacademy.org/kids/ela) inspira la narración repetible y las preguntas breves de un personaje.
- [Sketch-RNN de Magenta](https://github.com/magenta/magenta-demos/tree/main/sketch-rnn-js) aporta la implementación y los modelos de dibujo. Los créditos y recursos del modelo se encuentran en `public/art/`.
