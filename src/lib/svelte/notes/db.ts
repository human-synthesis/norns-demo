export type Note = {
	id: number;
	title: string;
	body: string;
	created_at: number;
	updated_at: number;
};

// Cloudflare D1. The binding is per request: wrangler injects it in
// production and adapter-cloudflare's platform proxy injects it under
// `vite dev`. There is no process-wide connection to open.
export function db(platform: App.Platform | undefined): D1Database {
	const binding = platform?.env?.DB;
	if (!binding) {
		throw new Error(
			'D1 binding `DB` is missing — check [[d1_databases]] in wrangler.toml and run through wrangler or the adapter platform proxy'
		);
	}
	return binding;
}
