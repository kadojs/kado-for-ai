'use strict'
const Module = require('kado/lib/Module')

class Admin extends Module {
  static register (app) {
    const admin = new Admin(app)
    app.get('/admin/', admin.dashboard.bind(admin))
  }

  constructor (app) {
    super()
    this.app = app
    this.name = this.title = 'Admin'
    this.description = 'Admin dashboard'
    this.app.addModule(this)
  }

  dashboard (req, res) {
    req.locals._pageTitle = 'Admin'
    res.render('admin/dashboard', {
      user: req.session.get('user')
    })
  }
}

module.exports = Admin
