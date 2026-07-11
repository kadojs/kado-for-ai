'use strict'
const Module = require('kado/lib/Module')
const { rowsOf } = require('./queryUtil')

class Main extends Module {
  static register (app) {
    const main = new Main(app)
    app.get('/', main.index.bind(main))
  }

  constructor (app) {
    super()
    this.app = app
    this.name = this.title = 'Main'
    this.description = 'Home and shared routes'
    this.app.addModule(this)
  }

  async index (req, res) {
    const Post = require('./Post')
    const Page = require('./Page')
    const db = this.app.database.getActiveEngine()
    let posts = []
    let pages = []
    try {
      posts = rowsOf(await Post.PostModel.recentList(5).execute(db))
      pages = rowsOf(await Page.PageModel.listActive().execute(db))
    } catch (err) {
      posts = []
      pages = []
    }
    req.locals._pageTitle = 'Home'
    res.render('home', { posts: posts, pages: pages })
  }
}

module.exports = Main
