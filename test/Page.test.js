'use strict'
const runner = require('kado/lib/TestRunner').getInstance('KadoCMS')
const Assert = require('kado/lib/Assert')
const Page = require('../lib/Page')
const { request, cookieHeader } = require('./httpUtil')
const { rowsOf } = require('../lib/queryUtil')

async function login (port) {
  const loginPage = await request(port, 'GET', '/admin/login/')
  const cookie = cookieHeader(loginPage.headers['set-cookie'])
  const res = await request(port, 'POST', '/admin/login/', {
    headers: { Cookie: cookie },
    body: { email: 'admin@example.com', password: 'admin' }
  })
  const nextCookie = cookieHeader(res.headers['set-cookie']) || cookie
  return nextCookie
}

runner.suite('Page', (it) => {
  it('should create list and view a page via admin CRUD', async () => {
    const App = require('../lib/App')
    const app = App.getInstance()
    const port = app.cfg.main.port
    const cookie = await login(port)

    const save = await request(port, 'POST', '/admin/page/save/', {
      headers: { Cookie: cookie },
      body: {
        id: '0',
        title: 'Docs',
        uri: 'docs',
        content: '<p>Documentation</p>',
        active: 'on'
      }
    })
    Assert.isOk(save.statusCode === 302 || save.statusCode === 301)

    const list = await request(port, 'GET', '/admin/page/', {
      headers: { Cookie: cookie }
    })
    Assert.eq(list.statusCode, 200)
    Assert.isOk(list.body.indexOf('Docs') >= 0)

    const view = await request(port, 'GET', '/page/docs/')
    Assert.eq(view.statusCode, 200)
    Assert.isOk(view.body.indexOf('Documentation') >= 0)

    const db = app.database.getActiveEngine()
    const rows = rowsOf(await Page.PageModel.byUri('docs').execute(db))
    Assert.eq(rows.length, 1)

    const del = await request(port, 'POST', '/admin/page/delete/', {
      headers: { Cookie: cookie },
      body: { id: String(rows[0].id) }
    })
    Assert.isOk(del.statusCode === 302 || del.statusCode === 301)
  })
})
