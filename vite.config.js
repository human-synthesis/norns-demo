import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { nornsAutoImport } from '@human-synthesis/norns/auto-import';
import { nornsCivetPlugin } from '@human-synthesis/norns/vite';
import { presetUI } from '@human-synthesis/norns-ui/auto-import';

const ui = presetUI();

export default defineConfig({
	plugins: [
		nornsCivetPlugin(),
		// `helpers` is omitted (defaults preserved). When the UI preset starts
		// shipping helpers (e.g. `toast()` in Phase 3), nornsAutoImport will
		// need a `presets` or `additionalHelpers` option to merge with defaults
		// without replacing them. Until then, `components` is the only preset
		// channel.
		nornsAutoImport({
			exportDirs: ['src/lib', 'src/routes'],
			components: ui.components
		}),
		tailwindcss(),
		sveltekit()
	]
});
