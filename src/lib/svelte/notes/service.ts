import * as repo from './repo';
import type { Note } from './db';

export type NoteInput = { title: string; body: string };

export const list = (db: D1Database): Promise<Note[]> => repo.list(db);
export const get = (db: D1Database, id: number) => repo.get(db, id);
export const create = (db: D1Database, input: NoteInput) => repo.create(db, input.title, input.body);
export const update = (db: D1Database, id: number, input: NoteInput) =>
	repo.update(db, id, input.title, input.body);
export const remove = (db: D1Database, id: number) => repo.remove(db, id);
