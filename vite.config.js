import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { nornsAutoImport } from '@human-synthesis/norns/auto-import';
import { nornsCivetPlugin, pugTailwindExtract } from '@human-synthesis/norns/vite';
import { presetUI } from '@human-synthesis/norns-ui/auto-import';

const ui = presetUI();

export default defineConfig({
	plugins: [
		// Scan .n files for Pug class shorthand and emit a sidecar file
		// Tailwind can pick up via `@source "./.tailwind-pug-classes.html"`.
		// Closes Tailwind v4's extractor blind spot on `.cls(` chains.
		pugTailwindExtract(),
		nornsCivetPlugin(),
		// exportDirs was removed in @human-synthesis/norns 0.0.11 — feature
		// exports (notes, schemas, services) are imported explicitly now.
		nornsAutoImport({
			components: ui.components
		}),
		tailwindcss(),
		sveltekit()
	],
	// In workspace mode @human-synthesis/norns is a symlink into the kit fork,
	// which has its own @sveltejs/kit under pnpm. Left external, its server
	// modules would load THAT copy (realpath resolution) and crash with
	// "Could not get the request store" — two kit instances, two
	// AsyncLocalStorage worlds. Bundling norns through Vite dedupes its kit
	// imports onto the app's single copy.
	// Accept reverse-proxied Host headers in dev (norns lint: vite/allowed-hosts).
	server: { allowedHosts: true },
	resolve: { dedupe: ['@sveltejs/kit'] },
	ssr: { noExternal: ['@human-synthesis/norns'] }
});
