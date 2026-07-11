# Architecture: Application

## Concept

`kado/lib/Application` is the **singleton orchestrator**. Almost every Kado program begins with:

```js
const app = Application.getInstance()
```

The instance owns managers (`app.http`, `app.database`, `app.view`, `app.log`, `app.cli`, …). Your app code rarely constructs those managers; it **registers engines** onto them and **registers routes** onto `app.router` (via sugar methods like `app.get`).

## Intention in this seed

[`lib/App.js`](../../lib/App.js) is the only place that should:

- Call `Application.getInstance()`
- `addEngine` for log/database/http/view/email
- Install global middleware (static, session, admin gate)
- `require(...).register(app)` for feature modules
- Register CLI commands (`db init`, `db test`)

Feature modules must **not** create a second Application or open their own HTTP server.

## Lifecycle

| Call | Meaning |
|------|---------|
| `app.start(argv?)` | `setup()` once, start Connect engines (DB, etc.). If `argv` is a CLI command, run it and exit. |
| `app.listen()` | Start HyperText engines (bind sockets). |
| `app.stop()` | Stop Connect engines and servers. |

**Intention:** separate “connect dependencies” (`start`) from “accept traffic” (`listen`). Tests call both via `ensureStart()`; CLI `db init` only needs `start(argv)`.

## Singleton pitfalls

`Application.getInstance(name)` memoizes by name (default key is `undefined`). Re-running `App.register` in the same process without a fresh process will reuse the same Application and can **double-register routes**. That is why:

- Production/CLI: one process, one register
- Tests: one register per `node test/index.js` process
- `App.reset()` only clears the seed’s local `let app` cache — it does **not** destroy Kado’s singleton

## What `App.register` attaches beyond stock Kado

| Attachment | Why |
|------------|-----|
| `app.cfg` | Modules need config without re-requiring overlays inconsistently |
| `app.models` | Registry for `db init` (`ModelManager`) |
| `app.httpServer` | Handle to HyperTextServer (port/host already set) |
| `app.ensureStart` / `app.requestStop` | In-process test helpers |

## Related

- Engines: [`CONNECT_ENGINES.md`](./CONNECT_ENGINES.md)
- Request path: [`REQUEST_LIFECYCLE.md`](./REQUEST_LIFECYCLE.md)
- File note: [`../files/lib-App.md`](../files/lib-App.md)
