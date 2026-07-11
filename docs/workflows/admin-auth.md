# Workflow: admin authentication

## Goal

Protect `/admin/*` with a session cookie and a simple user table.

## Unauthenticated visit

1. `GET /admin/`  
2. Session middleware runs; `req.session.get('user')` is empty  
3. URL matches `/admin/` and is not `/admin/login/`  
4. `res.redirect('/admin/login/')` + `return true`  
5. Browser follows to login form (`User.loginForm` → `admin/login.html`)

## Successful login

1. `GET /admin/login/` — establishes session cookie if needed  
2. `POST /admin/login/` with `email` + `password`  
3. `User.loginSubmit` loads user by email, verifies hash  
4. `req.session.set('user', { id, email, name })`  
5. `req.notify('Welcome back.')`  
6. `res.redirect('/admin/')`  
7. Dashboard renders with `user` from session  

## Failed login

- Wrong password → notify error → redirect back to login  
- Subsequent `GET /admin/` still redirects to login  

## Password model (seed)

```text
sha256( password + ':' + cfg.main.cookieSecret )
```

**Intention:** short and dependency-free for teaching. Real apps should use a slow KDF (scrypt/argon2/bcrypt) and per-user salts.

## Session storage

`Session.SessionStoreSQL` persists rows in table `Session` (from `Session.SessionStoreModel`), created during `db init`.

## Files

- Gate: `lib/App.js` middleware  
- Forms/actions: `lib/User.js`  
- Shell: `lib/Admin.js`  
- Views: `view/admin/login.html`, `view/admin/dashboard.html`  
- Tests: `test/Admin.test.js`, `test/User.test.js`

## See also

- [`../files/lib-modules.md`](../files/lib-modules.md)
- [`testing.md`](./testing.md)
