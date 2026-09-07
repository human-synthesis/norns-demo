import type { Note, NotePage, NoteQuery } from './service'
import type { NoteOption, NoteStatsRow } from '../shared/schema'

// Hand-written SQL on the raw D1 API — no ORM. Every call is async on Workers.
export class NotesRepo
	db: D1Database
	constructor(@db: D1Database)

	async list(): Promise<Note[]>
		result := await @db.prepare('SELECT * FROM notes ORDER BY updated_at DESC').all()
		result.results as Note[]

	// One page of the list plus the total, in a single D1 round trip. `sort`
	// was validated against a whitelist by listQuery(), so interpolating it
	// into ORDER BY is safe; everything user-typed goes through bind().
	async page(query: NoteQuery): Promise<NotePage>
		where := if query.q then 'WHERE title LIKE ?1 OR body LIKE ?1' else ''
		like := `%${query.q}%`
		order := `ORDER BY ${query.sort ?? 'updated_at'} ${query.dir === 'asc' ? 'ASC' : 'DESC'}, id DESC`
		count := @db.prepare(`SELECT COUNT(*) AS n FROM notes ${where}`)
		rows := @db.prepare(`SELECT * FROM notes ${where} ${order} LIMIT ?2 OFFSET ?3`)
		stmts := if query.q
			[count.bind(like), rows.bind(like, query.pageSize, query.offset)]
		else
			[count, rows.bind(null, query.pageSize, query.offset)]
		[c, r] := await @db.batch stmts
		total := Number((c.results[0] as { n: number })?.n ?? 0)
		{ data: r.results as Note[], total }

	// Picker options: id + title only, capped, newest first.
	async search(q: string, limit = 20): Promise<NoteOption[]>
		stmt := if q
			@db.prepare('SELECT id, title FROM notes WHERE title LIKE ?1 ORDER BY updated_at DESC LIMIT ?2').bind(`%${q}%`, limit)
		else
			@db.prepare('SELECT id, title FROM notes ORDER BY updated_at DESC LIMIT ?1').bind(limit)
		result := await stmt.all()
		(result.results as { id: number, title: string }[]).map (r) => { value: String(r.id), label: r.title }

	// Notes per day (UTC) and total body length — a purely numeric table.
	async stats(): Promise<NoteStatsRow[]>
		result := await @db.prepare(
			'SELECT CAST(created_at / 86400000 AS INTEGER) AS day, COUNT(*) AS count, COALESCE(SUM(LENGTH(body)), 0) AS chars FROM notes GROUP BY day ORDER BY day'
		).all()
		(result.results as NoteStatsRow[]).map (r) => { day: Number(r.day), count: Number(r.count), chars: Number(r.chars) }

	async get(id: number): Promise<Note | null>
		row := await @db.prepare('SELECT * FROM notes WHERE id = ?').bind(id).first()
		row as Note | null

	async create(title: string, body: string): Promise<number>
		now := Date.now()
		stmt := @db.prepare('INSERT INTO notes (title, body, created_at, updated_at) VALUES (?, ?, ?, ?)').bind(title, body, now, now)
		result := await stmt.run()
		Number result.meta.last_row_id

	// Bulk insert in batches (D1 caps a batch at ~100 statements).
	async createMany(rows: { title: string, body: string, created_at: number }[]): Promise<number>
		insert := @db.prepare('INSERT INTO notes (title, body, created_at, updated_at) VALUES (?, ?, ?, ?)')
		for start of [0...rows.length] by 50
			chunk := rows.slice(start, start + 50)
			await @db.batch chunk.map (r) => insert.bind(r.title, r.body, r.created_at, r.created_at)
		rows.length

	async update(id: number, title: string, body: string): Promise<void>
		stmt := @db.prepare('UPDATE notes SET title=?, body=?, updated_at=? WHERE id=?').bind(title, body, Date.now(), id)
		await stmt.run()
		return

	async remove(id: number): Promise<void>
		await @db.prepare('DELETE FROM notes WHERE id=?').bind(id).run()
		return
