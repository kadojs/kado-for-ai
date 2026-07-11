'use strict'
const runner = require('kado/lib/TestRunner').getInstance('KadoCMS')
const Assert = require('kado/lib/Assert')
const Model = require('kado/lib/Model')
const Page = require('../lib/Page')
const Post = require('../lib/Post')
const User = require('../lib/User')
const { rowsOf } = require('../lib/queryUtil')

runner.suite('Model', (it) => {
  it('should expose fieldList for Page Post and User', () => {
    Assert.isType('Object', Page.PageModel.fieldList())
    Assert.isType('Object', Post.PostModel.fieldList())
    Assert.isType('Object', User.UserModel.fieldList())
    Assert.isOk(Page.PageModel.fieldList().uri)
    Assert.isOk(Post.PostModel.fieldList().title)
  })

  it('should build createTable SQL for mysql', () => {
    const sql = Page.PageModel.createTable('mysql').toString()
    Assert.isOk(sql.indexOf('CREATE TABLE') >= 0)
    Assert.isOk(sql.indexOf('Page') >= 0)
    Assert.isOk(sql.indexOf('InnoDB') >= 0)
  })

  it('should insert and fetch a page by uri', async () => {
    const App = require('../lib/App')
    const app = App.getInstance()
    const db = app.database.getActiveEngine()
    const now = new Date()
    const insert = Page.PageModel.insert([
      'title', 'uri', 'content', 'active', 'createdAt', 'updatedAt'
    ])
    insert.value(['About', 'about', '<p>Hello</p>', 1, now, now])
    await insert.execute(db)
    const rows = rowsOf(await Page.PageModel.byUri('about').execute(db))
    Assert.eq(rows.length, 1)
    Assert.eq(rows[0].title, 'About')
    Assert.isType('number', rows[0].id)
    Assert.isOk(Model.fieldPrimary)
  })
})
