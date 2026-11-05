import { fail, redirect } from '@sveltejs/kit';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import * as notes from '$lib/svelte/notes/service';
import { db } from '$lib/svelte/notes/db';
import { createNoteSchema } from '$lib/svelte/notes/schema';

export const load: PageServerLoad = async () => ({
	notes: await notes.list(db())
});

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const result = v.safeParse(createNoteSchema, {
			title: data.get('title')?.toString(),
			body: data.get('body')?.toString() ?? ''
		});
		if (!result.success) {
			return fail(400, { errors: result.issues, values: Object.fromEntries(data) });
		}
		const id = await notes.create(db(), result.output);
		throw redirect(303, `/examples/svelte/notes/${id}`);
	}
};
