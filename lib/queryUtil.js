'use strict'
/**
 * Normalize Kado Query.execute() results from mysql2 / sqlite wrappers.
 * execute() returns [rows, fields] for SELECT and [resultHeader] shapes for writes.
 */
function rowsOf (rv) {
  if (!rv) return []
  if (Array.isArray(rv[0])) return rv[0]
  if (Array.isArray(rv)) return rv
  return []
}

module.exports = { rowsOf }
