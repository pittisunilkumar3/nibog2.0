module.exports = {
  apps: [
    {
      name: 'nibog-platform',
      script: 'node_modules/next/dist/bin/next',
      // use the same port as `package.json` start script (3112) for consistency
      args: 'start -p 3112 -H 0.0.0.0',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3112,
      },
      // Read sensitive values from process.env at runtime. Do NOT commit secrets here.
      env_production: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: process.env.PORT || 3112,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://www.nibog.in',
        BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3004',
        WHATSAPP_NOTIFICATIONS_ENABLED: process.env.WHATSAPP_NOTIFICATIONS_ENABLED || 'false',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};
