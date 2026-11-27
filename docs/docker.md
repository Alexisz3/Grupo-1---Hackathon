# Levantar Escuela Semilla con Docker

Guía para levantar **todo el proyecto en cualquier computadora** (Linux, macOS o Windows) o en una EC2 de AWS, sin instalar Node ni Python: todo corre en contenedores.

## Qué se levanta

| Servicio | Qué hace | Perfil | Tamaño aprox. |
|---|---|---|---|
| `app` | La web, la API y la base de datos (SQLite) | siempre | 200 MB |
| `ollama` | Texto con IA: cuentos, Pipo, personajes de historia y entender dibujos (Gemma) | `texto` | 3 GB + modelo de 3 a 18 GB |
| `voice` | Voz en español (Kokoro), sin límites | `voice` | 5 GB |
| `painter` | Ilustraciones del cuento y del personaje (SD-Turbo) | `images` | 1 GB + modelo de 2 GB |
| `tunnel` | Enlace `https://…trycloudflare.com` temporal de la app | `tunnel` (opcional) | 60 MB |
| `gateway` + `ai-tunnel` | Puerta con clave y enlace https de la IA, para el modo dividido | `gateway` (opcional) | 60 MB |

**Toda la IA corre dentro de Docker**: no hace falta ninguna clave ni servicio externo, y ningún dibujo ni texto de los niños sale del servidor.

## Requisitos

