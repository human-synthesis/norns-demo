import type { Container } from '@human-synthesis/norns/server'
import type { NotesService, Note, NoteInput, NoteQuery, NotePage } from './service'
import type { NoteOption, NoteStatsRow } from '../shared/schema'

svc := (c: Container) => c.resolve('notes.service') as NotesService

export notes := (c: Container) => {
	list: (): Promise<Note[]> => svc(c).list()
	page: (query: NoteQuery): Promise<NotePage> => svc(c).page(query)
	search: (q: string, limit?: number): Promise<NoteOption[]> => svc(c).search(q, limit)
	stats: (): Promise<NoteStatsRow[]> => svc(c).stats()
	get: (id: number) => svc(c).get(id)
	create: (input: NoteInput) => svc(c).create(input)
	seed: (count: number) => svc(c).seed(count)
	update: (id: number, input: NoteInput) => svc(c).update(id, input)
	remove: (id: number) => svc(c).remove(id)
}
