import { tronSerializer } from '@human-synthesis/norns-tron/server'

// Vite's import.meta.glob picks up every feature's module file at build time
// and eager-loads them so boot() can register their bindings up front.
features := import.meta.glob './lib/norns/*/server/module.c', { eager: true }

// serializer: TRON wire format for route() responses, content-negotiated —
// clients sending `Accept: application/tron` get TRON, everyone else gets
// plain JSON. Delete the line to serve JSON only.
app := await boot { features, serializer: tronSerializer() }

{ handle, handleError } := app
export { handle, handleError }
