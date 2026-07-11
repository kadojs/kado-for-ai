'use strict'
const Module = require('kado/lib/Module')
const Model = require('kado/lib/Model')
const AppModel = require('./Model')
const { rowsOf } = require('./queryUtil')

const tableName = 'Page'

class PageModel extends AppModel {
  static tableName () { return tableName }

  static fieldList () {
    return {
      id: Model.fieldPrimary(),
      title: Model.fieldString('', false, 255),
      uri: Model.fieldString('', false, 191),
      content: { type: 'LONGTEXT', nullable: false },
      active: Model.fieldBoolean(true),
      createdAt: Model.fieldDate(false, false),
      updatedAt: Model.fieldDate(false)
    }
  }

  static createTable (engineName = 'mysql') {
    const table = AppModel.buildTable(tableName, PageModel.fieldList, engineName)
    table.index('uri_unique', ['uri'], { unique: true })
    return table
  }

  static insert (fields) {
    if (fields === null) {
      fields = Model.filterFields(PageModel.fieldList(), { insert: false })
    }
    return Model.insertQuery(tableName, fields)
  }

  static update (fields) {
    if (fields === null) {
      fields = Model.filterFields(PageModel.fieldList(), { writable: false })
    }
    return Model.updateQuery(tableName, fields)
  }

  static delete () { return Model.deleteQuery(tableName) }

  static byId (id) { return Model.byIdQuery(tableName, id) }

  static byUri (uri) {
    const Query = require('kado/lib/Query')
    return Query.SQL.from(tableName).select().where('uri').value(uri)
  }

  static listActive () {
    const q = Model.listQuery(tableName)
    q.where('active').value(1)
    q.order('title')
    return q
  }

  static listAll () {
    return Model.listQuery(tableName).order('title')
  }
}

class Page extends Module {
  static register (app) {
    const page = new Page(app)
    app.get('/page/:uri/', page.view.bind(page))
    app.get('/admin/page/', page.adminList.bind(page))
    app.get('/admin/page/edit/', page.adminEdit.bind(page))
    app.post('/admin/page/save/', page.adminSave.bind(page))
    app.post('/admin/page/delete/', page.adminDelete.bind(page))
  }

  constructor (app) {
    super()
    this.app = app
    this.name = this.title = 'Page'
    this.description = 'CMS pages'
    this.app.models.push(PageModel)
    this.app.addModule(this)
  }

  async view (req, res) {
    try {
      const db = this.app.database.getActiveEngine()
      const rows = rowsOf(await PageModel.byUri(req.params.uri).execute(db))
      if (!rows.length || !rows[0].active) {
        res.statusCode = 404
        req.locals._pageTitle = 'Not Found'
        res.render('error', { error: 'Page not found' })
        return
      }
      const page = rows[0]
      req.locals._pageTitle = page.title
      res.render('page/view', { page: page })
    } catch (err) {
      res.statusCode = 500
      res.render('error', { error: err.message })
    }
  }

  async adminList (req, res) {
    const db = this.app.database.getActiveEngine()
    const rows = rowsOf(await PageModel.listAll().execute(db))
    req.locals._pageTitle = 'Pages'
    res.render('admin/page-list', { rows: rows })
  }

  async adminEdit (req, res) {
    const id = req.query.get ? req.query.get('id') : (req.query.id || 0)
    let page = {
      id: 0,
      title: '',
      uri: '',
      content: '',
      active: 1
    }
    if (id && id !== '0') {
      const db = this.app.database.getActiveEngine()
      const rows = rowsOf(await PageModel.byId(id).execute(db))
      if (rows.length) page = rows[0]
    }
    req.locals._pageTitle = page.id ? 'Edit Page' : 'New Page'
    res.render('admin/page-edit', { page: page })
  }

  async adminSave (req, res) {
    try {
      const db = this.app.database.getActiveEngine()
      const id = req.body.id || 0
      const data = {
        title: req.body.title || '',
        uri: (req.body.uri || '').replace(/^\/+|\/+$/g, ''),
        content: req.body.content || '',
        active: req.body.active === 'on' || req.body.active === '1' ? 1 : 0
      }
      if (!data.title || !data.uri) throw new Error('Title and URI are required')
      const fields = Object.keys(data)
      const newId = await Model.save(PageModel, db, `${id}`, fields, data)
      req.notify('Page saved.')
      res.redirect('/admin/page/edit/?id=' + (newId || id))
    } catch (err) {
      req.notify(err.message, { level: 'error' })
      res.redirect('/admin/page/')
    }
  }

  async adminDelete (req, res) {
    try {
      const db = this.app.database.getActiveEngine()
      const id = req.body.id
      const q = PageModel.delete()
      q.where('id').value(id)
      await q.execute(db)
      req.notify('Page deleted.', { level: 'error' })
    } catch (err) {
      req.notify(err.message, { level: 'error' })
    }
    res.redirect('/admin/page/')
  }
}

Page.PageModel = PageModel
module.exports = Page
