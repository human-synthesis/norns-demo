import adapter from '@sveltejs/adapter-cloudflare';
import { nornsAutoImport } from '@human-synthesis/norns/auto-import';
import { nornsConfig } from '@human-synthesis/norns/config';
import { nornsPreprocess } from '@human-synthesis/norns/preprocess';
import { presetUI } from '@human-synthesis/norns-ui/auto-import';

const ui = presetUI();

// Wrap a preprocessor so its hooks become no-ops on third-party node_modules
// files. Needed for libraries like Bits UI that ship `<script lang="ts">`
// source — our pipeline's svelte-preprocess TS handler corrupts their
// destructured `$props()` declarations. With this guard, third-party
// `.svelte` files fall through to vite-plugin-svelte's native lang="ts"
// handling.
//
// `@human-synthesis/*` packages are an exception: norns-ui (and any future
// `.n`-source UI lib in that scope) ships Civet + Pug source under
// node_modules and *requires* this pipeline to compile. Letting their path
// through keeps `Btn`, `Field`, etc. building correctly when imported by
// a consumer app.
const isThirdPartyNodeModule = (file) =>
	!!file &&
	file.includes('/node_modules/') &&
	!file.includes('/node_modules/@human-synthesis/');
const scopeToProject = (p) => ({
	name: p.name,
	markup: p.markup ? (args) => (isThirdPartyNodeModule(args.filename) ? null : p.markup(args)) : undefined,
	script: p.script ? (args) => (isThirdPartyNodeModule(args.filename) ? null : p.script(args)) : undefined,
	style: p.style ? (args) => (isThirdPartyNodeModule(args.filename) ? null : p.style(args)) : undefined
});

export default nornsConfig({
	preprocess: [
		...nornsPreprocess().map(scopeToProject),
		scopeToProject(
			nornsAutoImport({
				components: ui.components
			})
		)
	],
	kit: {
		adapter: adapter()
	}
});
