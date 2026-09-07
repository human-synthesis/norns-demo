import { createRequire } from 'node:module';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { nornsAutoImport } from '@human-synthesis/norns/auto-import';
import { nornsCivetPlugin, pugTailwindExtract } from '@human-synthesis/norns/vite';
import { presetUI } from '@human-synthesis/norns-ui/auto-import';

const ui = presetUI();

// Installed norns-ui version, surfaced in the layout footer at build time.
const uiVersion = createRequire(import.meta.url)('@human-synthesis/norns-ui/package.json').version;

export default defineConfig({
	plugins: [
		// Scan .n files for Pug class shorthand and emit a sidecar file
		// (node_modules/.cache/norns/tailwind-pug-classes.html) that app.css
		// references via `@source`. Closes Tailwind v4's extractor blind spot on
		// `.cls.cls(` chains.
		pugTailwindExtract(),
		nornsCivetPlugin(),
		// Vite-plugin half of the auto-importer (the Svelte-preprocessor half is
		// registered in svelte.config.js). `exportGlobs` is not enabled, so
		// project code (facades, schemas, services, stores) is always imported
		// explicitly.
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
	define: { __NORNS_UI_VERSION__: JSON.stringify(uiVersion) },
	resolve: { dedupe: ['@sveltejs/kit'] },
	ssr: { noExternal: ['@human-synthesis/norns'] }
});
