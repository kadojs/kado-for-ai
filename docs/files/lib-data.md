# Files: data layer (`lib` persistence + engines)

## `Model.js`

- `ModelManager` — array registry (`push` / `all`)
- `AppModel.buildTable(tableName, fieldList, engineName)` — picks `Schema.SQL` or `SchemaSQLite`

**Intention:** one place to decide “how do we emit DDL for this engine?”

## `DatabaseUtil.js`

- `init(app)` — create tables for every registered model, then `seedAdmin`
- `hashPassword` — shared with `User` login verify

**Intention:** CLI `db init` is the schema story for this seed (not an external migrator). Fine for teaching; larger apps may add versioned migrations later while keeping model `fieldList` as source of truth.

## `DatabaseMariaDB.js`

Extends `kado/lib/Database`.MySQL; overrides `connectMySQL2` to pass `host`, `port`, `user`, `password`, `database`.

**Intention:** document a real stock-Kado gap and the correct response (subclass), not a monkey-patch.

## `DatabaseSQLite.js` + `SchemaSQLite.js`

Optional path when `engine: 'sqlite'`:

- Wraps `sqlite3` with `query` / `execute` shapes Kado Query expects
- `SchemaSQLite` strips InnoDB/charset and maps types

**Intention:** show custom engines **and** keep SQLite clearly secondary.

## `EmailConsole.js`

`Email.EmailEngine` that logs `to` / `subject`. Wired when `cfg.email.enabled`.

**Intention:** smallest possible custom engine example without SMTP credentials in the seed.

## `queryUtil.js`

```js
function rowsOf (rv) {
  if (Array.isArray(rv[0])) return rv[0]
  ...
}
```

**Intention:** normalize mysql2 `execute` → `[rows, fields]` so handlers stay readable. Always pair `execute` + `rowsOf` for SELECTs.

## Gotcha: `Model.byIdQuery` and non-id keys

`assertId` rejects `@`, `.`, `-`. Use explicit `Query.SQL.from(table).where(column).value(v)` for email/uri lookups (see `User.byEmail`, `Page.byUri`, `Post.byUri`).

## See also

- [`../architecture/CONNECT_ENGINES.md`](../architecture/CONNECT_ENGINES.md)
- [`../workflows/db-init.md`](../workflows/db-init.md)
