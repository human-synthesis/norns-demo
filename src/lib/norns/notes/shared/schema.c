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

export noteWire := tronSchemaFromValibot noteSchema, { id: 'notes.v1', path: '$.data' }
