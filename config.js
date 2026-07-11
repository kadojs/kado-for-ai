'use strict'
const fs = require('kado/lib/FileSystem')
const Mapper = require('kado/lib/Mapper')

const cfg = {
  appTitle: 'Kado CMS',
  main: {
    host: null,
    port: 3000,
    cookieDomain: null,
    cookieSecret: 'change-me-in-production',
    trustProxy: false
  },
  database: {
    enabled: true,
    // Default: MariaDB via Kado Database.MySQL. Set engine to 'sqlite' only
    // for small/prototype apps (see config.sqlite.example.js).
    engine: 'mysql',
    mysql: {
      driver: 'mysql2',
      host: '127.0.0.1',
      port: 3307,
      user: 'kado',
      password: 'kado',
      database: 'kado_cms'
    },
    sqlite: {
      file: './data/kado-cms.db'
    }
  },
  session: {
    enabled: true
  },
  email: {
    enabled: true
  },
  log: {
    name: 'kado-cms'
  },
  admin: {
    email: 'admin@example.com',
    password: 'admin',
    name: 'Admin'
  },
  modules: {
    admin: { enabled: true },
    page: { enabled: true },
    post: { enabled: true },
    user: { enabled: true }
  }
}

const testConfigFile = fs.path.resolve(__dirname, 'test', 'config.test.js')
if (process.env.TEST === 'test' && fs.exists(testConfigFile)) {
  Mapper.mergeObject(cfg, require(testConfigFile))
}

const localConfigFile = fs.path.resolve(__dirname, 'config.local.js')
if (fs.exists(localConfigFile)) {
  Mapper.mergeObject(cfg, require(localConfigFile))
}

module.exports = cfg
