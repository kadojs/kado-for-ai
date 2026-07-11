# Workflow: HTTP request (public page)

## Example

`GET /page/about/`

## Step by step

1. **HyperTextServer** receives Node `req`/`res`, hands off to `app.router`
2. **standardPreparation** parses cookies/query/body; attaches `res.render`
3. **Static middleware** — URL is not a file under `public/`, continue
4. **Log middleware** (non-production) — prints method/status later
5. **Locals middleware** — sets `_appTitle`, `_appVersion`, …
6. **Session middleware** — loads/creates session; sets `_user` if logged in  
   (URL is not `/admin/…`, so no auth redirect)
7. **Route** `Page.view` matches `/page/:uri/` with `uri=about`
8. Handler runs `PageModel.byUri('about').execute(db)`, unwraps rows
9. `res.render('page/view', { page })`
10. Mustache loads `view/page/view.html` + partials `header`/`footer`
11. HTML response ends

## If the page is missing

Handler sets `res.statusCode = 404` and renders `error.html` (or unknown routes hit `finalHandler` → `404.html`).

## Intention

This is the “happy path” mental model for every HTML route. JSON routes stop at `res.json` instead of Mustache.

## Common AI mistakes on this path

| Mistake | Fix |
|---------|-----|
| `res.send(html)` | `res.end` or `res.render` |
| Forgetting `.bind(this)` | Bind in `register` |
| Using `byIdQuery` for URI with `-` | Use `Query.SQL.where('uri')` |
| Expecting Express `next` | Return `true` / end response |

## See also

- [`../architecture/REQUEST_LIFECYCLE.md`](../architecture/REQUEST_LIFECYCLE.md)
- [`../files/lib-modules.md`](../files/lib-modules.md)
- [`../files/views-and-public.md`](../files/views-and-public.md)
