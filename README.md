# Kado-for-AI

MIT-licensed **Kado project seed** for humans and AI assistants. It includes:

- [`KadoForAI.md`](./KadoForAI.md) — consolidated guide to writing Kado apps
- [`docs/`](./docs/README.md) — deep-dive file annotations and workflows (intention-first for AIs)
- A runnable **example CMS** (pages, posts, admin login) that demonstrates canonical patterns
- Tests via `kado/lib/TestRunner` + `kado/lib/Assert`

This seed is **not** tied to any host product. Copy the folder and start building.

## Requirements

- Node.js 16+
- **MariaDB** (default and recommended for real apps)
- Docker optional (compose file included)

## Quick start (MariaDB)

```bash
docker compose up -d
# MariaDB is published on host port 3307 (see docker-compose.yml)
cp config.example.js config.local.js   # optional credential tweaks
npm install
npm run db:init
npm start
```

Open http://localhost:3000

Default admin (from config): `admin@example.com` / `admin`

```bash
npm test
```

Tests use database `kado_cms_test` (created by the test harness if missing).

## Smaller apps: SQLite (explicit opt-in)

SQLite is supported for prototypes and small tools. It is **never** selected automatically.

```bash
cp config.sqlite.example.js config.local.js
npm install sqlite3
mkdir -p data
npm run db:init
npm start
```

Do not use SQLite as a silent fallback when MariaDB is unavailable.

## Layout

| Path | Purpose |
|------|---------|
| `app.js` | Cluster + CLI entry |
| `lib/App.js` | Application wiring |
| `lib/*.js` | Feature modules (Main, Page, Post, Admin, User) |
| `view/` | Mustache templates |
| `public/` | Static assets |
| `test/` | TestRunner suites |
| `KadoForAI.md` | AI/human coding guide |
| `docs/` | Deep-dive intention, file annotations, workflows |

## Patterns demonstrated

- `Application.getInstance`, Connect engines, Cluster
- HyperText + Mustache + static files
- Session auth for `/admin/*`
- Modules extending `kado/lib/Module`
- Models with Query/Schema; `db init` CLI
- MariaDB via `Database.MySQL`; optional SQLite Connect engine
- Custom Email engine (`EmailConsole`)
- JSON API (`GET /api/posts`) alongside HTML
- In-process TestRunner suites

Read **KadoForAI.md** before generating new Kado code. For file-by-file intention and workflows, start at **[docs/README.md](./docs/README.md)**.
