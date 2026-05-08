import { db, type Note } from './db';

export function list(): Note[] {
	return db.prepare('SELECT * FROM notes ORDER BY updated_at DESC').all() as Note[];
}

export function get(id: number): Note | undefined {
	return db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as Note | undefined;
}

export function create(title: string, body: string): number | bigint {
	const now = Date.now();
	const result = db
		.prepare('INSERT INTO notes (title, body, created_at, updated_at) VALUES (?, ?, ?, ?)')
		.run(title, body, now, now);
	return result.lastInsertRowid;
}

export function update(id: number, title: string, body: string): void {
	db.prepare('UPDATE notes SET title=?, body=?, updated_at=? WHERE id=?').run(
		title,
		body,
		Date.now(),
		id
	);
}

export function remove(id: number): void {
	db.prepare('DELETE FROM notes WHERE id=?').run(id);
}
