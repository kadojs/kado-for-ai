'use strict'
const cfg = require('./config')
const Cluster = require('kado/lib/Cluster')
const cluster = Cluster.getInstance()
const isCli = process.argv.length > 2

async function boot () {
  const App = require('./lib/App')
  const app = App.register(cfg)
  if (isCli) {
    await app.start(process.argv)
    return
  }
  await app.start()
  await app.listen()
  const host = cfg.main.host || 'localhost'
  console.log(`Kado CMS listening on http://${host}:${cfg.main.port}`)
}

if (require.main === module) {
  if (!isCli && cluster.isMaster()) {
    process.title = 'kado-cms:master'
    cluster.start()
  } else {
    process.title = isCli ? 'kado-cms:cli' : 'kado-cms:worker'
    boot().catch((err) => {
      console.error('Startup failed:', err)
      process.exit(1)
    })
  }
}

module.exports = { boot }
