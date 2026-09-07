# norns-demo

**Demo app for the Norns framework.** Migrated from `norns-app`, which now ships as a minimal starter template.

This repo shows non-trivial Norns idioms end-to-end:
- **Notes** — Cloudflare D1 (SQLite) + dynamic routes + form actions + valibot validation + error pages + SSR `load`. Uses the runtime's DI container, `public.c` boundary, and `page.load` / `page.actions` wrappers.
- **Tic-tac-toe** — multi-component composition, `$props` with defaults, Svelte stores (`writable` / `derived`), `$state` / `$effect` runes, scoped CSS, and a small AI heuristic.

## Stack

- [Svelte 5](https://svelte.dev) — components and runes
- [SvelteKit 2](https://kit.svelte.dev) — file-system routing, SSR, endpoints
- [Pug](https://pugjs.org) — templates (in `.n` files)
- [Civet](https://civet.dev) — script language (in `.n` `<script>` blocks and `.c` files)
- [Tailwind CSS v4](https://tailwindcss.com) — styling
- [Vite](https://vitejs.dev) — bundler
- [bun](https://bun.sh) — runtime / package manager
- [`@human-synthesis/norns`](https://github.com/human-synthesis/norns) + [`norns-core`](https://github.com/human-synthesis/norns-core) — the framework
- [`@human-synthesis/norns-ui`](https://github.com/human-synthesis/norns-ui) — UI components
- [valibot](https://valibot.dev) — input validation
- [Cloudflare D1](https://developers.cloudflare.com/d1/) — SQLite at the edge; bound as `DB` in `wrangler.toml`
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) via `@sveltejs/adapter-cloudflare` — hosting (<https://norns-demo.humansynthesis.ai>)

## Setup

```sh
git clone https://github.com/human-synthesis/norns-demo
cd norns-demo
bun install
bun run db:migrate   # apply migrations to the local D1 (.wrangler/state/)
```

The dev server gets `event.platform.env.DB` from adapter-cloudflare's platform proxy, which
reads `wrangler.toml` and keeps a local D1 under `.wrangler/state/`. No Cloudflare account is
needed to run locally.

## Run

```sh
bun run dev          # dev server at http://localhost:5173
bun run build        # production build
bun run preview      # preview production build

bun run db:migrate        # apply pending migrations to the local D1
bun run db:migrate:remote # apply pending migrations to the production D1
bun run migrate create <feature>/<name>   # scaffold a new migration file (norns CLI)
```

## Deploy

Production is a Cloudflare Worker with static assets and a D1 database, configured in
`wrangler.toml`. `.github/workflows/deploy.yml` applies migrations and deploys on every push to
`main`; it needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo secrets. To deploy
by hand with a logged-in wrangler:

```sh
bun run db:migrate:remote
bun run deploy
```

## Check

```sh
bun run lint         # norns lint: Civet + Pug pitfall scan over .n / .c (templates and script blocks) + vite.config
bun run check        # norns check: preprocess + compile every .n / .c / .svelte through svelte.config.js
bun run check:svelte # svelte-kit sync + svelte-check over the vanilla .svelte / .ts side
bun run build        # full Vite build
```

`svelte-check` covers the vanilla `examples/svelte/` side and any `.js` / `.ts` files; it
does not read `.n` or `.c`. The Norns side is covered by `norns lint`, `norns check` and the
build. `CLAUDE.md` in this repo carries the Civet / Pug pitfalls and the verification order
for AI agents. This repo has no test suite of its own; the framework suites run with `bun test`
inside each framework repo (`norns/packages/norns`, `norns-core/packages/norns-core`,
`norns-ui`, `norns-tron`).

## What's in here

```
src/
  hooks.server.c                    # boots the norns runtime
  +layout.c, +layout.n              # app shell
  routes/
    +page.n                         # home
    examples/
      +page.n
      norns/                        # Norns version of the examples
        +page.n
        notes/                      # D1 + form actions + DI + valibot
          +page.n / +page.server.c
          [id]/+page.n, +page.server.c, +error.n
        tic-tac-toe/                # components + Svelte stores + AI heuristic
          +page.n, Game.n, Board.n, Cell.n, store.c, ai.c
      svelte/                       # Vanilla SvelteKit version of the same examples
        notes/, tic-tac-toe/
      ui/+page.n                    # norns-ui showcase — every component with live props
  lib/
    components/Header.n
    norns/                          # framework-managed feature folders
      notes/
        server/{module,repo,service,public}.c
        shared/schema.c
    svelte/                         # vanilla version of the data layer
      notes/{db,repo,service,schema}.ts
migrations/
  notes/                            # SQL migrations, applied via `bun run db:migrate`
wrangler.toml                       # Worker + D1 binding + custom domain
```

## License

MIT © Daniel Teodoroiu / [Human Synthesis](https://humansynthesis.ai). Built on top of [SvelteKit](https://github.com/sveltejs/kit) and [Svelte](https://github.com/sveltejs/svelte) © Svelte Contributors, MIT licensed.
