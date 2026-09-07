import { notes } from '$lib/norns/notes/server/public'
import { updateNoteSchema } from '$lib/norns/notes/shared/schema'

export load := page.load
	handler: async ({ container, params }) =>
		id := Number params.id
		note := await notes(container).get id
		throw error 404, 'note not found' unless note
		{ note }

export actions := page.actions
	update:
		input: updateNoteSchema
		run: async ({ input, container, event }) =>
			id := Number event.params.id
			await notes(container).update id, input
			{ saved: true }

	delete:
		run: async ({ container, event }) =>
			await notes(container).remove Number(event.params.id)
			throw redirect 303, '/examples/norns/notes'
