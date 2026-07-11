# Kado for AI

A practical guide for writing Kado applications. This document consolidates Kado architecture and day-to-day coding patterns. Examples match the CMS seed in this folder.

For **file-by-file intention and workflow deep dives**, see [`docs/README.md`](./docs/README.md).

Kado is a batteries-included Node.js framework built around one orchestrator — `Application` — and lifecycle-aware engines that plug into it.

---

## 1. Philosophy and Application

Kado composes small engines under one umbrella. Each subsystem (HTTP, database, view, cron, CLI, email, log) implements `start` / `stop` (or equivalent) and registers via `addEngine`.

```js
const Application = require('kado/lib/Application')
const app = Application.getInstance()
app.setName('my-app')
app.setVersion('1.0.0')
await app.start()
await app.listen()
```

`Application.getInstance()` returns a singleton. Child services include: `asset`, `cli`, `connect`, `cron`, `database`, `email`, `http`, `log`, `router`, `view`, and others.

Key methods:

- `setup()` — path discovery, library paths, router preparer (called from `start`)
- `start(argv)` — connect engines; if `argv` looks like a CLI command, run it and exit
- `listen()` — bind HTTP servers
- `stop()` — tear down
- Router sugar: `app.get`, `app.post`, `app.use`, …

---

## 2. Connect and engines

Most managers extend `Connect`. An engine is any object with the lifecycle methods the manager expects. Register with `addEngine(name, instance)` and optionally `activateEngine(name)`.

```js
const Database = require('kado/lib/Database')
app.database.addEngine('mysql', new Database.MySQL(cfg.database.mysql))
app.database.activateEngine('mysql')
```

Custom engines: subclass `Connect.ConnectEngine` (or a domain base like `Database.DatabaseEngine` / `Email.EmailEngine`), implement `start` / `stop`, register on the right manager. See `lib/EmailConsole.js` and `lib/DatabaseSQLite.js` in this seed.

---

## 3. HTTP (HyperText and Router)

```js
const HyperText = require('kado/lib/HyperText')
const http = new HyperText.HyperTextServer()
http.setHost(cfg.main.host)
http.setPort(cfg.main.port)
app.http.addEngine('http', http.createServer(app.router))
```

`Application.setup()` installs `Router.standardPreparation(app)`, which:

- Sets `req.locals`, parses cookies, query string, and body (`Parser.requestBody`)
- Adds `req.notify`, `res.json`, `res.redirect`, `res.render`, `res.sendFile`

### Response helpers (important)

| Use | Do not use |
|-----|------------|
| `res.end(body)` | `res.send()` — **does not exist** |
| `res.json(obj)` | Express-only helpers |
| `res.render('template', data)` | |
| `res.redirect('/path')` | |

### Middleware

Kado middleware is **promise-based**. Returning `true` (or ending the response) stops the chain. There is no Express-style `next()`.

```js
app.use(async (req, res) => {
  if (!req.session.get('user') && req.url.match(/^\/admin\//)) {
    res.redirect('/admin/login/')
    return true
  }
})
```

Static files:

```js
app.use(HyperText.StaticServer.getMiddleware(staticRoot))
```

---

## 4. View (Mustache)

```js
const View = require('kado/lib/View')
app.view.addEngine('mustache', new View.ViewMustache(viewFolder))
app.view.activateEngine('mustache')
```

Templates live under `view/` with `.html` extension. Partials: `{{>header}}`. Pass data via `res.render('home', { posts })` and globals on `req.locals` (for example `_pageTitle`, `_appTitle`).

---

## 5. Modules

Extend `kado/lib/Module`. Register routes in `static register(app)`, call `app.addModule(this)`.

```js
const Module = require('kado/lib/Module')
class Post extends Module {
  static register (app) {
    const post = new Post(app)
    app.get('/post/', post.list.bind(post))
  }
  constructor (app) {
    super()
    this.app = app
    this.name = this.title = 'Post'
    app.addModule(this)
  }
}
```

Optional hooks on the base class: `db(app)`, `main(app)`, `cli(app)`, `search(...)`.

**Convention:** one feature ≈ one file under `lib/`. Always `.bind(this)` (or bind the instance) when passing methods as route handlers.

---

## 6. Models, Query, Schema, Database

### MariaDB (default — recommended)

Kado ships `Database.MySQL`. This seed uses `lib/DatabaseMariaDB.js` (extends `Database.MySQL`) so `port` is passed to `mysql2` — useful when MariaDB is mapped to a non-default host port (compose uses `3307:3306`).

```js
database: {
  engine: 'mysql',
  mysql: {
    driver: 'mysql2',
    host: '127.0.0.1',
    port: 3307,
    user: 'kado',
    password: 'kado',
    database: 'kado_cms'
  }
}
```

### SQLite (explicit opt-in only)

SQLite is fine for demos and small single-user tools. It is **not** the default and must never be a silent fallback when MariaDB is down. Set `database.engine: 'sqlite'` deliberately (see `config.sqlite.example.js`).

