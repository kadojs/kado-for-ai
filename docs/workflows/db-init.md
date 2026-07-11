# Workflow: database init

## Command

```bash
node app.js db init
# npm run db:init
```

## What it does

1. Boot Application and **start** Connect engines (DB connection)  
2. Resolve active engine name from `app.cfg.database.engine`  
3. For each model in `app.models.all()`:
   - Build DDL via `createTable(engineName)`
   - `db.execute(ddl)`
4. Seed admin user if email from `cfg.admin` is absent  
5. Exit  

## Models registered (order depends on module load order)

Typically: `Session` (from Kado SessionStoreModel), `User`, `Page`, `Post`.

Session is pushed in `App.js` when database is enabled; feature models are pushed in module constructors.

## Admin seed

From config:

```js
admin: { email, password, name }
```

Password hashed with `DatabaseUtil.hashPassword` and `cfg.main.cookieSecret`.

**Intention:** first login works out of the box after init. Change password in real deployments.

## MariaDB vs SQLite DDL

| Engine | Schema class | Notes |
|--------|--------------|-------|
| mysql | `Schema.SQL` | InnoDB + utf8 |
| sqlite | `SchemaSQLite` | No ENGINE clause; type mapping |

## When to re-run

After adding a new model/table. This seed uses `CREATE TABLE IF NOT EXISTS` — it will **not** alter existing columns. For column changes in teaching demos, drop tables or use the test harness reset.

## Related CLI

```bash
node app.js db test   # connectivity / config smoke
```

## See also

- [`../files/lib-data.md`](../files/lib-data.md)
- [`../architecture/CONNECT_ENGINES.md`](../architecture/CONNECT_ENGINES.md)
