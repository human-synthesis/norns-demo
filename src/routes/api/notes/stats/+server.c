import { route } from '@human-synthesis/norns/server'
import { tronSerializer } from '@human-synthesis/norns-tron/server'
import { notes } from '$lib/norns/notes/server/public'

// GET /api/notes/stats — notes per day as a purely numeric table.
//
// `columnar: true` emits the TRON form the WASM scanner reads straight into
// a Float64Array (`api.tape()` on the client): no row objects, ~3x faster
// than JSON.parse for charts and aggregations. `cache` adds Cache-Control +
// ETag and, on Workers, stores the encoded body in the edge cache so the
// query and the encoder run once per TTL.
export GET := route
	serializer: tronSerializer({ columnar: true })
	cache: { ttl: 30 }
	handler: async ({ container }) =>
		await notes(container).stats()
