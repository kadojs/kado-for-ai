# File catalog

Every meaningful path in the seed, with role and deep-dive link. Ignore `node_modules/`, `package-lock.json`, and local `data/*.db`.

## Root

| Path | Role | Deep dive |
|------|------|-----------|
| [`app.js`](../app.js) | Process entry: CLI vs Cluster worker | [`files/app.md`](./files/app.md) |
| [`config.js`](../config.js) | Defaults + overlay merge | [`files/config.md`](./files/config.md) |
| [`config.example.js`](../config.example.js) | Sample `config.local.js` for MariaDB | [`files/config.md`](./files/config.md) |
| [`config.sqlite.example.js`](../config.sqlite.example.js) | Explicit SQLite opt-in sample | [`files/config.md`](./files/config.md) |
| [`package.json`](../package.json) | Scripts and deps (`kado`, `mysql2`, optional `sqlite3`) | — |
| [`docker-compose.yml`](../docker-compose.yml) | Local MariaDB (host port 3307) | [`workflows/boot.md`](./workflows/boot.md) |
| [`LICENSE`](../LICENSE) | MIT for seed source/docs | — |
| [`README.md`](../README.md) | Quick start | — |
| [`KadoForAI.md`](../KadoForAI.md) | Portable Kado coding guide | — |
| [`.gitignore`](../.gitignore) | Ignores `node_modules`, `config.local.js`, `data/` | — |

## `lib/` — application code

| Path | Role | Deep dive |
|------|------|-----------|
| [`lib/App.js`](../lib/App.js) | Wires Application, engines, middleware, modules | [`files/lib-App.md`](./files/lib-App.md) |
| [`lib/Main.js`](../lib/Main.js) | Home route | [`files/lib-modules.md`](./files/lib-modules.md) |
| [`lib/Page.js`](../lib/Page.js) | Pages + admin CRUD + `PageModel` | [`files/lib-modules.md`](./files/lib-modules.md) |
| [`lib/Post.js`](../lib/Post.js) | Posts + API + admin CRUD + `PostModel` | [`files/lib-modules.md`](./files/lib-modules.md) |
| [`lib/Admin.js`](../lib/Admin.js) | Admin dashboard | [`files/lib-modules.md`](./files/lib-modules.md) |
| [`lib/User.js`](../lib/User.js) | Login/logout + `UserModel` | [`files/lib-modules.md`](./files/lib-modules.md) |
| [`lib/Model.js`](../lib/Model.js) | `ModelManager` + schema builder helper | [`files/lib-data.md`](./files/lib-data.md) |
| [`lib/DatabaseUtil.js`](../lib/DatabaseUtil.js) | `db init` + admin seed | [`files/lib-data.md`](./files/lib-data.md) |
| [`lib/DatabaseMariaDB.js`](../lib/DatabaseMariaDB.js) | MySQL engine that honors `port` | [`files/lib-data.md`](./files/lib-data.md) |
| [`lib/DatabaseSQLite.js`](../lib/DatabaseSQLite.js) | Optional SQLite Connect engine | [`files/lib-data.md`](./files/lib-data.md) |
| [`lib/SchemaSQLite.js`](../lib/SchemaSQLite.js) | SQLite-friendly CREATE TABLE | [`files/lib-data.md`](./files/lib-data.md) |
| [`lib/EmailConsole.js`](../lib/EmailConsole.js) | Example custom Email engine | [`files/lib-data.md`](./files/lib-data.md) |
| [`lib/queryUtil.js`](../lib/queryUtil.js) | Unwrap `Query.execute` rows | [`files/lib-data.md`](./files/lib-data.md) |

## `view/` and `public/`

| Path | Role | Deep dive |
|------|------|-----------|
| `view/header.html`, `footer.html` | Shared Mustache partials | [`files/views-and-public.md`](./files/views-and-public.md) |
| `view/home.html`, `404.html`, `error.html` | Public shells | same |
| `view/page/`, `view/post/` | Public content templates | same |
| `view/admin/*` | Login, dashboard, CRUD forms | same |
| `public/css/main.css` | Static CSS (cache-busted via `?v={{_appVersion}}`) | same |

## `test/`

| Path | Role | Deep dive |
|------|------|-----------|
| [`test/index.js`](../test/index.js) | Boot app, reset schema, run suites | [`files/test.md`](./files/test.md) |
| [`test/config.test.js`](../test/config.test.js) | MariaDB test DB overlay | same |
| [`test/httpUtil.js`](../test/httpUtil.js) | Tiny HTTP client for suites | same |
| `test/*.test.js` | Suites: Model, Main, Page, Post, Admin, User | same |

## `docs/` (this tree)

Self-describing. Start at [`README.md`](./README.md).
