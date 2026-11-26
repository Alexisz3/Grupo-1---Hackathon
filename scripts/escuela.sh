#!/usr/bin/env bash
# Escuela Semilla con Docker: levantar, ver estado, logs, respaldo y apagar. Guía: docs/docker.md
#
#   ./scripts/escuela.sh up [--ollama] [--tunnel] [--sin-voz] [--sin-imagenes]
#   ./scripts/escuela.sh status | logs [servicio] | link | backup | restore <archivo.tgz> | down
set -euo pipefail
cd "$(dirname "$0")/.."

say() { printf '\033[1;34m▸ %s\033[0m\n' "$*"; }
fail() { printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

command -v docker >/dev/null || fail 'Falta Docker. Instálalo desde https://docs.docker.com/get-docker/'
docker compose version >/dev/null 2>&1 || fail 'Falta Docker Compose v2 (el comando «docker compose»).'
docker info >/dev/null 2>&1 || fail 'Docker no responde. ¿Está encendido? En Linux: sudo systemctl start docker (y tu usuario en el grupo docker).'

all=(--profile voice --profile images --profile ollama --profile tunnel)
env_value() { grep -E "^$1=" .env 2>/dev/null | tail -1 | cut -d= -f2- || true; }

up() {
  local voice=true images=true ollama=false tunnel=false
  for flag in "$@"; do
    case $flag in
      --ollama) ollama=true ;;
      --tunnel) tunnel=true ;;
      --sin-voz) voice=false ;;
      --sin-imagenes) images=false ;;
      *) fail "Opción desconocida: $flag" ;;
    esac
  done
  local profiles=()
  $voice && profiles+=(--profile voice)
  $images && profiles+=(--profile images)
  $ollama && profiles+=(--profile ollama)
  $tunnel && profiles+=(--profile tunnel)

  if [[ ! -f .env ]]; then
    cp .env.example .env
    say 'Creé .env a partir de .env.example.'
  fi
  if $ollama && [[ $(env_value MODEL_URL) != *ollama* ]]; then
    say 'Uso Ollama para el texto: ajusto MODEL_URL y MODEL_NAME en .env.'
    sed -i.bak -e 's|^MODEL_URL=.*|MODEL_URL=http://ollama:11434/v1/chat/completions|' -e 's|^MODEL_NAME=.*|MODEL_NAME=gemma3:4b|' \
      -e 's|^MODEL_EFFORT=.*|MODEL_EFFORT=|' -e 's|^MODEL_KEY=.*|MODEL_KEY=|' .env && rm -f .env.bak
  fi
  if [[ $(env_value MODEL_URL) == *googleapis* && -z $(env_value MODEL_KEY) ]]; then
    say 'Aviso: falta MODEL_KEY (clave de Gemini) en .env. Sin texto con IA solo funcionan los ejercicios clásicos.'
    say '       Pon tu clave en .env o levanta con --ollama (IA local, sin clave).'
  fi

  say 'Construyendo y levantando (la primera vez baja ~8 GB: voz, ilustrador y modelos; puede tardar)…'
  docker compose "${profiles[@]}" up -d --build
  say 'Esperando a que la app responda…'
  until [[ $(docker inspect -f '{{.State.Health.Status}}' "$(docker compose ps -q app)" 2>/dev/null) == healthy ]]; do sleep 3; done
  local port; port=$(env_value APP_PORT); port=${port:-3000}
  say "Listo: http://127.0.0.1:$port"
  say 'La voz y el ilustrador pueden tardar unos minutos más la primera vez. Revisa con: ./scripts/escuela.sh status'
  if $tunnel; then link; fi
}

link() {
  say 'Buscando el enlace https del túnel…'
  for _ in $(seq 30); do
    local url; url=$(docker compose "${all[@]}" logs tunnel 2>/dev/null | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' | tail -1 || true)
    [[ -n $url ]] && { say "Enlace público (temporal): $url"; return; }
    sleep 2
  done
  fail 'No encontré el enlace. ¿Levantaste con --tunnel?'
}

case ${1:-up} in
  up) shift || true; up "$@" ;;
  status) docker compose "${all[@]}" ps ;;
  logs) docker compose "${all[@]}" logs -f --tail 50 ${2:+"$2"} ;;
  link) link ;;
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
  *) fail "Comando desconocido: $1 (usa up, status, logs, link, backup, restore o down)" ;;
esac
