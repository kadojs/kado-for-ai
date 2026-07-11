'use strict'
const http = require('http')

function request (port, method, path, options = {}) {
  const headers = Object.assign({}, options.headers || {})
  let body = options.body
  if (body && typeof body === 'object' && !(body instanceof Buffer)) {
    body = new URLSearchParams(body).toString()
    headers['Content-Type'] = headers['Content-Type'] ||
      'application/x-www-form-urlencoded'
    headers['Content-Length'] = Buffer.byteLength(body)
  }
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1',
      port: port,
      path: path,
      method: method,
      headers: headers
    }, (res) => {
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf8')
        })
      })
    })
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

function cookieHeader (setCookie) {
  if (!setCookie) return ''
  const list = Array.isArray(setCookie) ? setCookie : [setCookie]
  return list.map((c) => c.split(';')[0]).join('; ')
}

module.exports = { request, cookieHeader }
