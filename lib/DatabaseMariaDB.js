'use strict'
const Assert = require('kado/lib/Assert')
const Database = require('kado/lib/Database')

/**
 * MariaDB / MySQL engine that honors options.port.
 * Stock kado Database.MySQL currently omits port when calling mysql2.
 */
class DatabaseMariaDB extends Database.MySQL {
  constructor (options = {}) {
    super(options)
    Assert.isType('Object', options)
    this.options = options
    if (!this.options.host) this.options.host = '127.0.0.1'
    if (!this.options.port) this.options.port = 3306
    if (!this.options.driver) this.options.driver = 'mysql2'
  }

  async connectMySQL2 () {
    try {
      require.resolve('mysql2/promise')
    } catch (e) {
      throw new Error('MySQL Engine requires the NPM mysql2 package')
    }
    const db = await require('mysql2/promise').createConnection({
      timezone: '+00:00',
      host: this.options.host,
      port: this.options.port,
      user: this.options.user,
      password: this.options.password,
      database: this.options.database
    })
    this.setEngine(db)
  }
}

module.exports = DatabaseMariaDB
