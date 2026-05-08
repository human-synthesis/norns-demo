<script lang="ts">
	import Board from './Board.svelte';
	import {
		board,
		mode,
		turn,
		result,
		stats,
		play,
		reset,
		setMode,
		incrementStats,
		type Mode
	} from './store';
	import { scheduleAiMove } from './ai';

	let notified = $state(false);

	$effect(() => {
		if ($result !== null) {
			if (!notified) {
				incrementStats($result.winner);
				notified = true;
			}
		} else {
			notified = false;
		}
	});

	function handleClick(idx: number) {
		play(idx);
		scheduleAiMove();
	}

	function handleReset() {
		reset();
	}

	function switchMode(m: Mode) {
		setMode(m);
	}
</script>

<div class="tt-game space-y-6">
	<div class="tt-toolbar">
		<div class="tt-stats">
			<div class="tt-stat">
				<div class="tt-stat-label">X</div>
				<div class="tt-stat-value">{$stats.X}</div>
			</div>
			<div class="tt-stat-divider"></div>
			<div class="tt-stat">
				<div class="tt-stat-label">O</div>
				<div class="tt-stat-value">{$stats.O}</div>
			</div>
			<div class="tt-stat-divider"></div>
			<div class="tt-stat">
				<div class="tt-stat-label">Draws</div>
				<div class="tt-stat-value">{$stats.draw}</div>
			</div>
		</div>
		<div class="tt-mode-bar">
			<button
				class="tt-mode {$mode === '1v1' ? 'tt-mode-active' : ''}"
				onclick={() => switchMode('1v1')}
			>1v1</button>
			<button
				class="tt-mode {$mode === 'vs-pc' ? 'tt-mode-active' : ''}"
				onclick={() => switchMode('vs-pc')}
			>vs PC</button>
		</div>
	</div>

	<Board
		cells={$board}
		winningLine={$result?.line ?? []}
		disabled={($mode === 'vs-pc' && $turn === 'O') || !!$result}
		onCellClick={handleClick}
	/>

	<div class="tt-bottom">
		<div class="tt-status {$result?.winner ? 'tt-status-win' : ($result ? 'tt-status-draw' : '')}">
			{$result?.winner ? 'Player ' + $result.winner + ' wins!' : ($result ? "It's a draw" : 'Player ' + $turn + "'s turn")}
		</div>
		<button class="tt-reset" onclick={handleReset}>Reset</button>
	</div>
</div>
