'use strict'
const crypto = require('crypto')
const Module = require('kado/lib/Module')
const Model = require('kado/lib/Model')
const AppModel = require('./Model')
const DatabaseUtil = require('./DatabaseUtil')
const { rowsOf } = require('./queryUtil')

const tableName = 'User'

class UserModel extends AppModel {
  static tableName () { return tableName }

  static fieldList () {
    return {
      id: Model.fieldPrimary(),
      email: Model.fieldString('', false, 191),
      name: Model.fieldString('', false, 191),
      passwordHash: Model.fieldString('', false, 128),
      active: Model.fieldBoolean(true),
      createdAt: Model.fieldDate(false, false),
      updatedAt: Model.fieldDate(false)
    }
  }

  static createTable (engineName = 'mysql') {
    const table = AppModel.buildTable(tableName, UserModel.fieldList, engineName)
    table.index('email_unique', ['email'], { unique: true })
    return table
  }

  static insert (fields) {
    if (fields === null) {
      fields = Model.filterFields(UserModel.fieldList(), { insert: false })
    }
    return Model.insertQuery(tableName, fields)
  }

  static byEmail (email) {
    const Query = require('kado/lib/Query')
    return Query.SQL.from(tableName).select().where('email').value(email)
  }

  static byId (id) {
    return Model.byIdQuery(tableName, id)
  }

  static verifyPassword (user, password, secret) {
    const hash = DatabaseUtil.hashPassword(password, secret)
    const a = Buffer.from(hash, 'utf8')
    const b = Buffer.from(String(user.passwordHash || ''), 'utf8')
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  }
}

class User extends Module {
  static register (app) {
    const user = new User(app)
    app.get('/admin/login/', user.loginForm.bind(user))
    app.post('/admin/login/', user.loginSubmit.bind(user))
    app.get('/admin/logout/', user.logout.bind(user))
  }

  constructor (app) {
    super()
    this.app = app
    this.name = this.title = 'User'
    this.description = 'Staff authentication'
    this.app.models.push(UserModel)
    this.app.addModule(this)
  }

  loginForm (req, res) {
    if (req.session.get('user')) {
      res.redirect('/admin/')
      return
    }
    req.locals._pageTitle = 'Admin Login'
    res.render('admin/login', {})
  }

  async loginSubmit (req, res) {
    try {
      const email = (req.body.email || '').trim()
      const password = req.body.password || ''
      const db = this.app.database.getActiveEngine()
      const rows = rowsOf(await UserModel.byEmail(email).execute(db))
      if (!rows.length) {
        throw new Error('Invalid email or password')
      }
      const row = rows[0]
      if (!row.active) throw new Error('Account disabled')
      const ok = UserModel.verifyPassword(
        row,
        password,
        this.app.cfg.main.cookieSecret
      )
      if (!ok) throw new Error('Invalid email or password')
      const safe = {
        id: row.id,
        email: row.email,
        name: row.name
      }
      await req.session.set('user', safe)
      req.notify('Welcome back.')
      res.redirect('/admin/')
    } catch (err) {
      req.notify(err.message, { level: 'error' })
      res.redirect('/admin/login/')
    }
  }

  async logout (req, res) {
    await req.session.set('user', null)
    req.notify('Logged out.')
    res.redirect('/admin/login/')
  }
}

User.UserModel = UserModel
module.exports = User
