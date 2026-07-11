# Files: `test/`

## Purpose

Prove the CMS works with **Kado’s own** TestRunner — the same tool apps should use in production codebases.

## `index.js` harness

1. Set `TEST=test` (also set by npm script)  
2. `require` suite files (registers tests on the singleton runner)  
3. Ensure MariaDB test database exists (root grant from compose password)  
4. `App.register(cfg)` → `start` → drop/recreate schema → `listen`  
5. `runner.execute()` → `app.stop()` → `process.exit(rc)`  

**Intention:** suites assume a live HTTP server and a clean schema. They are integration tests, not mocked unit tests.

## `config.test.js`

Overrides:

- `main.port` → `3099` (avoid clashing with a dev server on 3000)
- `database.mysql.database` → `kado_cms_test`
- Same credentials as compose user `kado` / `kado`

## `httpUtil.js`

Minimal `http.request` helper + cookie jar string builder. Keeps tests free of third-party HTTP clients.

## Suites and what they assert

| Suite | Intention |
|-------|-----------|
| `Model.test.js` | fieldList / DDL / insert+byUri against DB |
| `Main.test.js` | `GET /` 200 + welcome copy |
| `Page.test.js` | login → create → list → public view → delete |
| `Post.test.js` | same + `/api/posts` JSON |
| `Admin.test.js` | unauthenticated redirect; dashboard after login |
| `User.test.js` | bad password stays gated; good password redirects to admin |

## Assert rules (repeat until automatic)

- `Assert.eq`, `Assert.isOk`, `Assert.isType`
- No Jest, no `Assert.isEqual`, no `Assert.isNotOk`

## FOCUS filter

```bash
FOCUS=Post npm test
```

Runs only suite names matching the regex (see `test/index.js`).

## See also

- [`../workflows/testing.md`](../workflows/testing.md)
- [`../../KadoForAI.md`](../../KadoForAI.md) §9
