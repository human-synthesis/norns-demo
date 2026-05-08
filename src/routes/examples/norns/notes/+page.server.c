export load := page.load
	handler: ({ container }) =>
		notes: notes(container).list()

export actions := page.actions
	create:
		input: createNoteSchema
		run: ({ input, container }) =>
			id := notes(container).create input
			throw redirect 303, `/examples/norns/notes/${id}`
