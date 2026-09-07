import { route } from '@human-synthesis/norns/server'
import { tronSerializer } from '@human-synthesis/norns-tron/server'
import { notes } from '$lib/norns/notes/server/public'

// GET /api/notes/export — the whole table, agent-facing.
//
// SELF-DESCRIBING TRON: the payload carries its own class / enum / table
// declarations, so a consumer that has never seen the contract (an LLM
// tool, a third party) can read it cold, at roughly 40% fewer tokens than
// the JSON it gets without the Accept header:
//
//   curl -H 'Accept: application/tron' https://norns-demo.humansynthesis.ai/api/notes/export
//
// Cached for a minute per Accept variant (JSON and TRON are separate
// entries); repeat calls answer from the edge cache or with a 304.
export GET := route
	serializer: tronSerializer()
	cache: { ttl: 60 }
	handler: async ({ container }) =>
		await notes(container).list()
