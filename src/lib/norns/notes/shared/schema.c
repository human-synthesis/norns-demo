import * as v from 'valibot'

export createNoteSchema := v.object
	title: v.pipe v.string(), v.trim(), v.minLength(1, 'title is required')
	body: v.optional v.string(), ''

export updateNoteSchema := createNoteSchema

export type CreateNoteInput = v.InferOutput<typeof createNoteSchema>
export type UpdateNoteInput = v.InferOutput<typeof updateNoteSchema>
