# Seed documentation (deep dive)

This folder is the **annotated, intention-first** companion to the runnable CMS seed. Read it when you need more than the quick reference in [`../KadoForAI.md`](../KadoForAI.md).

| Audience | Start here |
|----------|------------|
| AI implementing a new Kado app | [`INTENTION.md`](./INTENTION.md) → [`WORKFLOWS.md`](./WORKFLOWS.md) → copy patterns from `lib/` |
| AI modifying this seed | [`FILES.md`](./FILES.md) then the matching file under `files/` |
| Human learning Kado | [`../KadoForAI.md`](../KadoForAI.md) first, then this folder for “why” |

## Map

```
docs/
├── README.md                 ← you are here
├── INTENTION.md              ← design goals and non-goals
├── WORKFLOWS.md              ← index of runtime workflows
├── FILES.md                  ← catalog of every seed file
├── architecture/             ← concepts behind the wiring
│   ├── APPLICATION.md
│   ├── CONNECT_ENGINES.md
│   ├── MODULES_AND_MODELS.md
│   └── REQUEST_LIFECYCLE.md
├── files/                    ← one deep note per important path
│   ├── app.md
│   ├── config.md
│   ├── lib-App.md
│   ├── lib-modules.md
│   ├── lib-data.md
│   ├── views-and-public.md
│   └── test.md
└── workflows/                ← step-by-step flows with file touchpoints
    ├── boot.md
    ├── http-request.md
    ├── admin-auth.md
    ├── content-crud.md
    ├── db-init.md
    └── testing.md
```

## How to use these docs as an AI

1. **Do not invent Express APIs.** Confirm helpers in [`../KadoForAI.md`](../KadoForAI.md) §3 and §11.
2. **Prefer MariaDB** unless the user explicitly asks for SQLite (`engine: 'sqlite'`).
3. **One feature = one module** under `lib/`, with routes bound via `.bind(this)`.
4. **When unsure where logic belongs**, follow [`architecture/MODULES_AND_MODELS.md`](./architecture/MODULES_AND_MODELS.md).
5. **When changing behavior**, update the matching test under `test/` and re-read [`workflows/testing.md`](./workflows/testing.md).

## Relationship to other docs

| Doc | Role |
|-----|------|
| [`../README.md`](../README.md) | Install and run |
| [`../KadoForAI.md`](../KadoForAI.md) | Portable Kado coding guide |
| **This folder** | Seed-specific intention, file annotations, workflows |
