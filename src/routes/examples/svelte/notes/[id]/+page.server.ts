import { error, fail, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import * as notes from '$lib/svelte/notes/service';
import { db } from '$lib/svelte/notes/db';
import { updateNoteSchema } from '$lib/svelte/notes/schema';

export const load: PageServerLoad = async ({ params }) => {
	const id = Number(params.id);
	const note = await notes.get(db(), id);
	if (!note) throw error(404, 'note not found');
	return { note };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const id = Number(params.id);
		const data = await request.formData();
		const result = v.safeParse(updateNoteSchema, {
			title: data.get('title')?.toString(),
			body: data.get('body')?.toString() ?? ''
		});
		if (!result.success) return fail(400, { errors: result.issues });
		await notes.update(db(), id, result.output);
		return { saved: true };
	},

	delete: async ({ params }) => {
		await notes.remove(db(), Number(params.id));
		throw redirect(303, '/examples/svelte/notes');
	}
};
