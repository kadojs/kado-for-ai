'use strict'
const runner = require('kado/lib/TestRunner').getInstance('KadoCMS')
const Assert = require('kado/lib/Assert')
const Post = require('../lib/Post')
const { request, cookieHeader } = require('./httpUtil')
const { rowsOf } = require('../lib/queryUtil')

async function login (port) {
  const loginPage = await request(port, 'GET', '/admin/login/')
  const cookie = cookieHeader(loginPage.headers['set-cookie'])
  const res = await request(port, 'POST', '/admin/login/', {
    headers: { Cookie: cookie },
    body: { email: 'admin@example.com', password: 'admin' }
  })
  return cookieHeader(res.headers['set-cookie']) || cookie
}

runner.suite('Post', (it) => {
  it('should support public list detail api and admin CRUD', async () => {
    const App = require('../lib/App')
    const app = App.getInstance()
    const port = app.cfg.main.port
    const cookie = await login(port)

    const save = await request(port, 'POST', '/admin/post/save/', {
      headers: { Cookie: cookie },
      body: {
        id: '0',
        title: 'Hello World',
        uri: 'hello-world',
        summary: 'First post',
        content: '<p>Body</p>',
        active: 'on'
      }
    })
    Assert.isOk(save.statusCode === 302 || save.statusCode === 301)

    const list = await request(port, 'GET', '/post/')
    Assert.eq(list.statusCode, 200)
    Assert.isOk(list.body.indexOf('Hello World') >= 0)

    const view = await request(port, 'GET', '/post/hello-world/')
    Assert.eq(view.statusCode, 200)
    Assert.isOk(view.body.indexOf('Body') >= 0)

    const api = await request(port, 'GET', '/api/posts')
    Assert.eq(api.statusCode, 200)
    const json = JSON.parse(api.body)
    Assert.isOk(json.posts.length >= 1)
    Assert.eq(json.posts[0].uri, 'hello-world')

    const db = app.database.getActiveEngine()
    const rows = rowsOf(await Post.PostModel.byUri('hello-world').execute(db))
    Assert.eq(rows.length, 1)

    await request(port, 'POST', '/admin/post/delete/', {
      headers: { Cookie: cookie },
      body: { id: String(rows[0].id) }
    })
  })
})
