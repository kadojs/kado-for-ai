'use strict'
const runner = require('kado/lib/TestRunner').getInstance('KadoCMS')
const Assert = require('kado/lib/Assert')
const { request, cookieHeader } = require('./httpUtil')

runner.suite('Admin', (it) => {
  it('should redirect unauthenticated admin to login', async () => {
    const App = require('../lib/App')
    const port = App.getInstance().cfg.main.port
    const res = await request(port, 'GET', '/admin/')
    Assert.isOk(res.statusCode === 302 || res.statusCode === 301)
    Assert.isOk(String(res.headers.location || '').indexOf('/admin/login') >= 0)
  })

  it('should show dashboard after login', async () => {
    const App = require('../lib/App')
    const port = App.getInstance().cfg.main.port
    const loginPage = await request(port, 'GET', '/admin/login/')
    const cookie = cookieHeader(loginPage.headers['set-cookie'])
    const login = await request(port, 'POST', '/admin/login/', {
      headers: { Cookie: cookie },
      body: { email: 'admin@example.com', password: 'admin' }
    })
    const next = cookieHeader(login.headers['set-cookie']) || cookie
    Assert.isOk(login.statusCode === 302 || login.statusCode === 301)
    const dash = await request(port, 'GET', '/admin/', {
      headers: { Cookie: next }
    })
    Assert.eq(dash.statusCode, 200)
    Assert.isOk(dash.body.indexOf('Signed in') >= 0)
  })
})
