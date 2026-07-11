# Workflow: content CRUD (pages and posts)

## Goal

Create, list, view, and delete content through admin HTML forms, with public read URLs.

## Create (page example)

1. Authenticate (see [`admin-auth.md`](./admin-auth.md))  
2. `GET /admin/page/edit/` — empty form (`id=0`)  
3. `POST /admin/page/save/` with title, uri, content, active  
4. `Model.save(PageModel, db, id, fields, data)` inserts row  
5. Redirect to `/admin/page/edit/?id=<newId>`  
6. Public `GET /page/<uri>/` renders content  

Posts mirror this under `/admin/post/` and `/post/<uri>/`.

## List / delete

- `GET /admin/page/` — table of rows  
- `POST /admin/page/delete/` with `id` — delete query + redirect to list  

## JSON read path (posts only)

`GET /api/posts` returns:

```json
{ "posts": [ { "id", "title", "uri", "summary" } ] }
```

**Intention:** same module, same model, different renderer (`res.json`).

## URI rules

- Stored without leading/trailing slashes  
- Public routes always include trailing slash in this seed (`/page/about/`)  
- Hyphens allowed — lookups must not use `Model.byIdQuery`

## Files

| Concern | Page | Post |
|---------|------|------|
| Module | `lib/Page.js` | `lib/Post.js` |
| Admin views | `view/admin/page-*.html` | `view/admin/post-*.html` |
| Public views | `view/page/view.html` | `view/post/*.html` |
| Tests | `test/Page.test.js` | `test/Post.test.js` |

## Extension recipe

To add `Event` content: copy `Post.js` + views + test; register in `App.js`; add `modules.event.enabled`.

## See also

- [`../architecture/MODULES_AND_MODELS.md`](../architecture/MODULES_AND_MODELS.md)
- [`../files/lib-modules.md`](../files/lib-modules.md)
