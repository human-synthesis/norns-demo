<script lang="ts">
	import type { Cell } from './store';

	let {
		value,
		isWinning = false,
		disabled = false,
		onclick
	}: {
		value: Cell;
		isWinning?: boolean;
		disabled?: boolean;
		onclick: () => void;
	} = $props();
</script>

<button
	type="button"
	{onclick}
	{disabled}
	class="tt-cell {value ? 'tt-cell-' + value.toLowerCase() : ''} {isWinning ? 'tt-cell-winning' : ''}"
	aria-label={value ? 'cell with ' + value : 'empty cell'}
>
	{#if value}
		<span class="tt-mark">{value}</span>
	{/if}
</button>
