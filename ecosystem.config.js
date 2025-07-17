module.exports = {
  apps: [
    {
      name: 'blogger-dashboard-backend',
      cwd: 'backend',
      script: 'server.js',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        APP_MODE: 'production'
      }
    },
    {
      name: 'blogger-dashboard-frontend',
      script: 'npm',
      args: 'run preview -- --port 5173',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
