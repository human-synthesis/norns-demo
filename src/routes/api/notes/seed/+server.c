import { route } from '@human-synthesis/norns/server'
import { notes } from '$lib/norns/notes/server/public'
import { seedSchema } from '$lib/norns/notes/shared/schema'

// POST /api/notes/seed { count } — fills the table with demo rows so the
// list / picker / stats examples have something to show.
export POST := route
	input: seedSchema
	handler: async ({ input, container }) =>
		inserted: await notes(container).seed input.count
