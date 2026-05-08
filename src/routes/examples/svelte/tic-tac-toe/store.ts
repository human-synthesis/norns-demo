import { writable, derived, get } from 'svelte/store';

const LINES: number[][] = [
	[0, 1, 2], [3, 4, 5], [6, 7, 8],
	[0, 3, 6], [1, 4, 7], [2, 5, 8],
	[0, 4, 8], [2, 4, 6]
];

export type Player = 'X' | 'O';
export type Cell = Player | null;
export type Mode = '1v1' | 'vs-pc';
export type Result = { winner: Player | null; line: number[] } | null;

const newBoard = (): Cell[] => Array(9).fill(null);

export const mode = writable<Mode>('1v1');
export const board = writable<Cell[]>(newBoard());
export const turn = writable<Player>('X');
export const stats = writable({ X: 0, O: 0, draw: 0 });

// null while game is in progress; { winner: 'X' | 'O' | null, line: [...] } when over.
// winner = null with all cells filled means draw.
export const result = derived(board, ($b): Result => {
	for (const [a, x, y] of LINES) {
		if ($b[a] !== null && $b[a] === $b[x] && $b[x] === $b[y]) {
			return { winner: $b[a], line: [a, x, y] };
		}
	}
	if ($b.every((c) => c !== null)) return { winner: null, line: [] };
	return null;
});

export function play(idx: number): void {
	if (get(result) !== null) return;
	const b = get(board);
	if (b[idx] !== null) return;
	const t = get(turn);
	const next = [...b];
	next[idx] = t;
	board.set(next);
	turn.set(t === 'X' ? 'O' : 'X');
}

export function reset(): void {
	board.set(newBoard());
	turn.set('X');
}

export function setMode(m: Mode): void {
	mode.set(m);
	reset();
}

export function incrementStats(winner: Player | null): void {
	const key = winner ?? 'draw';
	stats.update((s) => ({ ...s, [key]: (s as Record<string, number>)[key] + 1 }));
}
