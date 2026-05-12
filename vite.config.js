import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { nornsAutoImport } from '@human-synthesis/norns/auto-import';
import { nornsCivetPlugin } from '@human-synthesis/norns/vite';
import { presetUI } from '@human-synthesis/norns-ui/auto-import';
import { pugTailwindExtract } from './vite/pug-tailwind-extract.js';

const ui = presetUI();

export default defineConfig({
	plugins: [
		// Scan .n files for Pug class-shorthand and emit a safelist file the
		// Tailwind content extractor can read. Has to run before the Civet
		// plugin so it sees raw Pug, not the transformed Svelte output.
		pugTailwindExtract(),
		nornsCivetPlugin(),
		nornsAutoImport({
			exportDirs: ['src/lib', 'src/routes'],
			components: ui.components
		}),
		tailwindcss(),
		sveltekit()
	]
});
