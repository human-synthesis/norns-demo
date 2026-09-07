import * as v from 'valibot'
import { tronSchemaFromValibot } from '@human-synthesis/norns-tron/valibot'

export createNoteSchema := v.object
	title: v.pipe v.string(), v.trim(), v.minLength(1, 'title is required')
	body: v.optional v.string(), ''

export updateNoteSchema := createNoteSchema

export type CreateNoteInput = v.InferOutput<typeof createNoteSchema>
export type UpdateNoteInput = v.InferOutput<typeof updateNoteSchema>

// Row shape as served by /api/notes — the single source of truth for the
// TRON wire contract. Compiled once at module load (never per request).
export noteSchema := v.object
	id: v.number()
	title: v.string()
	body: v.string()
	created_at: v.number()
	updated_at: v.number()

export type NoteRow = v.InferOutput<typeof noteSchema>

// Schema-mode contract for the paged list: `{ data: NoteRow[], total, page,
// pageSize }` with the rows projected to positional arrays and tagged
// `#notes.v1`. The client registers the same object (see client/api.c).
export noteWire := tronSchemaFromValibot noteSchema, { id: 'notes.v1', path: '$.data' }

// Columns a client may sort the list by — fed to listQuery() on the server
// and offered as sortable columns by the table page.
export noteSortKeys := ['updated_at', 'created_at', 'title'] as const
export type NoteSortKey = typeof noteSortKeys[number]

// Picker option, as served by /api/notes/search.
export type NoteOption =
	value: string
	label: string

// One row of /api/notes/stats — all numeric, so the endpoint can serve the
// columnar form that decodes straight into a Float64Array.
export type NoteStatsRow =
	day: number
	count: number
	chars: number

// Bulk seed input (POST /api/notes/seed).
export seedSchema := v.object
	count: v.optional v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(2000)), 500

export type SeedInput = v.InferOutput<typeof seedSchema>
