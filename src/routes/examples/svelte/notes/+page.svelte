<script lang="ts">
	import './notes.css';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const errors = $derived.by(() => {
		const out: Record<string, string> = {};
		for (const issue of form?.errors ?? []) {
			const name = issue.path?.[0]?.key as string | undefined;
			if (name && !out[name]) out[name] = issue.message;
		}
		return out;
	});
</script>

<section class="animate-in space-y-3">
	<a class="text-sm nav-link inline-flex items-center gap-1" href="/examples/svelte">← Svelte examples</a>
	<h1 class="text-4xl font-bold tracking-tight leading-none">
		<span class="gradient-text">Notes</span>
	</h1>
	<p class="text-neutral-600 max-w-prose leading-relaxed">
		SQLite-backed CRUD with SvelteKit form <code>actions</code> and SSR <code>load</code> — no client-side fetch.
	</p>
</section>

<section class="animate-in-delayed pt-8 space-y-6">
	<form class="form" method="POST" action="?/create">
		<div class="field">
			<label class="field-label" for="title">Title <span class="field-required">*</span></label>
			<input
				class="input {errors.title ? 'input-err' : ''}"
				id="title"
				name="title"
				placeholder="title…"
				value={form?.values?.title ?? ''}
				required
				aria-invalid={errors.title ? 'true' : undefined}
				aria-describedby={errors.title ? 'title-error' : undefined}
			/>
			{#if errors.title}
				<p class="field-error" role="alert" id="title-error">{errors.title}</p>
			{/if}
		</div>

		<div class="field">
			<label class="field-label" for="body">Body</label>
			<textarea
				class="textarea"
				id="body"
				name="body"
				placeholder="body (optional)…"
				rows="3">{form?.values?.body ?? ''}</textarea>
			<p class="field-help">Optional</p>
		</div>

		<button class="btn btn-primary" type="submit">Create note</button>
	</form>

	{#if data.notes.length === 0}
		<p class="note-empty">no notes yet — create one above</p>
	{:else}
		<ul class="list-none p-0 m-0 space-y-2">
			{#each data.notes as note (note.id)}
				<li class="note-card">
					<a class="note-link" href="/examples/svelte/notes/{note.id}">
						<div class="note-card-title">{note.title}</div>
						{#if note.body}
							<div class="note-card-snippet">{note.body}</div>
						{/if}
						<div class="note-card-meta">updated {new Date(note.updated_at).toLocaleString()}</div>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</section>