### Models

Use `kado/lib/Model` field helpers and Query/Schema:

```js
static fieldList () {
  return {
    id: Model.fieldPrimary(),
    title: Model.fieldString(null, false, 255),
    active: Model.fieldBoolean(true),
    createdAt: Model.fieldDate(false, false),
    updatedAt: Model.fieldDate(false)
  }
}
```

`Query.execute(db)` returns mysql2-style `[rows, fields]`. Prefer `execute` and unwrap rows. `Model.save(ModelClass, db, id, fields, data)` handles insert/update.

CLI:

```bash
node app.js db init   # create tables + seed admin
node app.js db test
```

---

## 7. Session, Log, Email, CLI, Cron, Cluster

**Session:** `Session.getMiddleware({ secret, store })` with `Session.SessionStoreSQL` (or memory/local stores).

**Log:** `Log.LogEngine.getInstance({ name })` then `app.log.addEngine('console', log)`.

**Email:** register an `Email.EmailEngine` subclass (`lib/EmailConsole.js` logs instead of SMTP).

**CLI:** `app.cli.command('module', 'action', { action, description })`.

**Cron:** in-process scheduler with six-field cron strings (`sec min hour day month weekday`).

**Cluster:** `kado/lib/Cluster` for multi-process HTTP. Run CLI commands outside the cluster master path (see `app.js` in this seed).

---

## 8. Project layout and config

```
app.js              # entry (cluster + CLI)
config.js           # defaults (MariaDB)
config.example.js   # local override sample
config.local.js     # gitignored overrides (Mapper.mergeObject)
lib/App.js          # Application wiring
lib/*.js            # feature modules
view/               # Mustache templates
public/             # static assets
test/               # TestRunner suites
```

Config overlays via `kado/lib/Mapper.mergeObject`. Prefer configuration flags (`modules.*.enabled`) over hard-coding feature switches.

---

## 9. Testing (TestRunner + Assert)

Use **only** `kado/lib/TestRunner` and `kado/lib/Assert`. Not Jest. Not Mocha.

```js
const runner = require('kado/lib/TestRunner').getInstance('KadoCMS')
const Assert = require('kado/lib/Assert')

runner.suite('Main', (it) => {
  it('should GET /', async () => {
    Assert.isOk(body.indexOf('Welcome') >= 0)
  })
})
```

Assert API:

- `Assert.eq(a, b, msg)` — use this, not `isEqual`
- `Assert.isOk(value, msg)`
- `Assert.isType('string', value)`
- There is **no** `Assert.isNotOk` — use `Assert.eq(value, false)`
- There is **no** `Assert.throws` — use try/catch and `Assert.eq(errorThrown, true)`

Nested suites: hooks belong to the suite that owns them; use `root.suite` carefully.

Boot pattern (see `test/index.js`): register app → ensure schema → `ensureStart()` → `runner.execute()` → `app.stop()` → `process.exit(rc)`.

---

## 10. Extending Kado

1. **New Connect engine** — subclass engine base, implement lifecycle, `addEngine`
2. **New module** — subclass `Module`, `register(app)`, routes + models
3. **New view engine** — subclass `View.ViewEngine`, implement `render`
4. **CLI command** — `app.cli.command(...)`

---

## 11. AI anti-patterns and quick reference

### Do not

- Call `res.send()` (use `res.end` / `res.json` / `res.render`)
- Use Express `next()` middleware style
- Default new apps to SQLite when MariaDB is the product target
- Silently fall back to SQLite if MariaDB connection fails
- Use Jest `describe` / `expect` or `Assert.isEqual` / `Assert.isNotOk`
- Forget `.bind(this)` on module route handlers
- Assume `req.body` exists without `Router.standardPreparation` (Application setup provides it)

### Quick `kado/lib/*` map

| Module | Role |
|--------|------|
| `Application` | Singleton orchestrator |
| `HyperText` | HTTP server + static |
| `Router` | Routes, middleware, preparers |
| `View` / `Mustache` | Templates |
| `Module` | Feature base class |
| `Model` / `Query` / `Schema` | Data layer |
| `Database` | DB engines (`Database.MySQL`) |
| `Session` | Cookie sessions |
| `Log` | Logging |
| `Email` | Mail engines |
| `Command` | CLI |
| `Cluster` | Multi-process |
| `TestRunner` / `Assert` | Tests |
| `Mapper` | Deep config merge |
| `Parser` | Body / cookie / query |
| `Lifecycle` | Ordered start/stop lists |
| `ChildProcess` | Fork / respawn helpers |

### Development flow

1. Configure (`config.js` / `config.local.js`)
2. Add or extend a module under `lib/`
3. Add Mustache templates under `view/`
4. `node app.js db init` when schema changes
5. `node app.js` and exercise routes
6. `npm test` against MariaDB

---

Keep the mental model: **compose lifecycle-aware engines under Application**. Once that clicks, the rest of Kado stays predictable.
