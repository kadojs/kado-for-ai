'use strict'
const Module = require('kado/lib/Module')
const Model = require('kado/lib/Model')
const AppModel = require('./Model')
const { rowsOf } = require('./queryUtil')

const tableName = 'Post'

class PostModel extends AppModel {
  static tableName () { return tableName }

  static fieldList () {
    return {
      id: Model.fieldPrimary(),
      title: Model.fieldString('', false, 255),
      uri: Model.fieldString('', false, 191),
      summary: Model.fieldText('', true),
      content: { type: 'LONGTEXT', nullable: false },
      active: Model.fieldBoolean(true),
      createdAt: Model.fieldDate(false, false),
      updatedAt: Model.fieldDate(false)
    }
  }

  static createTable (engineName = 'mysql') {
    const table = AppModel.buildTable(tableName, PostModel.fieldList, engineName)
    table.index('uri_unique', ['uri'], { unique: true })
    return table
  }

  static insert (fields) {
    if (fields === null) {
      fields = Model.filterFields(PostModel.fieldList(), { insert: false })
    }
    return Model.insertQuery(tableName, fields)
  }

  static update (fields) {
    if (fields === null) {
      fields = Model.filterFields(PostModel.fieldList(), { writable: false })
    }
    return Model.updateQuery(tableName, fields)
  }

  static delete () { return Model.deleteQuery(tableName) }

  static byId (id) { return Model.byIdQuery(tableName, id) }

  static byUri (uri) {
    const Query = require('kado/lib/Query')
    return Query.SQL.from(tableName).select().where('uri').value(uri)
  }

  static recentList (limit = 10) {
    const q = Model.listQuery(tableName)
    q.where('active').value(1)
    q.order('createdAt', 'DESC')
    q.limit(limit)
    return q
  }

  static listAll () {
    return Model.listQuery(tableName).order('createdAt', 'DESC')
  }
}

class Post extends Module {
  static register (app) {
    const post = new Post(app)
    app.get('/post/', post.list.bind(post))
    app.get('/post/:uri/', post.view.bind(post))
    app.get('/api/posts', post.apiList.bind(post))
    app.get('/admin/post/', post.adminList.bind(post))
    app.get('/admin/post/edit/', post.adminEdit.bind(post))
    app.post('/admin/post/save/', post.adminSave.bind(post))
    app.post('/admin/post/delete/', post.adminDelete.bind(post))
  }

  constructor (app) {
    super()
    this.app = app
    this.name = this.title = 'Post'
    this.description = 'Blog posts'
    this.app.models.push(PostModel)
    this.app.addModule(this)
  }

  async list (req, res) {
    const db = this.app.database.getActiveEngine()
    const rows = rowsOf(await PostModel.recentList(50).execute(db))
    req.locals._pageTitle = 'Posts'
    res.render('post/list', { posts: rows })
  }

  async view (req, res) {
    try {
      const db = this.app.database.getActiveEngine()
      const rows = rowsOf(await PostModel.byUri(req.params.uri).execute(db))
      if (!rows.length || !rows[0].active) {
        res.statusCode = 404
        res.render('error', { error: 'Post not found' })
        return
      }
      const post = rows[0]
      req.locals._pageTitle = post.title
      res.render('post/view', { post: post })
    } catch (err) {
      res.statusCode = 500
      res.render('error', { error: err.message })
    }
  }

  async apiList (req, res) {
    const db = this.app.database.getActiveEngine()
    const rows = rowsOf(await PostModel.recentList(50).execute(db))
    const list = rows.map((p) => ({
      id: p.id,
      title: p.title,
      uri: p.uri,
      summary: p.summary
    }))
    res.json({ posts: list })
  }

  async adminList (req, res) {
    const db = this.app.database.getActiveEngine()
    const rows = rowsOf(await PostModel.listAll().execute(db))
    req.locals._pageTitle = 'Posts'
    res.render('admin/post-list', { rows: rows })
  }

  async adminEdit (req, res) {
    const id = req.query.get ? req.query.get('id') : (req.query.id || 0)
    let post = {
      id: 0,
      title: '',
      uri: '',
      summary: '',
      content: '',
      active: 1
    }
    if (id && id !== '0') {
      const db = this.app.database.getActiveEngine()
      const rows = rowsOf(await PostModel.byId(id).execute(db))
      if (rows.length) post = rows[0]
    }
    req.locals._pageTitle = post.id ? 'Edit Post' : 'New Post'
    res.render('admin/post-edit', { post: post })
  }

  async adminSave (req, res) {
    try {
      const db = this.app.database.getActiveEngine()
      const id = req.body.id || 0
      const data = {
        title: req.body.title || '',
        uri: (req.body.uri || '').replace(/^\/+|\/+$/g, ''),
        summary: req.body.summary || '',
        content: req.body.content || '',
        active: req.body.active === 'on' || req.body.active === '1' ? 1 : 0
      }
      if (!data.title || !data.uri) throw new Error('Title and URI are required')
      const fields = Object.keys(data)
      const newId = await Model.save(PostModel, db, `${id}`, fields, data)
      req.notify('Post saved.')
      res.redirect('/admin/post/edit/?id=' + (newId || id))
    } catch (err) {
      req.notify(err.message, { level: 'error' })
      res.redirect('/admin/post/')
    }
  }

  async adminDelete (req, res) {
    try {
      const db = this.app.database.getActiveEngine()
      const id = req.body.id
      const q = PostModel.delete()
      q.where('id').value(id)
      await q.execute(db)
      req.notify('Post deleted.', { level: 'error' })
    } catch (err) {
      req.notify(err.message, { level: 'error' })
    }
    res.redirect('/admin/post/')
  }
}

Post.PostModel = PostModel
module.exports = Post
