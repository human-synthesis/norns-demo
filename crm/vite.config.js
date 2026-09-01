import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { nornsAutoImport } from '@human-synthesis/norns/auto-import';
import { nornsCivetPlugin, pugTailwindExtract } from '@human-synthesis/norns/vite';
import { presetUI } from '@human-synthesis/norns-ui/auto-import';

const ui = presetUI();

export default defineConfig({
	plugins: [
		nornsCivetPlugin(),
		// Tailwind v4's content scanner doesn't understand Pug's chained-class
		// shorthand (`.flex.items-center.p-4` reads as one dotted token and
		// gets dropped). This plugin walks `.n` files, extracts class candidates,
		// and writes them to `src/.tailwind-pug-classes.html`. app.css already
		// references that file via `@source`. See the README for details.
		pugTailwindExtract(),
		// `helpers` is omitted (defaults preserved). When the UI preset starts
		// shipping helpers (e.g. `toast()` in Phase 3), nornsAutoImport will
		// need a `presets` or `additionalHelpers` option to merge with defaults
		// without replacing them. Until then, `components` is the only preset
		// channel.
		// exportDirs was removed in @human-synthesis/norns 0.0.11 — feature
		// exports are imported explicitly.
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
	resolve: { dedupe: ['@sveltejs/kit'] },
	ssr: { noExternal: ['@human-synthesis/norns'] }
});
