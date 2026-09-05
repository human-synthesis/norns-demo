# norns-demo

**Demo app for the Norns framework.** Migrated from `norns-app`, which now ships as a minimal starter template.

This repo shows non-trivial Norns idioms end-to-end:
- **Notes** — SQLite + dynamic routes + form actions + valibot validation + error pages + SSR `load`. Uses the runtime's DI container, `public.c` boundary, and `page.load` / `page.actions` wrappers.
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
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — local SQLite

## Setup

```sh
git clone https://github.com/human-synthesis/norns-demo
cd norns-demo
bun install
bun run migrate up   # apply migrations to data/notes.db
```

## Run

```sh
bun run dev          # dev server at http://localhost:5173
bun run build        # production build
bun run preview      # preview production build

bun run migrate up        # apply pending migrations
bun run migrate status    # list applied + pending
bun run migrate create <feature>/<name>   # scaffold a new migration
```

## Check

```sh
bun run lint         # norns lint: scans .n / .c / vite.config for known Civet + Pug pitfalls
bun run check        # svelte-kit sync + svelte-check over the .js / .ts / .svelte parts
```

`svelte-check` covers the vanilla `examples/svelte/` side and any `.js` / `.ts` files; it
does not read `.n` or `.c`. The Norns side is covered by `norns lint` and the compile step
in `bun run build`. This repo has no test suite of its own; the framework suites run with
`bun test` inside each framework repo (`norns/packages/norns`, `norns-core/packages/norns-core`,
`norns-ui`, `norns-tron`, `norns-mcp`).

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
        notes/                      # SQLite + form actions + DI + valibot
          +page.n / +page.server.c
          [id]/+page.n, +page.server.c, +error.n
        tic-tac-toe/                # components + Svelte stores + AI heuristic
          +page.n, Game.n, Board.n, Cell.n, store.c, ai.c
      svelte/                       # Vanilla SvelteKit version of the same examples
        notes/, tic-tac-toe/
  lib/
    components/Header.n
    norns/                          # framework-managed feature folders
      notes/
        server/{module,repo,service,public}.c
        shared/schema.c
    svelte/                         # vanilla version of the data layer
      notes/{db,repo,service,schema}.ts
migrations/
  notes/                            # SQL migrations, applied via `bun run migrate up`
```

## License

MIT © Daniel Teodoroiu / [Human Synthesis](https://humansynthesis.ai). Built on top of [SvelteKit](https://github.com/sveltejs/kit) and [Svelte](https://github.com/sveltejs/svelte) © Svelte Contributors, MIT licensed.
