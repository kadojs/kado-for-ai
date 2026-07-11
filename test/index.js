'use strict'
process.env.TEST = 'test'

const runner = require('kado/lib/TestRunner').getInstance('KadoCMS')
const focus = new RegExp((process.env.FOCUS || '.') + '', 'i')
const suites = [
  'Model',
  'Main',
  'Page',
  'Post',
  'Admin',
  'User'
]
const runnable = suites.filter((name) => name.search(focus) > -1)
for (const name of runnable) require(`./${name}.test.js`)

async function ensureTestDatabase (cfg) {
  const mysql = require('mysql2/promise')
  // Prefer root from docker-compose to create the test DB, then app uses kado.
  const admin = await mysql.createConnection({
    host: cfg.database.mysql.host,
    port: cfg.database.mysql.port,
    user: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD || 'kado'
  })
  const dbName = cfg.database.mysql.database
  const appUser = cfg.database.mysql.user
  await admin.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4`
  )
  await admin.query(
    `GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO '${appUser}'@'%'`
  )
  await admin.query('FLUSH PRIVILEGES')
  await admin.end()
}

async function resetSchema (app) {
  const db = app.database.getActiveEngine().getEngine()
  const tables = ['Post', 'Page', 'User', 'Session']
  for (const table of tables) {
    await db.execute(`DROP TABLE IF EXISTS \`${table}\``)
  }
  const DatabaseUtil = require('../lib/DatabaseUtil')
  await DatabaseUtil.init(app)
}

async function runTests () {
  const cfg = require('../config')
  await ensureTestDatabase(cfg)
  const App = require('../lib/App')
  App.reset()
  const app = App.register(cfg)
  await app.start()
  await resetSchema(app)
  await app.listen()
  const rc = await runner.execute()
  try {
    await app.stop()
  } catch (err) {
    // ignore stop races after listen
  }
  // Allow pending session writes to fail quietly after DB close, then exit.
  setTimeout(() => process.exit(rc), 50)
}

runTests().catch((err) => {
  console.error(err)
  process.exit(1)
})
