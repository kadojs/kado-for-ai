# File: `app.js`

## Purpose

Process entrypoint. Decides between:

1. **CLI mode** — `node app.js db init` (any argv length > 2)
2. **Cluster master** — fork workers
3. **Worker / single process** — `App.register` → `start` → `listen`

## Intention

Keep clustering and CLI detection **out of** `lib/App.js`. `App.js` should be importable by tests without forking.

## Control flow

```js
const isCli = process.argv.length > 2
if (!isCli && cluster.isMaster()) {
  cluster.start()
} else {
  boot() // register + start or start(argv)
}
```

| Situation | Behavior |
|-----------|----------|
| `node app.js` | Master forks; worker listens on `cfg.main.port` |
| `node app.js db init` | No cluster; runs command and exits via `Application.start(argv)` |
| `TEST=test node test/index.js` | Does not use `app.js`; calls `App.register` directly |

## Teaching points

- `Cluster.getInstance()` is Kado’s wrapper around Node cluster
- CLI must not go through the master-only path or commands never run
- `process.title` helps operators see `kado-cms:master` / `worker` / `cli`

## See also

- [`../workflows/boot.md`](../workflows/boot.md)
- [`../architecture/APPLICATION.md`](../architecture/APPLICATION.md)
