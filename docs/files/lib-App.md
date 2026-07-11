# File: `lib/App.js`

## Purpose

Single composition root for the CMS. If you are looking for “where is X wired?”, start here.

## Sections (in order)

1. **Fatal handlers** — log unhandled errors; exit in production, soft-fail under `TEST=test`
2. **Application singleton** — name, version, `app.cfg`, `app.models`
3. **Log engine** — console `Log.LogEngine`
4. **Email engine** — optional `EmailConsole`
5. **Database engine** — `mysql` → `DatabaseMariaDB`, `sqlite` → `DatabaseSQLite`, else throw
6. **CLI** — `db test`, `db init`
7. **HTTP + View + static**
8. **Middleware** — locals, session, `/admin` gate
9. **404 finalHandler** — Mustache `404` template
10. **Module registration** — Main, User, Admin, Page, Post (config-gated)
11. **Test helpers** — `ensureStart`, `requestStop`

## Intention highlights

### Why `DatabaseMariaDB` instead of raw `Database.MySQL`?

Stock Kado `Database.MySQL.connectMySQL2()` does not pass `options.port` into `mysql2`. This seed’s compose file publishes MariaDB on **3307**. The thin subclass exists to teach: **extend engines when stock behavior is insufficient**, rather than forking Kado.

### Why session middleware lives here

Auth redirect is cross-cutting. Feature modules assume `req.session` exists. Keeping the gate in `App.js` prevents every admin route from re-implementing checks.

### Why `return true` after redirect

Promise middleware must signal completion. Redirect without `return true` can continue into later middleware/handlers.

## Extension recipe

Adding a feature:

1. Create `lib/Thing.js` module + model  
2. `require('./Thing').register(app)` behind `cfg.modules.thing.enabled`  
3. Add views under `view/`  
4. Add `test/Thing.test.js` and list it in `test/index.js`

## See also

- [`../architecture/APPLICATION.md`](../architecture/APPLICATION.md)
- [`../architecture/REQUEST_LIFECYCLE.md`](../architecture/REQUEST_LIFECYCLE.md)
- [`lib-modules.md`](./lib-modules.md)
