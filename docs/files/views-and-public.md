# Files: views and static assets

## Mustache layout pattern

Most pages are:

```html
{{>header}}
... page body ...
{{>footer}}
```

Partials resolve from the same `view/` folder registered on `ViewMustache`.

## Globals vs locals

| Source | Examples |
|--------|----------|
| `req.locals` set in `App.js` | `_appTitle`, `_appVersion`, `_currentYear`, `_user` |
| Handler `req.locals` | `_pageTitle` |
| `res.render(name, data)` | `page`, `post`, `rows`, `posts` |
| Session notify | `_notify` (from Session middleware) |

**Intention:** prefix “framework/template globals” with `_` so they do not collide with domain fields named `title`, `user`, etc.

## Template map

| Template | Used by |
|----------|---------|
| `home.html` | `Main.index` |
| `page/view.html` | `Page.view` |
| `post/list.html`, `post/view.html` | `Post.list` / `Post.view` |
| `admin/login.html` | `User.loginForm` |
| `admin/dashboard.html` | `Admin.dashboard` |
| `admin/page-*.html`, `admin/post-*.html` | Admin CRUD |
| `404.html` | `router.finalHandler` |
| `error.html` | Handler catch blocks |

## HTML content

Admin-entered `content` is rendered with `{{{page.content}}}` (unescaped). This seed trusts the admin user. For multi-user or public HTML input, sanitize before save or render.

## `public/css/main.css`

Served by `HyperText.StaticServer`. Linked as:

```html
<link rel="stylesheet" href="/css/main.css?v={{_appVersion}}">
```

**Intention:** teach cache-busting via app version without a bundler.

## See also

- [`../architecture/REQUEST_LIFECYCLE.md`](../architecture/REQUEST_LIFECYCLE.md)
- [`../workflows/http-request.md`](../workflows/http-request.md)
