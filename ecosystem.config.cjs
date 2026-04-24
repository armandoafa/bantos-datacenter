module.exports = {
  apps: [
    {
      name: 'bantos-api',
      script: './src/index.js',
      cwd: './server',
      env: {
        NODE_ENV: 'development',
        PORT: 4000
      }
    },
    {
      name: 'bantos-client',
      script: 'npm',
      args: 'run dev',
      cwd: './client',
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
