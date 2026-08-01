#!/usr/bin/env bash
#
# Обновление education-portal на сервере.
#
#   ./scripts/deploy.sh [флаги]
#
# Обновляет чекаут до origin/master, ставит зависимости, собирает, применяет
# миграции, перезапускает systemd-юнит и проверяет /api/health.
#
# Автоотката НЕТ: при провале скрипт останавливается, пишет причину в лог и
# выходит с кодом 1. Что делать дальше — решает оператор (см. README).
#
# Флаги:
#   --dry-run           показать, какие коммиты приедут, и выйти до изменений
#   --fresh-deps        принудительно выполнить npm ci
#   --skip-migrations   не запускать npm run db:migrate
#   -h, --help          эта справка
#
# Настройки — переменные окружения или файл <APP_DIR>/.deploy.env
# (образец: deploy/deploy.env.example).

set -euo pipefail

# --------------------------------------------------------------------------
# Перезапуск из копии.
#
# Скрипт делает `git reset --hard` на файл, который сам в этот момент
# исполняется. Bash читает скрипт лениво, по смещению в файле, поэтому подмена
# посреди выполнения приводит к исполнению мусора. Работаем с копией в /tmp.
# --------------------------------------------------------------------------
if [[ "${DEPLOY_REEXEC:-}" != "1" ]]; then
  _self="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
  _copy="$(mktemp "${TMPDIR:-/tmp}/education-portal-deploy.XXXXXX")"
  cat "$_self" >"$_copy"
  export DEPLOY_REEXEC=1
  export DEPLOY_SELF="$_self"
  export DEPLOY_SELF_COPY="$_copy"
  exec bash "$_copy" "$@"
fi
trap 'rm -f "${DEPLOY_SELF_COPY:-}"' EXIT

# --------------------------------------------------------------------------
# Конфигурация
# --------------------------------------------------------------------------
APP_DIR="${APP_DIR:-$(cd "$(dirname "$DEPLOY_SELF")/.." && pwd)}"

# shellcheck source=/dev/null
[[ -f "$APP_DIR/.deploy.env" ]] && . "$APP_DIR/.deploy.env"

BRANCH="${BRANCH:-master}"
REMOTE="${REMOTE:-origin}"
UNIT="${UNIT:-education-portal}"
ENV_FILE="${ENV_FILE:-$APP_DIR/.env}"
STATE_DIR="${STATE_DIR:-$APP_DIR/.deploy}"
LOG_DIR="${LOG_DIR:-$STATE_DIR/logs}"

APP_PORT="${APP_PORT:-3000}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:$APP_PORT/api/health}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-90}"
MIN_FREE_GB="${MIN_FREE_GB:-4}"

# Для user-юнита задайте в .deploy.env:
#   SYSTEMCTL_CMD="systemctl --user"
#   SYSTEMCTL_RO_CMD="systemctl --user"
#   JOURNALCTL_CMD="journalctl --user"
SYSTEMCTL_CMD="${SYSTEMCTL_CMD:-sudo systemctl}"
SYSTEMCTL_RO_CMD="${SYSTEMCTL_RO_CMD:-systemctl}"
JOURNALCTL_CMD="${JOURNALCTL_CMD:-sudo journalctl}"

read -ra SYSTEMCTL <<<"$SYSTEMCTL_CMD"
read -ra SYSTEMCTL_RO <<<"$SYSTEMCTL_RO_CMD"
read -ra JOURNALCTL <<<"$JOURNALCTL_CMD"

DRY_RUN=0
FRESH_DEPS=0
SKIP_MIGRATIONS=0

# --------------------------------------------------------------------------
# Вывод
# --------------------------------------------------------------------------
ts()   { date -u +%Y-%m-%dT%H:%M:%SZ; }
log()  { printf '[%s] %s\n' "$(ts)" "$*"; }
warn() { printf '[%s] ВНИМАНИЕ  %s\n' "$(ts)" "$*" >&2; }
die()  { printf '[%s] ОШИБКА    %s\n' "$(ts)" "$*" >&2; exit 1; }
usage() { sed -n '3,20p' "$DEPLOY_SELF" | sed 's/^# \{0,1\}//'; }

# Значение переменной из .env без исполнения файла.
env_value() {
  sed -n "s/^[[:space:]]*$1[[:space:]]*=[[:space:]]*//p" "$ENV_FILE" 2>/dev/null |
    tail -n1 |
    sed -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'$/\1/" -e 's/[[:space:]]*$//'
}

