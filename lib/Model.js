'use strict'
const Model = require('kado/lib/Model')
const Schema = require('kado/lib/Schema')

class ModelManager {
  constructor () {
    this.models = []
  }

  push (model) {
    this.models.push(model)
    return this
  }

  all () {
    return this.models.slice()
  }
}

class AppModel extends Model {
  static schemaClass (engineName) {
    if (engineName === 'sqlite') {
      return require('./SchemaSQLite')
    }
    return Schema.SQL
  }

  static buildTable (tableName, fieldList, engineName = 'mysql') {
    const SchemaClass = AppModel.schemaClass(engineName)
    const table = SchemaClass.create(tableName)
    const fields = fieldList()
    for (const name in fields) {
      if (!Object.prototype.hasOwnProperty.call(fields, name)) continue
      table.field(name, fields[name])
    }
    table.primary('id')
    return table
  }
}

AppModel.ModelManager = ModelManager
module.exports = AppModel
