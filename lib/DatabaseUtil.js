'use strict'
const crypto = require('crypto')
const PromiseMore = require('kado/lib/PromiseMore')

class DatabaseUtil {
  static async init (app, opts = {}) {
    const cfg = app.cfg || {}
    const engineName = (cfg.database && cfg.database.engine) || 'mysql'
    const dbEngine = app.database.getEngine(engineName) || app.database.getActiveEngine()
    const db = dbEngine.getEngine()
    const models = app.models.all()
    let created = 0

    async function initModel (model) {
      if (opts.name && model.name !== opts.name) return
      const query = typeof model.createTable === 'function'
        ? model.createTable(engineName)
        : model.createTable()
      await db.execute(query.toString(), [])
      created++
    }

    try {
      await PromiseMore.series(models, initModel)
      app.log.info(`Table creation complete. Created ${created} model(s).`)
      await DatabaseUtil.seedAdmin(app, dbEngine)
    } catch (e) {
      app.log.error('Database initialization failed: ' + e.message)
      throw e
    }
  }

  static hashPassword (password, secret) {
    return crypto.createHash('sha256')
      .update(String(password) + ':' + String(secret))
      .digest('hex')
  }

  static async seedAdmin (app, dbEngine) {
    const User = require('./User')
    const cfg = app.cfg
    const db = dbEngine
    const existingRv = await User.UserModel.byEmail(cfg.admin.email).execute(db)
    const existing = existingRv[0] || []
    if (existing.length) {
      app.log.info('Admin user already exists, skipping seed.')
      return
    }
    const now = new Date()
    const passwordHash = DatabaseUtil.hashPassword(
      cfg.admin.password,
      cfg.main.cookieSecret
    )
    const insert = User.UserModel.insert([
      'email', 'name', 'passwordHash', 'active', 'createdAt', 'updatedAt'
    ])
    insert.value([
      cfg.admin.email,
      cfg.admin.name,
      passwordHash,
      1,
      now,
      now
    ])
    await insert.execute(db)
    app.log.info(`Seeded admin user ${cfg.admin.email} (password from config.admin)`)
  }
}

module.exports = DatabaseUtil
