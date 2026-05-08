import adapter from '@sveltejs/adapter-auto';
import { nornsAutoImport } from '@human-synthesis/norns/auto-import';
import { nornsConfig } from '@human-synthesis/norns/config';
import { nornsPreprocess } from '@human-synthesis/norns/preprocess';
import { presetUI } from '@human-synthesis/norns-ui/auto-import';

const ui = presetUI();

// Wrap a preprocessor so its hooks become no-ops on node_modules files.
// Needed for libraries like Bits UI that ship `<script lang="ts">` source —
// our pipeline's svelte-preprocess TS handler corrupts their destructured
// `$props()` declarations. With this guard, node_modules `.svelte` files
// fall through to vite-plugin-svelte's native lang="ts" handling.
const scopeToProject = (p) => ({
	name: p.name,
	markup: p.markup ? (args) => (args.filename?.includes('/node_modules/') ? null : p.markup(args)) : undefined,
	script: p.script ? (args) => (args.filename?.includes('/node_modules/') ? null : p.script(args)) : undefined,
	style: p.style ? (args) => (args.filename?.includes('/node_modules/') ? null : p.style(args)) : undefined
});

export default nornsConfig({
	preprocess: [
		...nornsPreprocess().map(scopeToProject),
		scopeToProject(
			nornsAutoImport({
				componentDirs: ['src/lib/components', 'src/routes'],
				exportDirs: ['src/lib', 'src/routes'],
				components: ui.components
			})
		)
	],
	kit: {
		adapter: adapter()
	}
});
