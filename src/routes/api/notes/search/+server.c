import { route, listQuery } from '@human-synthesis/norns/server'
import { notes } from '$lib/norns/notes/server/public'

// GET /api/notes/search?q= — remote option source for Autocomplete /
// MultiSelect. Returns at most `pageSize` `{ value, label }` options, so the
// picker never needs the whole table in the page. Small responses ship as
// plain JSON automatically (TRON only pays off above ~1 KB).
export GET := route
	query: listQuery { pageSize: 20, maxPageSize: 50 }
	handler: async ({ query, container }) =>
		data: await notes(container).search query.q, query.pageSize
