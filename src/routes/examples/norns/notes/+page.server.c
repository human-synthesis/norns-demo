import { notes } from '$lib/norns/notes/server/public'
import { createNoteSchema } from '$lib/norns/notes/shared/schema'

export load := page.load
	handler: async ({ container }) =>
		notes: await notes(container).list()

export actions := page.actions
	create:
		input: createNoteSchema
		run: async ({ input, container }) =>
			id := await notes(container).create input
			throw redirect 303, `/examples/norns/notes/${id}`
