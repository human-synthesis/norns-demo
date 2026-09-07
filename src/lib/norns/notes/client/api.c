import { createApi } from '@human-synthesis/norns-tron/client'
import { noteWire } from '../shared/schema'

// Browser-side client for the notes API. `schemas` carries the compiled
// contract for endpoints served in schema mode (GET /api/notes is tagged
// `#notes.v1`), so tagged responses are decoded with the right row shape.
// Everything else (self-describing TRON, plain JSON) decodes on its own.
//
// In a `load` function build a per-request instance instead:
//   createApi { fetch, schemas: [noteWire] }
export notesApi := createApi { schemas: [noteWire] }

export listNotes := (qs: string) => notesApi.get `/api/notes?${qs}`
export searchNotes := (term: string) => notesApi.get `/api/notes/search?q=${encodeURIComponent term}`
export noteStats := () => notesApi.tape '/api/notes/stats'
export createNote := (values: Record<string, unknown>) => notesApi.post '/api/notes', values
export seedNotes := (count: number) => notesApi.post '/api/notes/seed', { count }
