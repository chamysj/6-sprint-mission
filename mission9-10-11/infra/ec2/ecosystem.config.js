module.exports = {
  apps: [
    {
      name: 'mission9-10',
      script: 'dist/main.js',
      cwd: '/home/ec2-user/6-sprint-mission/mission9-10',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
