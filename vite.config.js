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
		nornsAutoImport({
			exportDirs: ['src/lib', 'src/routes'],
			components: ui.components
		}),
		tailwindcss(),
		sveltekit()
	]
});
