# Spec · Zonas con IA

## Portada

- Fondo de aula cálido, título «¡Selecciona tu Zona de Aprendizaje!», tres tarjetas blancas con ilustración y franja naranja inferior.
- Sin medallas. Arriba: «Mi personaje» (abre el estudio) y «Premios ganados: N estrellas» con el progreso real.
- Zonas: ¡Matemáticas Divertidas! (Contar y Sumar) · ¡El Rincón del Cuento! (Letras y Palabras) · ¡Exploradores del Pasado! (Viaje en el Tiempo).

## Rincón del Cuento · un libro que nace de un dibujo

1. Libro abierto. Página izquierda: hoja para dibujar (colores, tamaño, borrar, deshacer, limpiar). Página derecha: «Dibuja tu mundo y toca ¡Cuenta mi cuento!».
2. La IA mira el dibujo y lo describe; el cuento nace de ese dibujo (protagonista y mundo).
3. Cada página: izquierda la ilustración de la IA; derecha el texto, «Escuchar», «Leer yo» y 2 opciones.
4. En la página 3 el cuento le pide al niño que dibuje algo nuevo («¡Dibuja el pajarito que encontró Misi!»). La IA mira ese dibujo y la historia sigue con él.
5. «Leer yo» marca cada palabra leída bien. Métrica: palabras leídas bien / palabras totales. A la página 5 cierra el cuento.

Voz e ilustraciones, sin límites ni costo por uso (Docker, CPU):

- Voz: Kokoro (`voice`), voces en español por personaje, ~1 s por audio. Respaldo: Gemini TTS (3 por minuto) y la voz del navegador.
- Ilustraciones: SD-Turbo (`painter`), 1 paso, ~8 s por página en CPU. El modelo del cuento escribe el prompt en inglés describiendo siempre igual al protagonista del dibujo; la semilla es fija por cuento. Sin ilustrador, se ve el dibujo del niño.

## Matemáticas · ¡Pipo se equivoca!

- El código elige los números (nivel 1: hasta 5, 2: hasta 10, 3: hasta 20) y el error de Pipo (olvidó un grupo, contó de más, de menos, o lo hizo bien).
- La IA solo escribe la situación con marcadores `{hero}`, `{a}`, `{b}`; el servidor la rechaza si trae otros números.
- El niño dice si Pipo sumó bien, elige el total (puede tocar cada cosa para contar) y le explica por voz. La IA responde como alumno y siempre dice la suma correcta.
- Tres aciertos sin ayuda suben de nivel; cada 5 problemas, una estrella.

## Historia · Viaje en el tiempo

- Personajes con ficha de datos: abuela Rosa (Valparaíso, 1960), Kusi (Ingapirca, 1500), don Ernesto (tren Guayaquil–Quito, 1908). **Revisar las fichas con el equipo.**
- El niño pregunta por voz; el personaje responde solo con su ficha, compara antes y ahora y devuelve una tarjeta. Tres tarjetas, una estrella.

## API

| Ruta | Entrada | Salida |
|---|---|---|
| `POST /api/story` | `{hero:{name, look}, place, pages:[{text, choice}]}` | `{text, scene, question, options:[2], end, picture}` |
| `POST /api/look` | `{image: dataURL PNG ≤ 300 KB}` | `{look}` (descripción corta del dibujo) |
| `POST /api/speak` | `{text ≤ 600, voice}` | `audio/wav` |
| `POST /api/picture` | `{prompt ≤ 300, drawing}` | imagen (503 sin `IMAGE_MODEL`) |
| `POST /api/math/problem` | `{hero, level}` | `{a, b, total, claim, setup, said, item, emoji}` |
| `POST /api/math/teach` | `{hero, problem, explanation}` | `{reply}` |
| `POST /api/history` | `{character, question, turns}` | `{reply, before, now}` |

- Modelo de texto: cualquier endpoint compatible con *chat completions* (`MODEL_URL`, `MODEL_NAME`, `MODEL_KEY`, `MODEL_EFFORT`): Gemini ahora, Ollama en Docker después, Bedrock en AWS.
- El servidor valida la forma de cada página (largo de textos, 2 opciones, 3 emojis) antes de enviarla. El texto del niño va solo como datos.

## Docker

- `compose.yaml`: servicio `app` (puerto 3000, `.env`). Perfil `ollama` (IA local) y perfil `tunnel` (enlace https de Cloudflare, necesario para el micrófono).

## Guardado local (SQLite en un volumen de Docker)

Todo queda en `data/escuela.db` (en Docker, el volumen `data` montado en `/app/data`). Las ilustraciones van como archivos en `data/pictures/`. Un solo perfil por aula, sin cuentas.

| Tabla | Guarda |
|---|---|
| `profile` | Mi personaje: nombre, emoji, retrato y descripción |
| `stars` | Estrellas ganadas (ejercicios y actividades con IA) |
| `stories` + `story_pages` | Cada cuento: dibujo inicial, páginas, elección, ilustración y lectura (palabras leídas / totales) |
| `activities` | Rondas de «Pipo se equivoca» y tarjetas de «Viaje en el tiempo», para medir el impacto |

| Ruta | Hace |
|---|---|
| `GET /api/profile` · `PUT /api/profile` | Lee y guarda el personaje |
| `GET /api/stars` · `POST /api/stars` | Estrellas (`{key}`) |
| `POST /api/stories` | Abre un cuento con su dibujo → `{id}`. `/api/story` y `/api/picture` reciben `storyId` y guardan cada página e ilustración |
| `POST /api/stories/:id/reading` | Guarda palabras leídas / totales |
| `GET /api/stories?page=&limit=` | «Mis cuentos», paginado (20 por defecto, 100 máximo) |
| `GET /api/stories/:id` | Un cuento con sus páginas, para releerlo |
| `POST /api/activities` | Registra una ronda de mates o una tarjeta de historia |

Toda la voz de la app (también el «Escuchar» de los ejercicios) pasa por `/api/speak`.
