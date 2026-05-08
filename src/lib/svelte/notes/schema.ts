import * as v from 'valibot';

export const createNoteSchema = v.object({
	title: v.pipe(v.string(), v.trim(), v.minLength(1, 'title is required')),
	body: v.optional(v.string(), '')
});

export const updateNoteSchema = createNoteSchema;
