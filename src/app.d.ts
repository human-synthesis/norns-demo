/// <reference types="@cloudflare/workers-types" />

// Cloudflare Workers bindings. SvelteKit 3's adapter-cloudflare no longer puts
// them on `event.platform`; they are read from `cloudflare:workers` (`env`,
// `waitUntil`, …) and `caches` is a global. `DB` is the D1 database declared
// in wrangler.toml; both notes examples read it through `env.DB`.
declare global {
	namespace Cloudflare {
		interface Env {
			DB: D1Database;
		}
	}
}

export {};
