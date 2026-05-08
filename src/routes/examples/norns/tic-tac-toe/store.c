LINES := [
	[0, 1, 2], [3, 4, 5], [6, 7, 8]
	[0, 3, 6], [1, 4, 7], [2, 5, 8]
	[0, 4, 8], [2, 4, 6]
]

newBoard := => Array(9).fill null

mode := writable '1v1'
board := writable newBoard()
turn := writable 'X'
stats := writable { X: 0, O: 0, draw: 0 }

// null while game is in progress; { winner: 'X' | 'O' | null, line: [...] } when over.
// winner = null with all cells filled means draw.
result := derived board, ($b) =>
	for [a, x, y] of LINES
		if $b[a]? and $b[a] is $b[x] and $b[x] is $b[y]
			return { winner: $b[a], line: [a, x, y] }
	if $b.every((c) => c?) then { winner: null, line: [] } else null

play := (idx) =>
	return if get(result)?
	$b := get board
	return if $b[idx]?
	$t := get turn
	next := [...$b]
	next[idx] = $t
	board.set next
	turn.set (if $t is 'X' then 'O' else 'X')

reset := =>
	board.set newBoard()
	turn.set 'X'

setMode := (m) =>
	mode.set m
	reset()

incrementStats := (winner) =>
	key := winner ?? 'draw'
	stats.update (s) =>
		next := { ...s }
		next[key] += 1
		next

export { mode, board, turn, stats, result, play, reset, setMode, incrementStats }
