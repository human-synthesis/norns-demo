<script lang="ts">
	import './tic-tac-toe.css';
	import Game from './Game.svelte';
</script>

<section class="animate-in space-y-3">
	<a class="text-sm nav-link inline-flex items-center gap-1" href="/examples/svelte">← Svelte examples</a>
	<h1 class="text-4xl font-bold tracking-tight leading-none">
		<span class="gradient-text">Tic Tac Toe</span>
	</h1>
	<p class="text-neutral-600 max-w-prose leading-relaxed">
		Click a cell to play. Switch between two players or take on the computer. State lives in Svelte stores written in
		<code>.ts</code>; the AI is a small heuristic in the same module.
	</p>
</section>

<section class="animate-in-delayed pt-10">
	<Game />
</section>
