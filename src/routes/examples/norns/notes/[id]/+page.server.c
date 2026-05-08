export load := page.load
	handler: ({ container, params }) =>
		id := Number params.id
		note := notes(container).get id
		throw error 404, 'note not found' unless note
		{ note }

export actions := page.actions
	update:
		input: updateNoteSchema
		run: ({ input, container, event }) =>
			id := Number event.params.id
			notes(container).update id, input
			{ saved: true }

	delete:
		run: ({ container, event }) =>
			notes(container).remove Number(event.params.id)
			throw redirect 303, '/examples/norns/notes'
