'use strict'
module.exports = {
  main: {
    port: 3099,
    cookieSecret: 'test-secret-kado-cms'
  },
  database: {
    engine: 'mysql',
    mysql: {
      driver: 'mysql2',
      host: '127.0.0.1',
      port: 3307,
      user: 'kado',
      password: 'kado',
      database: 'kado_cms_test'
    }
  },
  admin: {
    email: 'admin@example.com',
    password: 'admin',
    name: 'Admin'
  }
}
