'use strict'
// Copy to config.local.js and adjust credentials.
module.exports = {
  main: {
    port: 3000,
    cookieSecret: 'replace-with-a-long-random-string'
  },
  database: {
    engine: 'mysql',
    mysql: {
      driver: 'mysql2',
      host: '127.0.0.1',
      port: 3307,
      user: 'kado',
      password: 'kado',
      database: 'kado_cms'
    }
  },
  admin: {
    email: 'admin@example.com',
    password: 'admin',
    name: 'Admin'
  }
}
