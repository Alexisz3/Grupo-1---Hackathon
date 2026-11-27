# Escuela Semilla

Aula interactiva con agentes del **Grupo 1** para primer grado. Los niños enseñan a un personaje con fichas, texto o dictado. El personaje conserva lo que entendió y pregunta por una idea a la vez. Cuando identifica un error, muestra la respuesta correcta y explica por qué antes de que el niño corrija su mapa. El catálogo tiene diez ejercicios por área de Matemáticas, Lenguaje e Historia. Los niveles son Identificar, Conectar y Explicar. La app alterna entre dos casos reservados por nivel y área. Si ya mostró ambos en esa sesión, el siguiente aparece como reto de repaso.

## Levantar con Docker

Guía completa (requisitos, Windows, EC2, respaldos, problemas comunes): **[docs/docker.md](docs/docker.md)**.

```bash
git clone https://github.com/Alexisz3/Grupo-1---Hackathon.git escuela-semilla && cd escuela-semilla
cp .env.example .env          # opcional: elegir modelos (no hace falta ninguna clave)
./scripts/escuela.sh up       # app + IA de texto + voz + ilustraciones → http://127.0.0.1:3000
```

| Servicio | Qué hace |
|---|---|
| `app` | Web, API y base SQLite (volumen `escuela-semilla_data`) |
| `voice` | Voz en español local (Kokoro) |
| `painter` | Ilustraciones locales (SD-Turbo en CPU) |
| `ollama` | Texto con IA local (Gemma): cuentos, Pipo, personajes y entender dibujos |
| `tunnel` | Enlace https temporal para el micrófono (opcional, `--tunnel`) |
| `gateway` | Puerta con clave para el modo dividido: app en AWS e IA en una PC (`ia` / `app`) |

Cada zona tiene una actividad con IA arriba de sus ejercicios: «¡Pipo se equivoca!» (Matemáticas), «Crear un cuento con IA» y «Mis cuentos» (Lenguaje) y «Viaje en el tiempo» (Historia). Spec: [docs/spec-ia.md](docs/spec-ia.md).

## Desarrollo sin Docker

Requiere Node.js 22.13 o posterior y pnpm: `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm build`, `pnpm start`. Para editar la interfaz, `pnpm dev` arranca Vite y consulta la API en el puerto 3000. Detalles en [docs/docker.md](docs/docker.md#desarrollo-sin-docker).

## Agregar cápsulas

- `src/capsules.mjs` y `src/extra-cases.mjs` contienen los casos y sus mapas. Cada caso declara la escena, las tres casillas, las fichas, la respuesta esperada y una pista por casilla. El catálogo y los totales se generan a partir de esos datos. `src/learning-content.mjs` asigna los niveles, explica la respuesta de cada casilla y define los retos reservados con sus preguntas de razonamiento.
- `src/Workshop.jsx` implementa enseñar, revisar, corregir y aplicar la idea. La corrección contrasta las fichas con el contenido preparado de cada caso. Para aclarar una expresión dudosa, el personaje le pide al niño que elija una ficha.
- `src/interpreter.mjs` interpreta frases cortas localmente. Si no reconoce ninguna idea, `server.js` consulta el modelo local (Ollama) mediante `MODEL_URL` y `MODEL_NAME`. El servidor acepta únicamente IDs de fichas incluidas en el caso, y el niño confirma la sugerencia antes de aplicarla.
- `src/screens/studio/` es «Mi personaje»: el niño dibuja en el mismo tablero del cuento y escribe qué es; la IA lo describe y el ilustrador pinta su retrato. El personaje, las estrellas, los cuentos y las actividades se guardan solo en la base local (volumen de Docker); al modelo de texto le llegan el dibujo y lo que el niño escribe o dicta, nunca su nombre real.

## Qué medir en una prueba con niños

La pantalla final muestra cuántas casillas estaban bien en la primera revisión, si el niño reconoció la explicación correcta en su primer intento y cuántas pistas o correcciones recibió en el reto. Los resultados se mantienen en la sesión. Elegir una explicación entre fichas sirve como evidencia de reconocimiento.

Para observar si un niño puede explicar la idea por su cuenta, prepara dos casos equivalentes que no estén en el catálogo ni en los retos de la app. Antes de la cápsula, presenta uno y pídele que muestre o explique el paso clave. Después, repite con el otro caso y con la misma instrucción. Alterna el orden de los casos entre participantes. Registra el acierto, la explicación del paso clave y la ayuda recibida en columnas distintas. Usa una escala sencilla para la explicación: 0 si no la presenta, 1 si menciona una parte y 2 si conecta las ideas necesarias. Reporta el número de participantes y los resultados observados.

## Referencias de diseño

- [Betty’s Brain, Universidad Vanderbilt](https://www.vanderbilt.edu/oele/bettys-brain/) inspira el mapa editable del personaje que aprende. Escuela Semilla usa tres casillas y preguntas de una en una para primer grado.
- [GCompris · Chronos](https://gcompris.net/screenshots-en.html#chronos) inspira ordenar imágenes en una secuencia. [Repositorio de GCompris](https://github.com/gcompris/GCompris-qt).
- [Khan Academy Kids](https://www.khanacademy.org/kids/ela) inspira la narración repetible y las preguntas breves de un personaje.
- [Drawn Worlds](https://github.com/slab10000/Mistral-AI-Hackathon-Winner_Drawn-Worlds) (ganador de la hackatón de Mistral) inspira el cuento que nace de un dibujo y el pedido de dibujar a mitad de la historia.

Las cuatro operaciones se encuentran en «¡Pipo se equivoca!». El código genera y comprueba cada cálculo. La resta incluye cero y las divisiones se reparten en grupos iguales.

«Viaje en el tiempo» incluye seis visitas de historia global con tres preguntas preparadas por destino. Esas respuestas funcionan sin configurar un modelo de IA. Fuentes de las fichas:

- [Prehistoria y herramientas, Smithsonian](https://humanorigins.si.edu/evidence/behavior/stone-tools)
- [Cerámica de Grecia antigua, British Museum](https://www.britishmuseum.org/sites/default/files/2019-09/Visit_Greece_Pots_KS2.pdf)
- [Barco comercial de época vikinga, Viking Ship Museum](https://www.vikingeskibsmuseet.dk/en/visit-the-museum/exhibitions/the-five-viking-ships/skuldelev-3)
- [Jeroglíficos de Egipto, British Museum](https://www.britishmuseum.org/sites/default/files/2025-05/Ancient-Egypt-Symbols-Visit-Resource-Ages-7-11.pdf)
- [Ciudades y escritura mayas, The Met](https://www.metmuseum.org/ja/exhibitions/arts-of-the-ancient-americas/inside-the-exhibition)
- [Impresión con bloques de madera en China, British Library](https://idp.bl.uk/collection/51FDAEAFB4A24E2E9981692A98130BC8/)
