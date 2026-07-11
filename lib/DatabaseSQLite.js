'use strict'
const Assert = require('kado/lib/Assert')
const Database = require('kado/lib/Database')

/**
 * Optional SQLite Connect engine for small apps.
 * Activate only with database.engine === 'sqlite' in config.
 * Requires optional dependency: sqlite3
 */
class DatabaseSQLite extends Database.DatabaseEngine {
  constructor (options = {}) {
    super()
    Assert.isType('Object', options)
    if (!options.file) options.file = './data/kado-cms.db'
    this.options = options
  }

  async start () {
    try {
      require.resolve('sqlite3')
    } catch (e) {
      throw new Error('SQLite engine requires the optional npm package sqlite3')
    }
    const fs = require('kado/lib/FileSystem')
    const dir = fs.path.dirname(fs.path.resolve(this.options.file))
    if (!fs.exists(dir)) {
      require('fs').mkdirSync(dir, { recursive: true })
    }
    const sqlite3 = require('sqlite3').verbose()
    const db = new sqlite3.Database(this.options.file)
    const wrap = {
      query: (sql, params = []) => {
        return new Promise((resolve, reject) => {
          const trimmed = sql.toLowerCase().trim()
          if (trimmed.startsWith('select')) {
            db.all(sql, params, (err, rows) => {
              if (err) reject(err)
              else resolve(rows)
            })
          } else {
            db.run(sql, params, function (err) {
              if (err) reject(err)
              else {
                resolve({
                  affectedRows: this.changes,
                  insertId: this.lastID,
                  changedRows: this.changes
                })
              }
            })
          }
        })
      },
      execute: (sql, params = []) => {
        return new Promise((resolve, reject) => {
          const trimmed = sql.toLowerCase().trim()
          if (trimmed.startsWith('select')) {
            db.all(sql, params, (err, rows) => {
              if (err) reject(err)
              else resolve([rows])
            })
          } else if (trimmed.startsWith('create') || trimmed.startsWith('drop')) {
            db.run(sql, function (err) {
              if (err) reject(err)
              else {
                resolve([{
                  affectedRows: this.changes,
                  insertId: this.lastID,
                  changedRows: this.changes
                }])
              }
            })
          } else {
            db.run(sql, params, function (err) {
              if (err) reject(err)
              else {
                resolve([{
                  affectedRows: this.changes,
                  insertId: this.lastID,
                  changedRows: this.changes
                }])
              }
            })
          }
        })
      },
      end: () => {
        return new Promise((resolve, reject) => {
          db.close((err) => err ? reject(err) : resolve())
        })
      }
    }
    this.setEngine(wrap)
  }

  stop () {
    return this.getEngine().end()
  }
}

module.exports = DatabaseSQLite
