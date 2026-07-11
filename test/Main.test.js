'use strict'
const runner = require('kado/lib/TestRunner').getInstance('KadoCMS')
const Assert = require('kado/lib/Assert')
const { request } = require('./httpUtil')

runner.suite('Main', (it) => {
  it('should GET / with home content', async () => {
    const App = require('../lib/App')
    const port = App.getInstance().cfg.main.port
    const res = await request(port, 'GET', '/')
    Assert.eq(res.statusCode, 200)
    Assert.isOk(res.body.indexOf('Welcome') >= 0)
    Assert.isOk(res.body.indexOf('Kado CMS') >= 0)
  })
})
