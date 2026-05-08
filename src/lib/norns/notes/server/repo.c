import type Database from 'better-sqlite3'
import type { Note } from './service'

export class NotesRepo
	db: Database.Database
	constructor(@db: Database.Database)

	list(): Note[]
		@db.prepare('SELECT * FROM notes ORDER BY updated_at DESC').all() as Note[]

	get(id: number): Note | undefined
		@db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Note | undefined

	create(title: string, body: string): number | bigint
		now := Date.now()
		result := @db
			.prepare 'INSERT INTO notes (title, body, created_at, updated_at) VALUES (?, ?, ?, ?)'
			.run title, body, now, now
		result.lastInsertRowid

	update(id: number, title: string, body: string): void
		@db
			.prepare 'UPDATE notes SET title=?, body=?, updated_at=? WHERE id=?'
			.run title, body, Date.now(), id

	remove(id: number): void
		@db.prepare('DELETE FROM notes WHERE id=?').run(id)
