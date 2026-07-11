# Files: feature modules (`lib/*` domain)

## Shared shape

Every feature module follows the same skeleton:

```js
class Feature extends Module {
  static register (app) {
    const feature = new Feature(app)
    app.get('/path', feature.handler.bind(feature))
  }
  constructor (app) {
    super()
    this.app = app
    this.name = this.title = 'Feature'
    this.app.models.push(FeatureModel) // if it owns tables
    this.app.addModule(this)
  }
}
```

## `Main.js`

- Route: `GET /`
- Loads recent posts + active pages for the home template
- Swallows DB errors so the home page still renders before `db init`

**Intention:** public landing should degrade gracefully; admin/CRUD should not.

## `Page.js`

- Public: `GET /page/:uri/`
- Admin: list / edit / save / delete under `/admin/page/`
- Model: `Page` table (`title`, `uri`, `content`, `active`, timestamps)

**Intention:** canonical “static CMS page” CRUD. URI is the public slug (not numeric id).

## `Post.js`

- Public: `GET /post/`, `GET /post/:uri/`
- JSON: `GET /api/posts` → `res.json({ posts })`
- Admin: parallel CRUD under `/admin/post/`

**Intention:** show HTML and JSON from the same module without a separate “API framework”.

## `Admin.js`

- Route: `GET /admin/` dashboard
- Assumes session gate in `App.js` already ran

**Intention:** keep the shell tiny; links out to feature admin UIs.

## `User.js`

- `GET/POST /admin/login/`, `GET /admin/logout/`
- Password: SHA-256 of `password + ':' + cookieSecret` (seed-simple — replace with a stronger KDF in real apps)
- Stores `{ id, email, name }` in session (never the hash)

**Intention:** demonstrate session login without dragging in OAuth/SSO.

## Admin form conventions

- Edit URLs use query `?id=`
- Save/delete are `POST` with urlencoded bodies (preparer fills `req.body`)
- Checkboxes: treat `'on'` or `'1'` as active
- Flash messages via `req.notify(...)` (session-backed)

## See also

- [`../architecture/MODULES_AND_MODELS.md`](../architecture/MODULES_AND_MODELS.md)
- [`../workflows/content-crud.md`](../workflows/content-crud.md)
- [`../workflows/admin-auth.md`](../workflows/admin-auth.md)
