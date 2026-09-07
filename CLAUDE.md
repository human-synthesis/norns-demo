# norns-demo — agent guide

Demo and reference app for Norns: the notes feature (Cloudflare D1 + form actions + DI + valibot + TRON endpoint) and tic-tac-toe (components + stores), each written once in Norns (`src/routes/examples/norns/`, `src/lib/norns/`) and once in vanilla SvelteKit (`src/routes/examples/svelte/`, `src/lib/svelte/`) for comparison, plus the norns-ui showcase at `src/routes/examples/ui/+page.n` (every component with live props — the best place to see how a component is used).

## Layout

```
src/
  hooks.server.c                     boots the runtime with the TRON serializer
  lib/norns/notes/server/module.c    binds `db` to event.platform.env.DB (D1) per request
  routes/examples/norns/notes/       +page.n / +page.server.c, [id]/, notes.css
  routes/examples/norns/tic-tac-toe/ Game.n, Board.n, Cell.n, store.c, ai.c
  routes/examples/svelte/            the vanilla twins (.svelte / .ts) — do not "convert" them
  routes/examples/ui/+page.n         norns-ui showcase
  routes/api/notes/+server.c         paged list (listQuery + schema-mode TRON) and create
  routes/api/notes/{search,stats,export,seed}/+server.c  picker options, columnar stats (cached), agent-facing export (cached), demo seeding
  routes/examples/tron/              the five TRON payload examples: table, picker, stats, form, agent
  lib/norns/notes/client/api.c       browser API client (createApi with the noteWire contract) + typed helpers
  lib/norns/notes/                   server/{module,repo,service,public}.c + shared/schema.c
  lib/svelte/notes/                  vanilla data layer
migrations/notes/*.sql               applied with `bun run db:migrate` (local D1 under .wrangler/state/) — not `norns migrate up`
wrangler.toml                        Worker + D1 binding `DB`; deploy via .github/workflows/deploy.yml or `bun run deploy`
```

Import project code explicitly (`import { notes } from '$lib/norns/notes/server/public'`, `import { play } from './store'`); only framework helpers and components are auto-imported. The vanilla side is covered by `bun run check:svelte`; the Norns side by `bun run lint`, `bun run check` and `bun run build`.

## Commands

```sh
bun run dev              # http://localhost:5173
bun run db:migrate       # apply migrations to the local D1 (first run); db:migrate:remote for production
bun run lint             # norns lint — Civet / Pug pitfall scan (templates + script blocks)
bun run check            # norns check — preprocess + compile every .n / .c / .svelte
bun run check:svelte     # svelte-check over the vanilla .svelte / .ts side only
bun run build            # full Vite build
bunx norns diag <file>            # JS that Civet emits for a .c / .n script
bunx norns diag --template <f.n>  # Svelte source the compiler sees after Pug / Civet / auto-import
```

## Working with norns (Civet + Pug + Svelte 5)

Civet is great for app code but has rough edges on advanced syntax. **When something doesn't parse or compile in Civet, drop to plain `.js` for that file — don't fight the parser.** Libraries and dense generator/stream/type code belong in `.js`; routes, components, and feature code stay in `.c`/`.n`.

### Civet pitfalls — do not write these

| Don't | Do | Why |
|---|---|---|
| `if x isnt y` | `if x !== y` | `isnt` compiles to a bare identifier reference at runtime |
| `async *foo()` as class method | callback `foo(onEvent)` or top-level `async function*` | parser rejects async generators in class shorthand |
| `value := $state ''` then later `value = 'x'` | `value .= $state ''` | `:=` creates `const`; reassigning `$state` needs `let` (which `.=` produces) |
| `raw: unknown` / `raw: any` as a let-with-type | `raw .= null` (no annotation) or `let raw: any = null` | bare `Type` annotations get read as identifier references |

### Pug / `.n` pitfalls — do not write these

| Don't | Do | Why |
|---|---|---|
| `{@html foo}` as a top-level Pug line | `\| {@html foo}` (pipe-prefix) | Pug parses leading `{` as a malformed tag |
| `#{expr}` interpolation in template | `{expr}` (Svelte interpolation) | `#{...}` evaluates at preprocess time, with no runtime data in scope; SSR 500s |
| `attr="#{expr}"` attribute interpolation | `attr!="{expr}"` (Svelte) | same reason |
| `+each('row of rows')` | `+each('rows as row')` (Svelte `as` form, optionally `(row.id)` key) | the `of` form is copied verbatim into the block and the Svelte compiler rejects it |
| `#{expr}` or `.a.b` shorthand across a line break | keep one element per line | Pug is line-oriented; parse errors surface on the *next* line |

Template syntax that works: `+if('cond')` / `+elseif('cond')` / `+else`, `+each('items as item (item.id)')`, `+snippet('name', arg)` with `| {@render name(x)}`, `attr!="{expr}"` for Svelte expressions, `.a.b` class shorthand (Tailwind variants and fractions like `.hover:bg-x.gap-2.5` are rewritten for you).

### SvelteKit / norns gotchas

- **`event.locals.container`** is the per-request DI scope set by `contextHandle` in `boot()`. Don't destructure DI directly from event args.
- **Body parsing is content-type-driven.** `+page.server.c` actions get `formData()`; client `fetch` posting JSON must hit a `+server.c` endpoint, not a form action.
- **`svelte-check` never reads `.n` or `.c` files.** `bun run check:svelte` only covers `.js` / `.ts` / `.svelte`; in a workspace checkout it also reports framework-source errors reached through symlinks. It is not the pass signal for Norns code — `norns check` is.
- **Type-check is not feature verification.** Verify through the request path: `curl` against `bun run dev`, hitting POST actions and not just GET pages — that's where Bun-vs-Node and Pug-vs-Svelte issues surface.
- **The notes feature needs a D1 binding** (`event.platform.env.DB`, supplied by adapter-cloudflare's platform proxy in dev), so it has no unit test here; exercise it through `bun run db:migrate` + the dev server. Deploys are user-gated.
- **`route({ cache })` hits only show on a deployed Worker.** The dev platform proxy's Cache API is a no-op, so `x-norns-cache` is always `miss` locally; `ETag` / 304 handling works everywhere.
- **Braces in Pug text are Svelte expressions.** `code tronSerializer({ columnar: true })` fails to compile (`Expected token }`); write prose without literal `{ }` or use `{'{'}`.

### Verification workflow — run before claiming done

1. **`bun run lint`** — must show 0 errors. `--json` for machine-readable output.
2. **`bun run check`** — must exit 0. Pug and Civet errors point at the line you wrote; Svelte errors inside Pug-rendered markup are reported against the preprocessed output (see `norns diag --template`). `--json` available.
3. **`bun run build`** — the final word on whether everything compiles.
4. **`curl` through the dev server** — for any request-path change. Hit the real route, including POST/form actions.

### Things AI tends to get wrong here

- **Don't introduce ORMs.** SQL via `better-sqlite3`, hand-written.
- **Don't add `bcrypt`/`argon2`.** Passwords via `node:crypto.scrypt`. `Bun.password.hash` is undefined when Vite launches under Node.
- **Don't call `new Database(...)` in multiple modules.** A single owner (a feature's `server/module.c`) registers `db` in the DI container; everyone else calls `c.resolve('db')`.
- **In `vite.config.js`, set `server.allowedHosts: true`** when behind any reverse proxy in dev (otherwise Vite blocks with HTML "Blocked request").
- **Container env vars are read at create time.** `podman-compose restart` does NOT pick up `.env` changes — use `up -d --force-recreate <service>`.
