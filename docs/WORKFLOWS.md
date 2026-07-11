# Workflows index

Each workflow is a narrative of **what happens**, **which files own it**, and **what intention it teaches**.

| Workflow | Teaches | Doc |
|----------|---------|-----|
| Boot (CLI vs HTTP) | Cluster, `Application.start` / `listen`, CLI detection | [`workflows/boot.md`](./workflows/boot.md) |
| HTTP request | Preparer, middleware, modules, Mustache | [`workflows/http-request.md`](./workflows/http-request.md) |
| Admin auth | Session store, redirects, password verify | [`workflows/admin-auth.md`](./workflows/admin-auth.md) |
| Content CRUD | Module routes, `Model.save`, admin forms | [`workflows/content-crud.md`](./workflows/content-crud.md) |
| Database init | Schema create, model registry, seeding | [`workflows/db-init.md`](./workflows/db-init.md) |
| Testing | TestRunner, in-process server, MariaDB test DB | [`workflows/testing.md`](./workflows/testing.md) |

## Cross-cutting diagram

```mermaid
flowchart TD
  entry[app.js] --> cli{CLI args?}
  cli -->|yes| startCmd[app.start argv]
  startCmd --> dbInit[db init / db test]
  cli -->|no| cluster{Cluster master?}
  cluster -->|yes| fork[cluster.start]
  cluster -->|no| worker[app.start + listen]
  worker --> http[HyperTextServer]
  http --> prep[Router.standardPreparation]
  prep --> mw[middleware: static log session auth]
  mw --> route[Module route handler]
  route --> view[res.render / res.json / res.redirect]
```

## Suggested reading path

1. Boot → understand how the process starts  
2. HTTP request → understand one page render  
3. Admin auth → understand session gate  
4. Content CRUD → understand write path  
5. DB init → understand schema ownership  
6. Testing → understand how we prove it
