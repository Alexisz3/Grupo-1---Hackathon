#!/usr/bin/env bash
# Escuela Semilla con Docker: levantar, ver estado, logs, respaldo y apagar. Guía: docs/docker.md
#
# Todo en una máquina:
#   ./scripts/escuela.sh up  [--tunnel] [--sin-voz] [--sin-imagenes]
# Modo dividido (la app en AWS, la IA pesada en la PC del equipo):
#   ./scripts/escuela.sh ia  [--sin-voz] [--sin-imagenes]   ← en la PC: IA + puerta con clave + túnel https
#   ./scripts/escuela.sh app [--tunnel]                     ← en AWS: solo la app (AI_URL y AI_TOKEN en .env)
# Otros:
#   ./scripts/escuela.sh status | logs [servicio] | link | ia-link | bench | backup | restore <archivo.tgz> | down
set -euo pipefail
cd "$(dirname "$0")/.."

say() { printf '\033[1;34m▸ %s\033[0m\n' "$*"; }
fail() { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

command -v docker >/dev/null || fail 'Falta Docker. Instálalo desde https://docs.docker.com/get-docker/'
docker compose version >/dev/null 2>&1 || fail 'Falta Docker Compose v2 (el comando «docker compose»).'
docker info >/dev/null 2>&1 || fail 'Docker no responde. ¿Está encendido? En Linux: sudo systemctl start docker (y tu usuario en el grupo docker).'

all=(--profile texto --profile voice --profile images --profile gateway --profile tunnel)
env_value() { grep -E "^$1=" .env 2>/dev/null | tail -1 | cut -d= -f2- || true; }

ensure_env() {
  [[ -f .env ]] && return
  cp .env.example .env
  say 'Creé .env a partir de .env.example.'
}

# Perfiles y servicios de IA según --sin-voz y --sin-imagenes; las demás opciones quedan en «rest»
ai_profiles() {
  profiles=(--profile texto) services=(ollama) rest=()
  local voice=true images=true
  for flag in "$@"; do
    case $flag in
      --sin-voz) voice=false ;;
      --sin-imagenes) images=false ;;
      *) rest+=("$flag") ;;
    esac
  done
  if $voice; then profiles+=(--profile voice) services+=(voice); fi
  if $images; then profiles+=(--profile images) services+=(painter); fi
  return 0
}

wait_app() {
  say 'Esperando a que la app responda…'
  until [[ $(docker inspect -f '{{.State.Health.Status}}' "$(docker compose ps -q app)" 2>/dev/null) == healthy ]]; do sleep 3; done
  local port; port=$(env_value APP_PORT)
  say "Listo: http://127.0.0.1:${port:-3000}"
}

# Busca el enlace https de un túnel (tunnel = la app, ai-tunnel = la IA)
tunnel_url() {
  for _ in $(seq 30); do
    local url; url=$(docker compose "${all[@]}" logs "$1" 2>/dev/null | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -1 || true)
    [[ -n $url ]] && { echo "$url"; return; }
    sleep 2
  done
  return 1
}

link() {
  say 'Buscando el enlace https de la app…'
  local url; url=$(tunnel_url tunnel) || fail 'No encontré el enlace. ¿Levantaste con --tunnel?'
  say "Enlace público de la app (temporal): $url"
}

# Todo en una máquina: app + texto + voz + ilustraciones
up() {
  ensure_env
  [[ -z $(env_value AI_URL) ]] || fail 'En .env hay AI_URL (modo dividido). En AWS usa «./scripts/escuela.sh app»; para todo en una máquina, borra AI_URL.'
  ai_profiles "$@"
  local tunnel=false
  for flag in "${rest[@]}"; do if [[ $flag == --tunnel ]]; then tunnel=true; else fail "Opción desconocida: $flag"; fi; done
  if $tunnel; then profiles+=(--profile tunnel) services+=(tunnel); fi
  say "Modelo de texto: $(env_value OLLAMA_MODEL || true). Construyendo y levantando (la primera vez baja ~12 GB; puede tardar)…"
  docker compose "${profiles[@]}" up -d --build app "${services[@]}"
  wait_app
  say 'La IA (Ollama), la voz y el ilustrador tardan unos minutos más la primera vez. Revisa con: ./scripts/escuela.sh status'
  if $tunnel; then link; fi
}

