<script lang="ts">
	import './../notes.css';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let deleteOpen = $state(false);

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
	<a class="text-sm nav-link inline-flex items-center gap-1" href="/examples/svelte/notes">← all notes</a>
	<h1 class="text-3xl font-bold tracking-tight leading-none">{data.note.title}</h1>
	<p class="text-sm text-neutral-500">updated {new Date(data.note.updated_at).toLocaleString()}</p>
</section>

<section class="animate-in-delayed pt-8 space-y-6">
	<form class="form" method="POST" action="?/update">
		<div class="field">
			<label class="field-label" for="title">Title <span class="field-required">*</span></label>
			<input
				class="input {errors.title ? 'input-err' : ''}"
				id="title"
				name="title"
				value={data.note.title}
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
			<textarea class="textarea" id="body" name="body" rows="6">{data.note.body}</textarea>
		</div>

		<div class="flex items-center gap-3">
			<button class="btn btn-primary" type="submit">Save</button>
			{#if form?.saved}
				<span class="text-sm text-green-600">saved</span>
			{/if}
		</div>
	</form>

	<button class="btn btn-danger" type="button" onclick={() => (deleteOpen = true)}>Delete note</button>

	{#if deleteOpen}
		<div class="dialog-overlay" data-state="open" onclick={() => (deleteOpen = false)}></div>
		<div
			class="dialog-content"
			data-state="open"
			role="dialog"
			aria-modal="true"
			aria-labelledby="del-title"
			aria-describedby="del-desc"
		>
			<h2 class="dialog-title" id="del-title">Delete this note?</h2>
			<p class="dialog-description" id="del-desc">This cannot be undone.</p>
			<div class="dialog-actions">
				<button class="btn btn-ghost" type="button" onclick={() => (deleteOpen = false)}>Cancel</button>
				<form method="POST" action="?/delete" style="display:inline">
					<button class="btn btn-danger" type="submit">Delete</button>
				</form>
			</div>
		</div>
	{/if}
</section>
