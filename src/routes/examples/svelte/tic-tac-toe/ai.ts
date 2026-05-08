import { get } from 'svelte/store';
import { board, turn, mode, result, play, type Cell, type Player } from './store';

const LINES: number[][] = [
	[0, 1, 2], [3, 4, 5], [6, 7, 8],
	[0, 3, 6], [1, 4, 7], [2, 5, 8],
	[0, 4, 8], [2, 4, 6]
];

// Find a cell where placing `player` would complete a line.
function findWinningCell(b: Cell[], player: Player): number | null {
	for (const [a, x, y] of LINES) {
		const cells = [b[a], b[x], b[y]];
		const pCount = cells.filter((c) => c === player).length;
		const eIdx = cells.indexOf(null);
		if (pCount === 2 && eIdx !== -1) return [a, x, y][eIdx];
	}
	return null;
}

function pickRandom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

// Heuristic: win > block > center > corner > side.
function chooseMove(b: Cell[], player: Player): number | null {
	const opponent: Player = player === 'X' ? 'O' : 'X';
	const winning = findWinningCell(b, player);
	if (winning !== null) return winning;
	const block = findWinningCell(b, opponent);
	if (block !== null) return block;
	if (b[4] === null) return 4;
	const corners = [0, 2, 6, 8].filter((i) => b[i] === null);
	if (corners.length) return pickRandom(corners);
	const sides = [1, 3, 5, 7].filter((i) => b[i] === null);
	if (sides.length) return pickRandom(sides);
	return null;
}

// Public: trigger an AI move on a delay if conditions are met.
export function scheduleAiMove(): void {
	if (get(mode) !== 'vs-pc' || get(turn) !== 'O' || get(result) !== null) return;
	setTimeout(() => {
		const move = chooseMove(get(board), 'O');
		if (move !== null) play(move);
	}, 400);
}