# Modo dividido, en la PC: la IA pesada detrás de una puerta con clave, publicada por un túnel https
ia() {
  ensure_env
  ai_profiles "$@"
  (( ${#rest[@]} == 0 )) || fail "Opción desconocida: ${rest[0]}"
  if [[ -z $(env_value AI_TOKEN) ]]; then
    printf 'AI_TOKEN=%s\n' "$(head -c 24 /dev/urandom | od -An -tx1 | tr -d ' \n')" >> .env
    say 'Creé una clave nueva (AI_TOKEN) en .env.'
  fi
  say "Levantando la IA ($(env_value OLLAMA_MODEL || true)), la puerta con clave y el túnel (la primera vez baja ~12 GB)…"
  docker compose "${profiles[@]}" --profile gateway up -d --build "${services[@]}" gateway ai-tunnel
  local url; url=$(tunnel_url ai-tunnel) || fail 'No encontré el enlace del túnel de la IA: ./scripts/escuela.sh logs ai-tunnel'
  say 'IA lista. En el .env de la app en AWS pon estas dos líneas y corre «./scripts/escuela.sh app»:'
  printf '\n  AI_URL=%s\n  AI_TOKEN=%s\n\n' "$url" "$(env_value AI_TOKEN)"
  say 'El enlace cambia cada vez que se reinicia el túnel: verlo de nuevo con «./scripts/escuela.sh ia-link». No compartas la clave.'
}

ia_link() {
  local url; url=$(tunnel_url ai-tunnel) || fail 'No hay túnel de la IA. ¿Corriste «./scripts/escuela.sh ia»?'
  printf 'AI_URL=%s\nAI_TOKEN=%s\n' "$url" "$(env_value AI_TOKEN)"
}

# Modo dividido, en AWS: solo la app, que le pide la IA a la PC por AI_URL con la clave AI_TOKEN
app() {
  ensure_env
  local ai token; ai=$(env_value AI_URL); token=$(env_value AI_TOKEN)
  [[ -n $ai && -n $token ]] || fail 'Faltan AI_URL y AI_TOKEN en .env (los muestra «./scripts/escuela.sh ia» en la PC).'
  local tunnel=false
  for flag in "$@"; do if [[ $flag == --tunnel ]]; then tunnel=true; else fail "Opción desconocida: $flag"; fi; done
  local code; code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$ai/v1/audio/speech" -H "Authorization: Bearer $token" \
    -H 'Content-Type: application/json' -d '{"model":"kokoro","input":"Hola","voice":"ef_dora","lang_code":"e","response_format":"mp3"}' || true)
  case $code in
    200) say "La IA de la PC responde en $ai." ;;
    401) fail 'La IA rechazó la clave: revisa AI_TOKEN.' ;;
    *) say "Aviso: la IA de la PC no respondió bien (código $code). Revisa que «./scripts/escuela.sh ia» siga corriendo y que AI_URL sea el enlace actual." ;;
  esac
  say 'Construyendo y levantando la app…'
  if $tunnel; then docker compose --profile tunnel up -d --build app tunnel; else docker compose up -d --build app; fi
  wait_app
  if $tunnel; then link; fi
}

# Mide cuánto tarda una página del cuento, una ilustración y un audio con los modelos configurados
bench() {
  local port; port=$(env_value APP_PORT); port=${port:-3000}
  local url="http://127.0.0.1:$port" story='{"hero":{"look":"un gato naranja con bufanda azul"},"pages":[]}'
  say "Texto ($(env_value OLLAMA_MODEL || true)): 3 páginas…"
  for n in 1 2 3; do curl -s -o /dev/null -w "  página $n: %{http_code} en %{time_total} s\n" -X POST "$url/api/story" -H 'Content-Type: application/json' -d "$story"; done
  say "Ilustración ($(env_value PAINTER_MODEL || true)):"
  curl -s -o /dev/null -w '  imagen: %{http_code} en %{time_total} s\n' -X POST "$url/api/picture" -H 'Content-Type: application/json' -d '{"prompt":"an orange kitten with a blue scarf in a sunny meadow","seed":1}'
  say 'Voz:'
  curl -s -o /dev/null -w '  audio: %{http_code} en %{time_total} s\n' -X POST "$url/api/speak" -H 'Content-Type: application/json' -d '{"text":"Había una vez un gatito naranja."}'
  say 'La primera página tarda más porque carga el modelo. Para jugar en vivo conviene que una página tarde menos de ~10 s.'
}

case ${1:-up} in
  up) shift || true; up "$@" ;;
  ia) shift; ia "$@" ;;
  app) shift; app "$@" ;;
  status) docker compose "${all[@]}" ps ;;
  logs) docker compose "${all[@]}" logs -f --tail 50 ${2:+"$2"} ;;
  link) link ;;
  ia-link) ia_link ;;
  bench) bench ;;
  backup)
    file="respaldo-escuela-$(date +%Y%m%d-%H%M).tgz"
    docker run --rm --user "$(id -u):$(id -g)" -v escuela-semilla_data:/data:ro -v "$PWD":/backup alpine tar czf "/backup/$file" -C /data .
    say "Respaldo de la base y las ilustraciones: $file" ;;
  restore)
    [[ -f ${2:-} ]] || fail 'Uso: ./scripts/escuela.sh restore respaldo-escuela-AAAAMMDD-HHMM.tgz'
    docker compose stop app
    docker run --rm -v escuela-semilla_data:/data -v "$(cd "$(dirname "$2")" && pwd)":/backup alpine sh -c "rm -rf /data/* && tar xzf /backup/$(basename "$2") -C /data"
    docker compose start app
    say 'Respaldo restaurado.' ;;
  down) docker compose "${all[@]}" down; say 'Apagado. Los datos y modelos siguen en los volúmenes de Docker.' ;;
  *) fail "Comando desconocido: $1 (usa up, ia, app, status, logs, link, ia-link, bench, backup, restore o down)" ;;
esac
