# Deploying nibog-platform with PM2

This guide shows the recommended steps and includes a helper script at `scripts/deploy.sh` that automates the typical deploy flow on a Linux VPS.

## Prerequisites
- Node (18+ recommended, match your local Node LTS)
- pnpm (or npm)
- pm2
- Git
- An `.env` file with required env vars (or `.env.production`)

## Quick manual steps
1. Clone repo: `git clone <repo> /var/www/nibog && cd /var/www/nibog`
2. Copy `.env` or `.env.production` to the server and provide required values (especially `NEXT_PUBLIC_APP_URL`, `BACKEND_URL`, secrets)
3. Install packages: `pnpm install`
4. Build: `pnpm build` (ensure build-time env vars are present)
5. Start with PM2: `pm2 start ecosystem.config.js --env production`
6. Save process list: `pm2 save`
7. Enable startup on boot: run the printed command from `pm2 startup` (e.g., `sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u <user> --hp /home/<user>`)

## Using the helper script
The repo contains `scripts/deploy.sh` to automate common tasks. Usage:

```bash
# run from repo root
chmod +x scripts/deploy.sh
./scripts/deploy.sh [branch] [env-file]
# examples
./scripts/deploy.sh main .env.production
./scripts/deploy.sh staging .env
```

The script does:
- source the provided env file (so build-time env vars are available)
- installs dependencies (`pnpm install`)
- runs `pnpm build`
- starts or reloads PM2 process configured in `ecosystem.config.js`
- runs `pm2 save`

Additionally, there is `scripts/setup-server.sh` to bootstrap a Debian/Ubuntu server with Node, pnpm, pm2 and system libraries required by `puppeteer` and `sharp`:

```bash
# run as root or with sudo on a fresh Ubuntu/Debian VM
sudo chmod +x scripts/setup-server.sh
sudo ./scripts/setup-server.sh
```

Notes:
- Make sure to run `chmod +x scripts/deploy.sh` before using the deploy helper.
- The deploy script performs a local health check against `http://127.0.0.1:<PORT>/` (defaults to port 3112). If your app exposes a specific health route (e.g., `/api/health`), update `scripts/deploy.sh` accordingly.

## Notes & troubleshooting
- If the site behaves differently on VPS than locally, check:
  - Node version mismatch
  - Build-time env vars (NEXT_PUBLIC_*) not set during `pnpm build`
  - Missing native dependencies (e.g., for `sharp` or `puppeteer`)
  - PM2 logs: `pm2 logs nibog-platform --lines 200`
- For SSL and domain routing, front with Nginx and use Certbot for certs.

If you want, I can:
- Add more env placeholders to `ecosystem.config.js` (non-secret defaults), or
- Create a `scripts/setup-server.sh` that installs system deps (Node, pnpm, pm2, fonts) for common VPS setups.

Pick the next step and I'll add it. ✅