- **Docker** con **Docker Compose v2** (el comando es `docker compose`, con espacio).
  - Windows y macOS: [Docker Desktop](https://docs.docker.com/desktop/).
  - Linux: [Docker Engine](https://docs.docker.com/engine/install/) y el plugin de Compose. Para usarlo sin `sudo`: `sudo usermod -aG docker $USER` y volver a iniciar sesión.
- **Git** para bajar el proyecto.
- **Memoria:** 12 GB libres para Docker como mínimo con los modelos por defecto (16 GB recomendado; 32 GB para los modelos grandes). En Docker Desktop se ajusta en *Settings → Resources*.
- **Disco:** unos 15 GB libres (imágenes y modelos).
- **Internet** solo la primera vez, para bajar imágenes y modelos (~12 GB). Después funciona sin internet.

## Levantar en 4 pasos

```bash
# 1. Bajar el proyecto
git clone https://github.com/Alexisz3/Grupo-1---Hackathon.git escuela-semilla
cd escuela-semilla

# 2. Crear la configuración (opcional: ahí se eligen los modelos)
cp .env.example .env

# 3. Levantar todo
./scripts/escuela.sh up

# 4. Medir la velocidad con los modelos elegidos
./scripts/escuela.sh bench
```

Abrir **<http://127.0.0.1:3000>**. La primera vez tarda (baja ~12 GB); después arranca en segundos.

## Elegir los modelos

En `.env`. Después de cambiarlos: `./scripts/escuela.sh up` y `./scripts/escuela.sh bench`.

| Variable | Opción | Para qué |
|---|---|---|
| `OLLAMA_MODEL` | `gemma3:4b` (por defecto) | Probado: ~6-10 s por página en CPU, ~4 GB de RAM |
| | `gemma4:e4b` | Más nuevo y mejor en español, imágenes y herramientas; ~10 GB de descarga. Recomendado si `bench` da menos de ~10 s por página |
| | `gemma4:26b` | El más potente que cabe en 32 GB (MoE, ~18 GB). En CPU escribe lento: mejor para preparar contenido que para jugar en vivo |
| `PAINTER_MODEL` | `stabilityai/sd-turbo` (por defecto) | ~8 s por imagen, ~4 GB de RAM |
| | `stabilityai/sdxl-turbo` | Mejores ilustraciones, ~3 veces más lento, ~10 GB de RAM |

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
notepad .env                      # opcional: elegir modelos
docker compose --profile texto --profile voice --profile images up -d --build
```

## Modo dividido: la app en AWS y la IA en tu PC

Si el servidor de AWS es chico, la app (web, API y base de datos, ~100 MB de RAM) corre en AWS y lo pesado (Gemma, voz e ilustraciones, ~10 GB) en una PC del equipo:

```
Niño ──https──▶ AWS: app (web + API + SQLite) ──https + clave──▶ PC: puerta (nginx) ──▶ Gemma · Kokoro · SD-Turbo
```

1. **En la PC** (con Docker y 16 GB de RAM):
   ```bash
   ./scripts/escuela.sh ia
   ```
   Levanta la IA, una **puerta con clave** (`gateway`) y un túnel https. Al final muestra dos líneas: `AI_URL=…` y `AI_TOKEN=…`.
2. **En AWS** (cualquier instancia con 1 GB de RAM alcanza):
   ```bash
   git clone -b main https://github.com/Alexisz3/Grupo-1---Hackathon.git escuela-semilla && cd escuela-semilla
   cp .env.example .env
   nano .env                         # pegar AI_URL y AI_TOKEN de la PC
   ./scripts/escuela.sh app --tunnel # verifica que la IA responda, levanta la app y muestra su enlace https
   ```

- La puerta solo deja pasar pedidos con la clave y solo a las tres rutas de IA (`/v1/chat/completions`, `/v1/audio/speech`, `/generate`); todo lo demás responde 401 o 404. No compartas `AI_TOKEN`.
- El enlace del túnel de la PC **cambia cada vez que se reinicia**: verlo con `./scripts/escuela.sh ia-link`, actualizar `AI_URL` en AWS y volver a correr `./scripts/escuela.sh app`.
- La PC tiene que quedar encendida y conectada durante la demo. Si se corta, la app sigue funcionando con los ejercicios clásicos, la voz del navegador y el dibujo del niño en vez de la ilustración.

## Comandos del día a día

| Para | Con el script | Con Docker Compose |
|---|---|---|
| Levantar todo | `./scripts/escuela.sh up` | `docker compose --profile texto --profile voice --profile images up -d --build` |
| Modo dividido: IA en la PC | `./scripts/escuela.sh ia` | ver «Modo dividido» |
| Modo dividido: app en AWS | `./scripts/escuela.sh app --tunnel` | ver «Modo dividido» |
| Ver el estado | `./scripts/escuela.sh status` | `docker compose --profile texto --profile voice --profile images ps` |
| Ver los logs | `./scripts/escuela.sh logs` (o `logs app`) | `docker compose logs -f app` |
| Apagar | `./scripts/escuela.sh down` | `docker compose --profile texto --profile voice --profile images down` |
| Respaldar los datos | `./scripts/escuela.sh backup` | ver «Datos» |
| Restaurar un respaldo | `./scripts/escuela.sh restore archivo.tgz` | ver «Datos» |
| Actualizar el código | `git pull && ./scripts/escuela.sh up` | `git pull` y el comando de levantar |

Opciones de `up`: `--tunnel` (enlace https), `--sin-voz`, `--sin-imagenes` (para computadoras con poca memoria).

`./scripts/escuela.sh bench` mide cuánto tarda una página del cuento, una ilustración y un audio con los modelos configurados.

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

> Si el Learner Lab no deja crear instancias con 16-32 GB de RAM, usar el **modo dividido**: una instancia chica (1-2 GB) con `./scripts/escuela.sh app --tunnel` y la IA en la PC del equipo. Para ver qué tipos permite el lab, en su terminal: `aws ec2 run-instances --dry-run --region us-east-1 --image-id <AMI> --instance-type t3.micro` (responde `DryRunOperation` si está permitido).

1. Crear una instancia **m5.2xlarge** (8 vCPU, 32 GB) con **Ubuntu 24.04** y **40 GB de disco**. En el grupo de seguridad basta SSH (22); con el túnel no hace falta abrir el puerto 3000.
2. Entrar por SSH e instalar Docker:
   ```bash
   curl -fsSL https://get.docker.com | sudo sh
   sudo usermod -aG docker $USER && newgrp docker
   ```
3. Seguir «Levantar en 4 pasos» y usar `./scripts/escuela.sh up --tunnel` para tener el enlace https.
4. Medir con `./scripts/escuela.sh bench` y, si sobra velocidad, probar `OLLAMA_MODEL=gemma4:e4b`.
5. Sin túnel: poner `APP_BIND=0.0.0.0` en `.env`, abrir el puerto 3000 en el grupo de seguridad y entrar por `http://IP-PUBLICA:3000` (sin micrófono, porque no es https).

Costo: la m5.2xlarge cuesta ~0,38 USD por hora; los 50 USD alcanzan para ~130 horas. **Apagar la instancia** cuando no se use. Al detenerla, los volúmenes de Docker quedan en el disco.

## Problemas comunes

| Síntoma | Qué hacer |
|---|---|
| `permission denied … docker.sock` | En Linux: `sudo usermod -aG docker $USER` y volver a iniciar sesión |
| `port is already allocated` (3000) | Cambiar `APP_PORT=3001` en `.env` y volver a levantar |
| El cuento tarda mucho o dice «No pude imaginar la página» | Ollama todavía baja el modelo (`./scripts/escuela.sh logs ollama`) o el modelo es muy grande para la CPU: volver a `gemma3:4b` |
| No hay ilustraciones y se ve el dibujo del niño | El ilustrador todavía baja su modelo: `./scripts/escuela.sh logs painter` |
| No suena la voz | Tocar cualquier parte de la página una vez (el navegador exige un toque antes del primer audio) y revisar `./scripts/escuela.sh status` |
| El contenedor se cierra solo (`exited 137`) | Falta memoria: dar más memoria a Docker o levantar con `--sin-imagenes` |
| Todo lento | Es CPU sin GPU: usar los modelos por defecto y medir con `bench` |

## Desarrollo sin Docker

Requiere Node.js 22.13 o posterior y pnpm.

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm start                 # http://127.0.0.1:3000, lee .env; los datos van a ./data
```

Levantar la voz y el ilustrador con `docker compose --profile voice --profile images up -d voice painter`, tener [Ollama](https://ollama.com/download) instalado en la computadora (`ollama pull gemma3:4b`) y en `.env` descomentar la sección «Solo si se corre sin Docker».
