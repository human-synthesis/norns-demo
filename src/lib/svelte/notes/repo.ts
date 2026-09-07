import type { Note } from './db';

// Hand-written SQL on the raw D1 API — no ORM. Every call is async on Workers.

export async function list(db: D1Database): Promise<Note[]> {
	const { results } = await db.prepare('SELECT * FROM notes ORDER BY updated_at DESC').all<Note>();
	return results;
}

export async function get(db: D1Database, id: number): Promise<Note | null> {
	return db.prepare('SELECT * FROM notes WHERE id = ?').bind(id).first<Note>();
}

export async function create(db: D1Database, title: string, body: string): Promise<number> {
	const now = Date.now();
	const result = await db
		.prepare('INSERT INTO notes (title, body, created_at, updated_at) VALUES (?, ?, ?, ?)')
		.bind(title, body, now, now)
		.run();
	return Number(result.meta.last_row_id);
}

export async function update(db: D1Database, id: number, title: string, body: string): Promise<void> {
	await db
		.prepare('UPDATE notes SET title=?, body=?, updated_at=? WHERE id=?')
		.bind(title, body, Date.now(), id)
		.run();
}

export async function remove(db: D1Database, id: number): Promise<void> {
	await db.prepare('DELETE FROM notes WHERE id=?').bind(id).run();
}