# --------------------------------------------------------------------------
# Шаги
# --------------------------------------------------------------------------
preflight() {
  log "Проверка окружения…"

  local cmd
  for cmd in git npm node curl flock sed awk df; do
    command -v "$cmd" >/dev/null || die "не найдена команда: $cmd"
  done

  [[ -d "$APP_DIR/.git" ]] || die "$APP_DIR не является git-репозиторием"
  [[ -f "$ENV_FILE" ]] || die "нет файла окружения $ENV_FILE"

  local database_url session_secret
  database_url="$(env_value DATABASE_URL)"
  session_secret="$(env_value SESSION_SECRET)"
  [[ -n "$database_url" ]] || die "DATABASE_URL пуст в $ENV_FILE"
  [[ -n "$session_secret" ]] || die "SESSION_SECRET пуст в $ENV_FILE"
  [[ "$session_secret" != "change-me" ]] ||
    die "SESSION_SECRET всё ещё равен заглушке из .env.example"
  ((${#session_secret} >= 32)) ||
    die "SESSION_SECRET длиной ${#session_secret} символов, нужно >= 32 (openssl rand -base64 32)"

  "${SYSTEMCTL_RO[@]}" cat "$UNIT" >/dev/null 2>&1 ||
    die "systemd-юнит '$UNIT' не найден (переопределите UNIT в .deploy.env)"

  local free_gb
  free_gb="$(df -P -k "$APP_DIR" | awk 'NR==2 {print int($4/1024/1024)}')"
  ((free_gb >= MIN_FREE_GB)) ||
    die "свободно ${free_gb} ГБ в $APP_DIR, нужно не меньше ${MIN_FREE_GB} ГБ"

  log "Проверка пройдена (свободно ${free_gb} ГБ)"
}

update_source() {
  log "Забираю $REMOTE/$BRANCH…"
  git -C "$APP_DIR" fetch --prune "$REMOTE" "$BRANCH"

  CURRENT_SHA="$(git -C "$APP_DIR" rev-parse HEAD)"
  TARGET_SHA="$(git -C "$APP_DIR" rev-parse --verify "$REMOTE/$BRANCH^{commit}")"

  if [[ "$CURRENT_SHA" == "$TARGET_SHA" ]]; then
    log "Новых коммитов нет, HEAD уже на ${TARGET_SHA:0:12}"
  else
    log "Приедут коммиты ${CURRENT_SHA:0:12} -> ${TARGET_SHA:0:12}:"
    git -C "$APP_DIR" --no-pager log --oneline --no-decorate \
      "$CURRENT_SHA..$TARGET_SHA" | sed 's/^/    /'
  fi

  ((DRY_RUN)) && { log "--dry-run: останавливаюсь до изменений"; exit 0; }

  LOCK_BEFORE="$(sha256sum "$APP_DIR/package-lock.json" 2>/dev/null | cut -d' ' -f1 || true)"

  # Никакого `git clean`, и тем более `git clean -x`: в дереве лежат
  # незакоммиченные видео (src/videos ~1.5 ГБ, public/videos ~300 МБ).
  git -C "$APP_DIR" checkout -q -f -B "$BRANCH" "$TARGET_SHA"
  git -C "$APP_DIR" reset --hard -q "$TARGET_SHA"
  log "Чекаут на ${TARGET_SHA:0:12}"
}

install_deps() {
  local lock_after=""
  [[ -f "$APP_DIR/package-lock.json" ]] &&
    lock_after="$(sha256sum "$APP_DIR/package-lock.json" | cut -d' ' -f1)"

  if [[ -z "$lock_after" ]]; then
    warn "package-lock.json отсутствует — ставлю через npm install (сборка невоспроизводима)"
    (cd "$APP_DIR" && npm install --no-audit --no-fund)
    return
  fi

  if ((FRESH_DEPS)) || [[ ! -d "$APP_DIR/node_modules" ]] || [[ "$LOCK_BEFORE" != "$lock_after" ]]; then
    log "Устанавливаю зависимости (npm ci)…"
    # Без --omit=dev: db:migrate использует drizzle-kit и tsx из devDependencies.
    (cd "$APP_DIR" && npm ci --no-audit --no-fund)
  else
    log "package-lock.json не изменился — пропускаю установку зависимостей"
  fi
}

build_app() {
  log "Сборка (npm run build)…"
  (cd "$APP_DIR" && NODE_ENV=production npm run build)
}

run_migrations() {
  if ((SKIP_MIGRATIONS)); then
    warn "--skip-migrations: миграции пропущены"
    return
  fi
  log "Применяю миграции (npm run db:migrate)…"
  (cd "$APP_DIR" && npm run db:migrate)
}

restart_app() {
  log "Перезапуск юнита $UNIT…"
  "${SYSTEMCTL[@]}" restart "$UNIT"
}

check_health() {
  log "Проверяю $HEALTH_URL (таймаут ${HEALTH_TIMEOUT} с)…"
  local deadline=$((SECONDS + HEALTH_TIMEOUT))
  while ((SECONDS < deadline)); do
    if ! "${SYSTEMCTL_RO[@]}" is-active --quiet "$UNIT"; then
      dump_logs
      die "юнит $UNIT не запущен"
    fi
    if curl -fsS --max-time 5 "$HEALTH_URL" >/dev/null 2>&1; then
      log "Приложение отвечает"
      return
    fi
    sleep 2
  done
  dump_logs
  die "приложение не ответило за ${HEALTH_TIMEOUT} с"
}

dump_logs() {
  warn "---- последние 50 строк журнала $UNIT ----"
  "${JOURNALCTL[@]}" -u "$UNIT" -n 50 --no-pager 2>&1 | sed 's/^/    /' >&2 || true
}

# --------------------------------------------------------------------------
main() {
  while (($#)); do
    case "$1" in
      --dry-run)         DRY_RUN=1 ;;
      --fresh-deps)      FRESH_DEPS=1 ;;
      --skip-migrations) SKIP_MIGRATIONS=1 ;;
      -h|--help)         usage; exit 0 ;;
      *)                 die "неизвестный флаг: $1 (см. --help)" ;;
    esac
    shift
  done

  mkdir -p "$LOG_DIR"
  local run_ts log_file
  run_ts="$(date -u +%Y%m%dT%H%M%SZ)"
  log_file="$LOG_DIR/deploy-$run_ts.log"
  exec > >(tee -a "$log_file") 2>&1

  exec 9>"$STATE_DIR/deploy.lock"
  flock -n 9 || die "другое обновление уже выполняется"

  log "=== Обновление начато, лог: $log_file ==="
  preflight
  update_source
  install_deps
  build_app
  run_migrations
  restart_app
  check_health

  printf '%s\t%s\t%s\n' "$(ts)" "${CURRENT_SHA:0:12}" "${TARGET_SHA:0:12}" \
    >>"$STATE_DIR/history.log"
  log "=== Готово: ${CURRENT_SHA:0:12} -> ${TARGET_SHA:0:12} ==="
}

main "$@"
