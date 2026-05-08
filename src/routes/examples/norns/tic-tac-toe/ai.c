LINES := [
	[0, 1, 2], [3, 4, 5], [6, 7, 8]
	[0, 3, 6], [1, 4, 7], [2, 5, 8]
	[0, 4, 8], [2, 4, 6]
]

// Find a cell where placing `player` would complete a line.
findWinningCell := (b, player) =>
	for [a, x, y] of LINES
		cells := [b[a], b[x], b[y]]
		line := [a, x, y]
		pCount := cells.filter((c) => c is player).length
		eIdx := cells.indexOf null
		if pCount is 2 and eIdx !== -1
			return line[eIdx]
	null

pickRandom := (arr) =>
	arr[Math.floor(Math.random() * arr.length)]

// Heuristic: win > block > center > corner > side.
chooseMove := (b, player) =>
	opponent := if player is 'X' then 'O' else 'X'
	winning := findWinningCell b, player
	return winning if winning?
	block := findWinningCell b, opponent
	return block if block?
	return 4 if b[4] is null
	corners := [0, 2, 6, 8].filter (i) => b[i] is null
	return pickRandom corners if corners.length
	sides := [1, 3, 5, 7].filter (i) => b[i] is null
	return pickRandom sides if sides.length
	null

// Public: trigger an AI move on a delay if conditions are met.
export scheduleAiMove := =>
	return unless get(mode) is 'vs-pc' and get(turn) is 'O' and not get(result)?
	setTimeout (=>
		move := chooseMove get(board), 'O'
		play move if move?
	), 400
