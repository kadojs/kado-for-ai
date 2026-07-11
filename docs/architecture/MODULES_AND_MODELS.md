# Architecture: Modules and models

## Modules (features)

A Kado module is a subclass of `kado/lib/Module` that:

1. Exposes `static register(app)`
2. Constructs itself, sets `name` / `title` / `description`
3. Calls `app.addModule(this)`
4. Registers routes with **bound** handlers: `app.get('/x', this.method.bind(this))`

### Intention

**Module = feature boundary.** Pages live in `Page.js`, posts in `Post.js`, auth in `User.js`. Do not grow `App.js` with business routes.

Optional base hooks (`db`, `main`, `cli`, `search`) exist on `Module` for richer apps; this seed mostly uses `register` + constructor for clarity.

### Binding handlers

```js
app.get('/post/', post.list.bind(post))
```

Without `.bind(this)`, `this` inside `list` is wrong and `this.app` breaks. AIs forget this constantly — treat it as mandatory.

## Models (persistence)

Models in this seed:

- Extend helpers from `lib/Model.js` (`AppModel`)
- Define `fieldList()`, `createTable(engineName)`, query helpers
- Are pushed onto `app.models` in the module constructor so `db init` sees them

### Intention

Schema ownership lives **with the feature**, not in a global migrations folder. `DatabaseUtil.init` walks `app.models.all()` and runs each `createTable`.

### Query habit

Prefer `query.execute(db)` and unwrap with `rowsOf()` from `lib/queryUtil.js`. Stock `Model.byIdQuery` asserts IDs with `/^[0-9a-z]+$/i`, which **rejects emails and hyphenated URIs** — that is why `byEmail` / `byUri` use plain `Query.SQL.from(...).where(...)`.

### Saves

Use `Model.save(ModelClass, db, id, fields, data)` for insert-or-update. It expects mysql2-style `execute` results (`insertId` on write).

## Related

- Module file notes: [`../files/lib-modules.md`](../files/lib-modules.md)
- Data file notes: [`../files/lib-data.md`](../files/lib-data.md)
- CRUD workflow: [`../workflows/content-crud.md`](../workflows/content-crud.md)
