import { route, listQuery, listResult } from '@human-synthesis/norns/server'
import { tronSerializer } from '@human-synthesis/norns-tron/server'
import { notes } from '$lib/norns/notes/server/public'
import { createNoteSchema, noteWire, noteSortKeys } from '$lib/norns/notes/shared/schema'

// GET /api/notes?page=&pageSize=&sort=&dir=&q= — the paged list behind the
// DataTable example. Demonstrates SCHEMA-PRELOADED TRON, the fastest mode:
// both ends import the same compiled contract (noteWire, derived from the
// feature's valibot schema in shared/schema.c), so no shape declarations
// travel on the wire and the response is tagged `#notes.v1`. Clients
// without `Accept: application/tron` still get plain JSON.
//
// listQuery() validates the paging/sorting params (unknown sort keys are a
// 400) and listResult() builds the `{ data, total, page, pageSize }`
// envelope that `path: '$.data'` and norns-ui's useList() expect.
//
//   import { createApi } from '@human-synthesis/norns-tron/client'
//   api := createApi { schemas: [noteWire] }
//   { data, total } := await api.get '/api/notes?page=2&sort=title'
export GET := route
	query: listQuery { sort: [...noteSortKeys], defaultSort: 'updated_at', defaultDir: 'desc', pageSize: 25, maxPageSize: 200 }
	serializer: tronSerializer({ schema: noteWire })
	handler: async ({ query, container }) =>
		{ data, total } := await notes(container).page query
		listResult query, data, total

// POST /api/notes — same validation as the form action, but as an API
// endpoint. Accepts JSON, form, or TRON request bodies; a validation
// failure is a 400 whose body carries `issues`, which norns-ui's Form maps
// onto the matching <Field name="…">.
export POST := route
	input: createNoteSchema
	handler: async ({ input, container }) =>
		id: await notes(container).create input
