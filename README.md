# Escuela Semilla

Aula interactiva con agentes del **Grupo 1** para primer grado. Los niños enseñan a un personaje con fichas, texto o dictado. El personaje devuelve un mapa editable, pregunta por la primera idea que necesita aclarar y propone otra situación para practicar. El catálogo tiene diez ejercicios en cada área de Matemáticas, Lenguaje e Historia. Cada ejercicio utiliza el siguiente caso del área como reto.

## Levantar con Docker

Guía completa (requisitos, Windows, EC2, respaldos, problemas comunes): **[docs/docker.md](docs/docker.md)**.

```bash
git clone https://github.com/Alexisz3/Grupo-1---Hackathon.git escuela-semilla && cd escuela-semilla
cp .env.example .env          # pegar la clave de Gemini (o usar --ollama, sin clave)
./scripts/escuela.sh up       # app + voz + ilustraciones → http://127.0.0.1:3000
```

| Servicio | Qué hace |
|---|---|
| `app` | Web, API y base SQLite (volumen `escuela-semilla_data`) |
| `voice` | Voz en español local (Kokoro) |
| `painter` | Ilustraciones locales (SD-Turbo en CPU) |
| `ollama` | Texto con IA local, sin clave (opcional, `--ollama`) |
| `tunnel` | Enlace https temporal para el micrófono (opcional, `--tunnel`) |

Cada zona tiene una actividad con IA arriba de sus ejercicios: «¡Pipo se equivoca!» (Matemáticas), «Crear un cuento con IA» y «Mis cuentos» (Lenguaje) y «Viaje en el tiempo» (Historia). Spec: [docs/spec-ia.md](docs/spec-ia.md).

## Desarrollo sin Docker

Requiere Node.js 22.13 o posterior y pnpm: `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm build`, `pnpm start`. Para editar la interfaz, `pnpm dev` arranca Vite y consulta la API en el puerto 3000. Detalles en [docs/docker.md](docs/docker.md#desarrollo-sin-docker).

## Agregar cápsulas

- `src/capsules.mjs` y `src/extra-cases.mjs` contienen los casos y sus mapas. Cada caso declara la escena, las tres casillas, las fichas, la respuesta esperada y una pista por casilla. El catálogo y los totales se generan a partir de esos datos.
- `src/Workshop.jsx` implementa enseñar, revisar, editar y probar un caso nuevo. La corrección contrasta las fichas con el contenido preparado de cada caso.
- `src/interpreter.mjs` interpreta frases cortas localmente. `server.js` puede consultar un endpoint compatible con *chat completions* mediante `MODEL_URL`, `MODEL_NAME` y, si el proveedor la requiere, `MODEL_KEY`. El servidor acepta únicamente IDs de fichas incluidas en el caso. El modelo interpreta la explicación y la revisión del tablero aplica las reglas de la cápsula.
- `src/screens/studio/` es «Mi personaje»: el niño dibuja en el mismo tablero del cuento y escribe qué es; la IA lo describe y el ilustrador pinta su retrato. El personaje, las estrellas, los cuentos y las actividades se guardan solo en la base local (volumen de Docker); al modelo de texto le llegan el dibujo y lo que el niño escribe o dicta, nunca su nombre real.

La pantalla final indica si se resolvió el nuevo mapa sin corrección ni pistas. El resultado corresponde a esa sesión. Para evaluar aprendizaje, conviene observar también cómo explica el niño su respuesta con sus propias palabras o dibujos.

## Referencias de diseño

- [Betty’s Brain, Universidad Vanderbilt](https://www.vanderbilt.edu/oele/bettys-brain/) inspira el mapa editable del personaje que aprende. Escuela Semilla usa tres casillas y preguntas de una en una para primer grado.
- [GCompris · Chronos](https://gcompris.net/screenshots-en.html#chronos) inspira ordenar imágenes en una secuencia. [Repositorio de GCompris](https://github.com/gcompris/GCompris-qt).
- [Khan Academy Kids](https://www.khanacademy.org/kids/ela) inspira la narración repetible y las preguntas breves de un personaje.
- [Drawn Worlds](https://github.com/slab10000/Mistral-AI-Hackathon-Winner_Drawn-Worlds) (ganador de la hackatón de Mistral) inspira el cuento que nace de un dibujo y el pedido de dibujar a mitad de la historia.
