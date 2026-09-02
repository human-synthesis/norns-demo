# CRM sample (D-01)

Spec-first sample app: 4 modules, 8 entities (Company, Tag, Contact, Note, Deal,
Lead, Activity, Task), authored purely as TRON specs in `specs/`. Everything under
`.norns/generated/` is emitted by the kernel and gitignored; `src/` holds custom
code only (the `reprice` action body, the D-05 retrofit's mailer job / Stripe
webhook bodies, and the `statusCell` snippet). `tests/smoke.test.js` is a 13-line
bridge — e2e coverage is derived from the specs (smoke matrix + `pages.*.expect`).

## Regenerate

```sh
norns validate specs
norns generate specs      # → .norns/generated/ (27 files)
norns migrate gen specs   # → migrations/<module>/ (committed)
```

Specs were authored via `packages/norns/scripts/write-crm-specs.mjs` in the norns
repo and stay canonical under `formatCanonical`.

## Measured custom ratio

| | lines |
| --- | --- |
| specs | 192 |
| generated (`.c`/`.n`) | 649 |
| custom (`src/`) | 12 |

Custom ratio: **1.8%** of app code (kill criterion #1 threshold: 25%).

## Not wired yet

- Kit app shell (package.json / svelte.config / wrangler) — lands with A-01 + R-02.
- better-auth `core` module (R-10); specs reference `core.Entity.User`.
- Cloudflare deployment (Phase-1 exit) — user-gated.
