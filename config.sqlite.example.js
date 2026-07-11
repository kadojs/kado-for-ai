'use strict'
// Explicit SQLite opt-in for small apps / prototypes.
// Copy to config.local.js (or merge these keys) — never used as a silent fallback.
//
//   cp config.sqlite.example.js config.local.js
//   npm install sqlite3
//   mkdir -p data
//   node app.js db init
//   node app.js
//
module.exports = {
  database: {
    engine: 'sqlite',
    sqlite: {
      file: './data/kado-cms.db'
    }
  }
}
