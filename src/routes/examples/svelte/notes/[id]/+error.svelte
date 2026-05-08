<script lang="ts">
	import { page } from '$app/state';
</script>

<section class="animate-in space-y-3">
	<h1 class="text-3xl font-bold tracking-tight leading-none">Note not found</h1>
	<p class="text-neutral-600">{page.error?.message ?? 'this note does not exist'}</p>
	<a class="text-sm nav-link inline-flex items-center gap-1" href="/examples/svelte/notes">← back to all notes</a>
</section>
