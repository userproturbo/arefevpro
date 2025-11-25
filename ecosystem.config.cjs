module.exports = {
  apps: [
    {
      name: "mycrazylife_app",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      cwd: "/var/www/mycrazylife_app",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: 3000
      },
      max_memory_restart: "300M",
      instances: 1,
      autorestart: true
    }
  ]
}
