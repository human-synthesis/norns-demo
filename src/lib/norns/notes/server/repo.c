import type { Note } from './service'

// Hand-written SQL on the raw D1 API — no ORM. Every call is async on Workers.
export class NotesRepo
	db: D1Database
	constructor(@db: D1Database)

	async list(): Promise<Note[]>
		result := await @db.prepare('SELECT * FROM notes ORDER BY updated_at DESC').all()
		result.results as Note[]

	async get(id: number): Promise<Note | null>
		row := await @db.prepare('SELECT * FROM notes WHERE id = ?').bind(id).first()
		row as Note | null

	async create(title: string, body: string): Promise<number>
		now := Date.now()
		stmt := @db.prepare('INSERT INTO notes (title, body, created_at, updated_at) VALUES (?, ?, ?, ?)').bind(title, body, now, now)
		result := await stmt.run()
		Number result.meta.last_row_id

	async update(id: number, title: string, body: string): Promise<void>
		stmt := @db.prepare('UPDATE notes SET title=?, body=?, updated_at=? WHERE id=?').bind(title, body, Date.now(), id)
		await stmt.run()
		return

	async remove(id: number): Promise<void>
		await @db.prepare('DELETE FROM notes WHERE id=?').bind(id).run()
		return
