'use strict'
const runner = require('kado/lib/TestRunner').getInstance('KadoCMS')
const Assert = require('kado/lib/Assert')
const { request, cookieHeader } = require('./httpUtil')

runner.suite('User', (it) => {
  it('should reject bad password', async () => {
    const App = require('../lib/App')
    const port = App.getInstance().cfg.main.port
    const loginPage = await request(port, 'GET', '/admin/login/')
    const cookie = cookieHeader(loginPage.headers['set-cookie'])
    const res = await request(port, 'POST', '/admin/login/', {
      headers: { Cookie: cookie },
      body: { email: 'admin@example.com', password: 'wrong-password' }
    })
    Assert.isOk(res.statusCode === 302 || res.statusCode === 301)
    Assert.isOk(String(res.headers.location || '').indexOf('/admin/login') >= 0)
    const next = cookieHeader(res.headers['set-cookie']) || cookie
    const dash = await request(port, 'GET', '/admin/', {
      headers: { Cookie: next }
    })
    Assert.isOk(dash.statusCode === 302 || dash.statusCode === 301)
  })

  it('should accept valid credentials', async () => {
    const App = require('../lib/App')
    const port = App.getInstance().cfg.main.port
    const loginPage = await request(port, 'GET', '/admin/login/')
    const cookie = cookieHeader(loginPage.headers['set-cookie'])
    const res = await request(port, 'POST', '/admin/login/', {
      headers: { Cookie: cookie },
      body: { email: 'admin@example.com', password: 'admin' }
    })
    Assert.isOk(res.statusCode === 302 || res.statusCode === 301)
    Assert.isOk(String(res.headers.location || '').indexOf('/admin/') >= 0)
  })
})
