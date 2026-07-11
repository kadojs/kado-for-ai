'use strict'
let app = null

class App {
  static register (cfg) {
    if (app) return app

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled rejection:', err)
      if (process.env.TEST === 'test') return
      process.exit(211)
    })
    process.on('uncaughtException', (err) => {
      console.error('Uncaught exception:', err)
      if (process.env.TEST === 'test') return
      process.exit(111)
    })

    const Application = require('kado/lib/Application')
    const fs = require('kado/lib/FileSystem')
    const HyperText = require('kado/lib/HyperText')
    const Log = require('kado/lib/Log')
    const Session = require('kado/lib/Session')
    const View = require('kado/lib/View')
    const AppModel = require('./Model')
    const DatabaseUtil = require('./DatabaseUtil')
    const pkg = require('../package.json')

    app = Application.getInstance()
    app.cfg = cfg
    app.setName(pkg.name)
    app.setVersion(pkg.version)
    app.models = new AppModel.ModelManager()
    app.trustProxy = cfg.main.trustProxy || false

    const log = Log.LogEngine.getInstance({ name: cfg.log.name || pkg.name })
    app.log.addEngine('console', log)

    if (cfg.email && cfg.email.enabled) {
      const EmailConsole = require('./EmailConsole')
      app.email.addEngine('email', new EmailConsole(cfg.email))
    }

    if (cfg.database && cfg.database.enabled) {
      const engineName = cfg.database.engine || 'mysql'
      if (engineName === 'sqlite') {
        const DatabaseSQLite = require('./DatabaseSQLite')
        const sqliteEngine = new DatabaseSQLite(cfg.database.sqlite || {})
        app.database.addEngine('sqlite', sqliteEngine)
        app.database.activateEngine('sqlite')
      } else if (engineName === 'mysql') {
        const DatabaseMariaDB = require('./DatabaseMariaDB')
        const mysqlEngine = new DatabaseMariaDB(cfg.database.mysql)
        app.database.addEngine('mysql', mysqlEngine)
        app.database.activateEngine('mysql')
      } else {
        throw new Error(
          `Unknown database.engine "${engineName}". Use "mysql" (default) or ` +
          'explicitly set "sqlite" for small apps.'
        )
      }

      app.models.push(Session.SessionStoreModel)

      app.cli.command('db', 'test', {
        action: () => {
          app.log.info('Database OK.')
          return 0
        },
        description: 'Verify database configuration is loaded'
      })

      app.cli.command('db', 'init', {
        action: async () => {
          await DatabaseUtil.init(app)
          return 0
        },
        description: 'Create tables and seed the default admin user'
      })
    }

    const http = new HyperText.HyperTextServer()
    http.setHost(cfg.main.host)
    http.setPort(cfg.main.port)
    app.http.addEngine('http', http.createServer(app.router))
    app.httpServer = http

    const viewFolder = fs.path.join(__dirname, '..', 'view')
    app.view.addEngine('mustache', new View.ViewMustache(viewFolder))
    app.view.activateEngine('mustache')

    const staticRoot = fs.path.join(__dirname, '..', 'public')
    app.use(HyperText.StaticServer.getMiddleware(staticRoot))

    if (process.env.NODE_ENV !== 'production') {
      app.use(HyperText.logRequest(app))
    }

    app.use((req) => {
      req.locals._appTitle = cfg.appTitle
      req.locals._appVersion = pkg.version
      req.locals._currentYear = new Date().getUTCFullYear()
    })

    if (cfg.session && cfg.session.enabled) {
      app.use(async (req, res) => {
        const db = app.database.getActiveEngine()
        await Session.getMiddleware({
          domain: cfg.main.cookieDomain || undefined,
          secret: cfg.main.cookieSecret,
          store: new Session.SessionStoreSQL({
            db: db,
            model: Session.SessionStoreModel
          })
        })(req, res)

        const user = req.session.get('user')
        req.locals._user = user || null
        req.session.uid = user ? user.id : 0

        if (
          req.url.match(/\/admin\//i) &&
          !req.url.match(/\/admin\/login\/?/i) &&
          !user
        ) {
          res.redirect('/admin/login/')
          return true
        }
      })
    }

    app.router.finalHandler = (req, res) => {
      res.statusCode = 404
      req.locals._pageTitle = 'Not Found'
      res.render('404')
    }

    require('./Main').register(app)
    if (cfg.modules.user.enabled) require('./User').register(app)
    if (cfg.modules.admin.enabled) require('./Admin').register(app)
    if (cfg.modules.page.enabled) require('./Page').register(app)
    if (cfg.modules.post.enabled) require('./Post').register(app)

    app.ensureStart = async function ensureStart () {
      clearTimeout(app.stopRequest)
      if (!app.started) {
        await app.start()
        await app.listen()
      }
      return app
    }

    app.requestStop = function requestStop () {
      app.stopRequest = setTimeout(async () => {
        await app.stop()
      }, 500)
      return app
    }

    return app
  }

  static getInstance () {
    return app
  }

  static reset () {
    app = null
  }
}

module.exports = App
