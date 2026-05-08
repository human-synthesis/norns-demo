import type { Container } from '@human-synthesis/norns/server'
import type { NotesService, Note, NoteInput } from './service'

svc := (c: Container) => c.resolve('notes.service') as NotesService

export notes := (c: Container) => {
	list: (): Note[] => svc(c).list()
	get: (id: number) => svc(c).get(id)
	create: (input: NoteInput) => svc(c).create(input)
	update: (id: number, input: NoteInput) => svc(c).update(id, input)
	remove: (id: number) => svc(c).remove(id)
}
