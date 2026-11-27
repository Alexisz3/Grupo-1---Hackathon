# Levantar Escuela Semilla con Docker

Guía para levantar **todo el proyecto en cualquier computadora** (Linux, macOS o Windows) o en una EC2 de AWS, sin instalar Node ni Python: todo corre en contenedores.

## Qué se levanta

| Servicio | Qué hace | Perfil | Tamaño aprox. |
|---|---|---|---|
| `app` | La web, la API y la base de datos (SQLite) | siempre | 200 MB |
| `voice` | Voz en español (Kokoro), sin límites | `voice` | 5 GB |
| `painter` | Ilustraciones del cuento y del personaje (SD-Turbo) | `images` | 1 GB + modelo de 2 GB |
| `ollama` | Texto con IA local, sin clave (gemma3:4b) | `ollama` (opcional) | 4 GB |
| `tunnel` | Enlace `https://…trycloudflare.com` temporal | `tunnel` (opcional) | 60 MB |

El texto con IA (cuentos, Pipo, personajes de historia, entender dibujos) usa **Gemini** con una clave gratis, o **Ollama** si no hay clave.

## Requisitos

- **Docker** con **Docker Compose v2** (el comando es `docker compose`, con espacio).
  - Windows y macOS: [Docker Desktop](https://docs.docker.com/desktop/).
  - Linux: [Docker Engine](https://docs.docker.com/engine/install/) y el plugin de Compose. Para usarlo sin `sudo`: `sudo usermod -aG docker $USER` y volver a iniciar sesión.
- **Git** para bajar el proyecto.
- **Memoria:** 8 GB libres para Docker como mínimo (16 GB recomendado; con Ollama, 16 GB). En Docker Desktop se ajusta en *Settings → Resources*.
- **Disco:** unos 15 GB libres (imágenes y modelos).
- **Internet** la primera vez, para bajar imágenes y modelos (~8 GB, o ~12 GB con Ollama).
- Una **clave de Gemini** (gratis en <https://aistudio.google.com/apikey>) o usar Ollama.

## Levantar en 4 pasos

```bash
# 1. Bajar el proyecto
git clone https://github.com/Alexisz3/Grupo-1---Hackathon.git escuela-semilla
cd escuela-semilla

# 2. Crear la configuración
cp .env.example .env
# 3. Abrir .env y pegar la clave de Gemini en MODEL_KEY y GEMINI_KEY
#    (o saltar este paso y levantar con --ollama)

# 4. Levantar todo
./scripts/escuela.sh up
```

Abrir **<http://127.0.0.1:3000>**. La primera vez tarda (baja ~8 GB); después arranca en segundos.

### Sin clave de Gemini (todo local)

```bash
./scripts/escuela.sh up --ollama
```

El script ajusta `.env` para usar Ollama. La primera descarga requiere internet. Luego, el tiempo de respuesta depende de la CPU y de si el modelo ya está cargado. Para probar solo la app y Gemma, agrega `--sin-voz --sin-imagenes`.

### Probar Gemma en Windows sin Docker

Abre [Ollama](https://docs.ollama.com/windows) y ejecuta estos comandos desde la carpeta del proyecto:

```powershell
ollama pull gemma3:4b
pnpm install --frozen-lockfile
pnpm build
pnpm start:gemma
```

Abre <http://127.0.0.1:3000>. En una cápsula, usa «Con mis palabras» para probar cómo prepara las tarjetas. Si el modelo tarda demasiado, el intérprete de la cápsula permite continuar. También puedes probar una pregunta propia en Historia.

### En Windows (PowerShell), sin el script

```powershell
git clone https://github.com/Alexisz3/Grupo-1---Hackathon.git escuela-semilla
cd escuela-semilla
copy .env.example .env
notepad .env                      # pegar la clave de Gemini
docker compose --profile voice --profile images up -d --build
```

Con Ollama: cambiar en `.env` `MODEL_URL=http://ollama:11434/v1/chat/completions`, `MODEL_NAME=gemma3:4b` y dejar vacíos `MODEL_KEY` y `MODEL_EFFORT`; luego agregar `--profile ollama` al comando.

## Comandos del día a día

| Para | Con el script | Con Docker Compose |
|---|---|---|
| Levantar todo | `./scripts/escuela.sh up` | `docker compose --profile voice --profile images up -d --build` |
| Ver el estado | `./scripts/escuela.sh status` | `docker compose --profile voice --profile images ps` |
| Ver los logs | `./scripts/escuela.sh logs` (o `logs app`) | `docker compose logs -f app` |
| Apagar | `./scripts/escuela.sh down` | `docker compose --profile voice --profile images down` |
| Respaldar los datos | `./scripts/escuela.sh backup` | ver «Datos» |
| Restaurar un respaldo | `./scripts/escuela.sh restore archivo.tgz` | ver «Datos» |
| Actualizar el código | `git pull && ./scripts/escuela.sh up` | `git pull` y el comando de levantar |

Opciones de `up`: `--ollama` (texto local), `--tunnel` (enlace https), `--sin-voz`, `--sin-imagenes` (para computadoras con poca memoria).

`status` muestra `healthy` cuando cada servicio está listo. El ilustrador tarda unos minutos la primera vez porque baja su modelo.

## Datos

Todo lo que hacen los niños se guarda en el volumen de Docker **`escuela-semilla_data`**: la base SQLite (`escuela.db`) con el personaje, las estrellas, los cuentos, las rondas de mates y las tarjetas de historia, y la carpeta `pictures/` con las ilustraciones. Sobrevive a reinicios, a `down` y a actualizar el código.

```bash
./scripts/escuela.sh backup                                  # crea respaldo-escuela-AAAAMMDD-HHMM.tgz
./scripts/escuela.sh restore respaldo-escuela-AAAAMMDD-HHMM.tgz
```

Sin el script:

```bash
docker run --rm -v escuela-semilla_data:/data:ro -v "$PWD":/backup alpine tar czf /backup/respaldo.tgz -C /data .
```

**Empezar de cero** (borra todo lo guardado): `./scripts/escuela.sh down` y luego `docker volume rm escuela-semilla_data`. Los modelos están en otros volumenes (`escuela-semilla_models`, `escuela-semilla_ollama`) y no se pierden.

## Micrófono (dictar, «Leer yo», hablar con los personajes)

El navegador solo deja usar el micrófono en `http://127.0.0.1` / `localhost` o con **https**. En la misma computadora funciona directo. Para abrirlo desde otro equipo o un celular:

```bash
./scripts/escuela.sh up --tunnel     # muestra un enlace https://….trycloudflare.com
./scripts/escuela.sh link            # vuelve a mostrar el enlace
```

El enlace es público y cambia en cada arranque: compartirlo solo con el equipo y apagar el túnel (`down`) al terminar.

## En una EC2 de AWS (Learner Lab)

1. Crear una instancia **m5.2xlarge** (8 vCPU, 32 GB) con **Ubuntu 24.04** y **40 GB de disco**. En el grupo de seguridad basta SSH (22); con el túnel no hace falta abrir el puerto 3000.
2. Entrar por SSH e instalar Docker:
   ```bash
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker $USER && newgrp docker
   ```
3. Seguir «Levantar en 4 pasos» y usar `./scripts/escuela.sh up --tunnel` para tener el enlace https.
4. Sin túnel: poner `APP_BIND=0.0.0.0` en `.env`, abrir el puerto 3000 en el grupo de seguridad y entrar por `http://IP-PUBLICA:3000` (sin micrófono, porque no es https).

Costo: la m5.2xlarge cuesta ~0,38 USD por hora; los 50 USD alcanzan para ~130 horas. **Apagar la instancia** cuando no se use. Al detenerla, los volúmenes de Docker quedan en el disco.

## Problemas comunes

| Síntoma | Qué hacer |
|---|---|
| `permission denied … docker.sock` | En Linux: `sudo usermod -aG docker $USER` y volver a iniciar sesión |
| `port is already allocated` (3000) | Cambiar `APP_PORT=3001` en `.env` y volver a levantar |
| El cuento dice «La IA no está configurada» | Falta `MODEL_KEY` en `.env`, o levantar con `--ollama` |
| No hay ilustraciones y se ve el dibujo del niño | El ilustrador todavía baja su modelo: `./scripts/escuela.sh logs painter` |
| No suena la voz | Tocar cualquier parte de la página una vez (el navegador exige un toque antes del primer audio) y revisar `./scripts/escuela.sh status` |
| El contenedor se cierra solo (`exited 137`) | Falta memoria: dar más memoria a Docker o levantar con `--sin-imagenes` |
| Muy lento con Ollama | Normal en CPU; con Gemini cada página tarda ~2 s |

## Desarrollo sin Docker

Requiere Node.js 22.13 o posterior y pnpm. La voz y el ilustrador pueden seguir en Docker (`docker compose --profile voice --profile images up -d voice painter`).

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm start                 # http://127.0.0.1:3000, lee .env; los datos van a ./data
```

En `.env` descomentar `TTS_URL` e `IMAGE_URL` (sección «Solo si se corre sin Docker»).
