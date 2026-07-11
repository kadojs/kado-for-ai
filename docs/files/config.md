# Files: config overlays

## Purpose

Configuration is a plain object, merged with `kado/lib/Mapper.mergeObject`.

| File | Role |
|------|------|
| `config.js` | Checked-in defaults (MariaDB, port 3000, modules enabled) |
| `config.example.js` | Template for local MariaDB credentials |
| `config.local.js` | Gitignored overrides (create locally) |
| `config.sqlite.example.js` | **Explicit** SQLite opt-in sample |
| `test/config.test.js` | Loaded when `TEST=test` — separate DB + port |

## Load order in `config.js`

1. Base `cfg` object  
2. If `TEST=test` and `test/config.test.js` exists → merge  
3. If `config.local.js` exists → merge  

**Intention:** tests win over defaults; local overrides win for humans. Never commit secrets in `config.js`.

## Database keys (intention)

```js
database: {
  engine: 'mysql',          // or 'sqlite' only when deliberate
  mysql: { driver, host, port, user, password, database },
  sqlite: { file }
}
```

Default `port: 3307` matches `docker-compose.yml` host mapping (`3307:3306`) so the seed works beside another local MySQL on 3306.

## Module flags

```js
modules: { admin, page, post, user } // each { enabled: true }
```

`App.register` respects these flags. Disable a feature without deleting code.

## Anti-patterns

- Do not read `process.env` ad hoc in every module — put env mapping in config overlays
- Do not default `engine` to sqlite in `config.local.js` “just for now” without documenting it
- Do not point tests at the development database name

## See also

- [`../workflows/boot.md`](../workflows/boot.md)
- [`../INTENTION.md`](../INTENTION.md) database policy
