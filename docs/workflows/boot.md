# Workflow: boot

## Goal

Understand how a cold start becomes either a CLI command or an HTTP server.

## Prerequisites

- `npm install`
- MariaDB up (`docker compose up -d`) unless using explicit SQLite config

## Path A — HTTP server

```bash
node app.js
# or npm start
```

1. `app.js` loads `config.js` (overlays applied)
2. `isCli === false`, process is cluster master → `cluster.start()` forks workers
3. Worker calls `App.register(cfg)`
4. Engines registered (log, db, http, view, email)
5. Modules register routes
6. `app.start()` connects DB (and other Connect engines)
7. `app.listen()` binds HyperText on `cfg.main.port` (default 3000)
8. Log line: `Kado CMS listening on http://...`

### Files touched

`app.js` → `config.js` → `lib/App.js` → engines under `lib/` → modules under `lib/`

## Path B — CLI (`db init`)

```bash
node app.js db init
```

1. `isCli === true` → **no cluster**
2. `App.register(cfg)`
3. `app.start(process.argv)` detects command via `app.cli`
4. `DatabaseUtil.init` creates tables + seeds admin
5. Process exits with command status

### Files touched

`app.js` → `lib/App.js` (cli.command) → `lib/DatabaseUtil.js` → each model’s `createTable`

## Path C — Tests

```bash
npm test
```

Does **not** use `app.js`. See [`testing.md`](./testing.md).

## Intention checklist

- [ ] CLI never depends on cluster workers  
- [ ] HTTP always `start` then `listen`  
- [ ] Config overlays explain which DB you hit  
- [ ] Failure to connect MariaDB is fatal (no SQLite sneak path)

## See also

- [`../files/app.md`](../files/app.md)
- [`../architecture/APPLICATION.md`](../architecture/APPLICATION.md)
