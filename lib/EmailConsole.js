'use strict'
const Email = require('kado/lib/Email')

/**
 * Example custom Email engine: logs messages instead of sending SMTP.
 * Demonstrates extending Connect engines.
 */
class EmailConsole extends Email.EmailEngine {
  constructor (options = {}) {
    super()
    this.options = options
    this.setEngine(this)
  }

  send (message) {
    const to = message.to || message.destination || '(unknown)'
    const subject = message.subject || '(no subject)'
    console.log(`[email] to=${to} subject=${subject}`)
    return Promise.resolve({ accepted: [to], messageId: 'console' })
  }

  start () { return Promise.resolve() }
  stop () { return Promise.resolve() }
}

module.exports = EmailConsole
