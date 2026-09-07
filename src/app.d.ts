/// <reference types="@cloudflare/workers-types" />

// Cloudflare Workers bindings exposed on `event.platform`. `DB` is the D1
// database declared in wrangler.toml; both notes examples read it from here.
declare global {
	namespace App {
		interface Platform {
			env: {
				DB: D1Database;
			};
			context: ExecutionContext;
			caches: CacheStorage & { default: Cache };
			cf?: IncomingRequestCfProperties;
		}
	}
}

export {};
