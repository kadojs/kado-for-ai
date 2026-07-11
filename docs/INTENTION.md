# Intention

## Why this seed exists

Kado is easy to misuse if you approach it like Express, Nest, or a React SPA backend. AIs especially tend to:

- Call `res.send()` (it does not exist)
- Use Express `next()` middleware
- Reach for Jest/`expect`
- Default every app to SQLite “because it’s easy”
- Put all routes in one file and skip `Module`

This seed is a **teaching artifact**: a small but real CMS that forces the correct shapes into the open. Copy it, delete features you do not need, keep the patterns.

## Design goals

1. **Runnable truth** — Docs alone lie. The CMS must boot, serve HTML, authenticate admin, CRUD content, and pass `npm test`.
2. **MariaDB first** — Enterprise-shaped apps should learn `Database.MySQL` / MariaDB early. SQLite is an explicit opt-in for small tools, never a silent fallback.
3. **One concept per file** — Application wiring, feature modules, engines, and tests are separated so an AI can open one file and learn one idea.
4. **Intention over cleverness** — Prefer obvious Kado idioms (`Application.getInstance`, `addEngine`, `Module.register`, Mustache `res.render`) over abstractions that hide the framework.
5. **Portable MIT seed** — No host-product names, packages, or DRM. The seed’s source/docs are MIT; Kado itself remains GPL-3 as a dependency.

## Non-goals

- Not a full CMS product (no media library, revisions, RBAC matrix, multi-tenant).
- Not a framework fork — we extend Kado; we do not reimplement it.
- Not a monorepo integration demo.
- Not “SQLite by default for DX” — that trains the wrong muscle memory.

## Mental model (keep this)

```
Application (singleton)
  ├── engines via Connect managers (log, database, http, view, email, …)
  ├── router + middleware (promise chain)
  ├── modules (feature units: Main, Page, Post, Admin, User)
  └── models registered for `db init`
```

Everything interesting is either:

- an **engine** (lifecycle `start`/`stop`), or
- a **module** (routes + domain), or
- a **model** (schema + queries).

If new code is none of those, ask whether it should be.

## Teaching order (recommended)

1. [`architecture/APPLICATION.md`](./architecture/APPLICATION.md)
2. [`architecture/CONNECT_ENGINES.md`](./architecture/CONNECT_ENGINES.md)
3. [`architecture/REQUEST_LIFECYCLE.md`](./architecture/REQUEST_LIFECYCLE.md)
4. [`architecture/MODULES_AND_MODELS.md`](./architecture/MODULES_AND_MODELS.md)
5. [`workflows/boot.md`](./workflows/boot.md) then [`workflows/http-request.md`](./workflows/http-request.md)
6. Feature workflows: auth → CRUD → db init → testing

## Database policy (intention)

| Choice | When | How |
|--------|------|-----|
| MariaDB (`engine: 'mysql'`) | Default, tests, real apps | `lib/DatabaseMariaDB.js` + `mysql2` |
| SQLite (`engine: 'sqlite'`) | Small/prototype only | Copy `config.sqlite.example.js` → `config.local.js`, install `sqlite3` |

If MariaDB is down, **fail loudly**. Do not auto-switch to SQLite.

## Success criteria for learners (AI or human)

After studying this seed you should be able to:

- Wire a new Kado app without Express habits
- Add a feature as a `Module` with Mustache views
- Register a model and run `node app.js db init`
- Write a TestRunner suite that hits HTTP
- Extend an engine (email or database) without breaking Connect lifecycle
