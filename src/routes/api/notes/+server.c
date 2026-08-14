import { route } from '@human-synthesis/norns/server'
import { tronSerializer } from '@human-synthesis/norns-tron/server'
import { notes } from '$lib/norns/notes/server/public'
import { createNoteSchema, noteWire } from '$lib/norns/notes/shared/schema'

// GET /api/notes — demonstrates SCHEMA-PRELOADED TRON, the fastest mode.
//
// Both ends import the same compiled contract (noteWire, derived from the
// feature's valibot schema in shared/schema.c), so no shape declarations
// travel on the wire and the response is tagged `#notes.v1`. Clients without
// `Accept: application/tron` still get plain JSON.
//
//   import { createApi } from '@human-synthesis/norns-tron/client'
//   import { noteWire } from '$lib/norns/notes/shared/schema'
//   api := createApi { fetch }
//   { data } := await api.get '/api/notes'        // auto-decoded either way
export GET := route
	serializer: tronSerializer({ schema: noteWire })
	handler: ({ container }) =>
		data: notes(container).list()

// POST /api/notes — same validation as the form action, but as an API
// endpoint. Accepts JSON, form, or TRON request bodies.
export POST := route
	input: createNoteSchema
	handler: ({ input, container }) =>
		id: Number notes(container).create input
