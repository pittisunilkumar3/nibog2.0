#!/usr/bin/env bash
# Deploy helper for nibog-platform
# Usage: ./scripts/deploy.sh [branch] [env-file]
# Example: ./scripts/deploy.sh main .env.production
set -euo pipefail

BRANCH=${1:-main}
ENV_FILE=${2:-.env}
HEALTH_PATH=${3:-/}

# Resolve repository root (script lives in scripts/)
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "[deploy] Deploying branch: $BRANCH, env: $ENV_FILE"

# Pre-flight checks
echo "[deploy] Running pre-flight checks..."

# Check if running on Linux
if [[ ! "$OSTYPE" =~ ^linux ]]; then
  echo "[deploy][warning] This script is designed for Linux. Current OS: $OSTYPE" >&2
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "[deploy][error] Env file '$ENV_FILE' not found. Create it or pass a path to your .env file as 2nd arg." >&2
  exit 2
fi

# Load env vars for build and runtime
# Use shell's sourcing instead of exporting via grep to preserve spacing and quotes
set -o allexport
# shellcheck disable=SC1090
. "$ENV_FILE"
set +o allexport

# Ensure pnpm is installed (must be pre-installed on server)
if ! command -v pnpm >/dev/null 2>&1; then
  echo "[deploy][error] pnpm is not installed. Install pnpm (npm i -g pnpm) and re-run the script." >&2
  exit 3
fi

# Ensure pm2 is installed (must be pre-installed on server)
if ! command -v pm2 >/dev/null 2>&1; then
  echo "[deploy][error] pm2 is not installed. Install pm2 (npm i -g pm2) and re-run the script." >&2
  exit 4
fi

# Make sure logs directory exists
mkdir -p "$REPO_ROOT/logs"

# Fetch latest code and checkout branch
if [ -d .git ]; then
  git fetch --all --prune
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
else
  echo "[deploy] Not a git repo, skipping git pull"
fi

# Install deps and build
echo "[deploy] Installing dependencies..."
# capture full install logs for debugging
pnpm install --prefer-offline 2>&1 | tee -a "$REPO_ROOT/logs/deploy-install.log"
if [ ${PIPESTATUS[0]:-0} -ne 0 ]; then
  echo "[deploy][error] pnpm install failed. See logs: $REPO_ROOT/logs/deploy-install.log" >&2
  exit 10
fi
# Deduplicate packages to avoid multiple React instances (fixes `useContext` null errors)
echo "[deploy] Running pnpm dedupe to avoid duplicate React versions..."
pnpm dedupe 2>&1 | tee -a "$REPO_ROOT/logs/deploy-install.log" || true

# Log pnpm why react for debugging
pnpm why react 2>&1 | tee -a "$REPO_ROOT/logs/deploy-install.log" || true
echo "[deploy] Building project (NEXT_PUBLIC_* envvars must be set before build)..."# ensure clean build
rm -rf .next# capture build logs for debugging
pnpm build 2>&1 | tee -a "$REPO_ROOT/logs/deploy-build.log"
if [ ${PIPESTATUS[0]:-0} -ne 0 ]; then
  echo "[deploy][error] pnpm build failed. See logs: $REPO_ROOT/logs/deploy-build.log" >&2
  exit 11
fi

# Start or reload pm2 process
APP_NAME="nibog-platform"
PORT=${PORT:-3112}

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  echo "[deploy] PM2 process exists — reloading with updated env..."
  pm2 reload "$APP_NAME" --update-env || {
    echo "[deploy][error] Failed to reload process. Attempting restart..."
    pm2 restart "$APP_NAME" --update-env || true
  }
else
  echo "[deploy] Starting PM2 process using ecosystem.config.js (production env)..."
  pm2 start ecosystem.config.js --env production || {
    echo "[deploy][error] Failed to start PM2 process. Check logs with 'pm2 logs $APP_NAME'" >&2
  }
fi

# Persist the process list and ensure startup on boot (prints how to enable if not set)
pm2save_output=$(pm2 save 2>&1 || true)
if echo "$pm2save_output" | grep -q "saved"; then
  echo "[deploy] PM2 process list saved"
else
  echo "[deploy] pm2 save output: $pm2save_output"
fi

# Quick health check (local)
# HEALTH_PATH may be passed as 3rd argument (default: /)
HEALTH_URL="http://127.0.0.1:${PORT}${HEALTH_PATH}"
echo "[deploy] Performing local health check against $HEALTH_URL"
MAX_ATTEMPTS=10
SLEEP_SECS=3
SUCCESS=0
for i in $(seq 1 $MAX_ATTEMPTS); do
  if curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" | grep -q "200"; then
    echo "[deploy] Health check succeeded (200)"
    SUCCESS=1
    break
  else
    echo "[deploy] Health check attempt $i/$MAX_ATTEMPTS failed — retrying in $SLEEP_SECS s"
    sleep $SLEEP_SECS
  fi
done

if [ "$SUCCESS" -ne 1 ]; then
  echo "[deploy][warning] Health check did not return 200 after $((MAX_ATTEMPTS*SLEEP_SECS))s. Check 'pm2 logs $APP_NAME' for details." >&2
fi

# Display access information
SERVER_IP=$(hostname -I | awk '{print $1}' || echo "unknown")
echo ""
echo "========================================"
echo "[deploy] Deployment complete!"
echo "========================================"
echo "Access your website at:"
echo "  - Local:    http://127.0.0.1:${PORT}"
echo "  - Network:  http://${SERVER_IP}:${PORT}"
echo ""
echo "PM2 commands:"
echo "  - View logs:   pm2 logs $APP_NAME"
echo "  - Check status: pm2 list"
echo "  - Restart:     pm2 restart $APP_NAME"
echo "========================================"
echo ""

# Check pm2 startup recommendation
pm2_startup_out=$(pm2 startup 2>&1 || true)
if echo "$pm2_startup_out" | grep -qi "sudo"; then
  echo "[deploy] ⚠️  To enable auto-start on server reboot, run:"
  echo "$pm2_startup_out" | grep "sudo" || true
  echo ""
fi
