'use strict'
const Assert = require('kado/lib/Assert')
const Schema = require('kado/lib/Schema')

/**
 * SQLite-friendly Schema.SQL subclass.
 * Used only when database.engine === 'sqlite'.
 */
class SchemaSQLite extends Schema.SQL {
  static create (tableName, options = {}) {
    return new SchemaSQLite(tableName).createTable(options)
  }

  constructor (tableName) {
    super(tableName)
    this.charset = null
    this.engine = null
  }

  field (name, options = {}) {
    if (typeof options === 'string') options = { type: options }
    const opts = Object.assign({}, options)
    if (opts.type === 'INT') opts.type = 'INTEGER'
    if (opts.type === 'TINYINT') opts.type = 'INTEGER'
    if (opts.type === 'DATETIME') opts.type = 'TEXT'
    if (opts.type === 'LONGTEXT' || opts.type === 'TEXT') {
      opts.type = 'TEXT'
      delete opts.length
      delete opts.default
    }
    if (opts.type === 'VARCHAR') {
      opts.type = 'TEXT'
      delete opts.length
    }
    if (opts.autoIncrement) {
      opts.type = 'INTEGER'
      opts.autoIncrement = false
    }
    delete opts.signed
    return super.field(name, opts)
  }

  index (name, fields, options = {}) {
    // SQLite CREATE TABLE inline UNIQUE KEY / INDEX syntax differs; skip indexes
    // in CREATE and rely on PRIMARY KEY. Unique constraints can be added later.
    Assert.isType('string', name)
    Assert.isOk(fields)
    Assert.isType('Object', options)
    return this
  }

  toString () {
    return `${this.qbase} (\n` +
      `${this.qfields}` +
      `${this.primaryKey ? `,\n PRIMARY KEY ("${this.primaryKey}")` : ''}` +
      '\n)'
  }
}

module.exports = SchemaSQLite
