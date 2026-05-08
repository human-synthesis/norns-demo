import * as repo from './repo';
import type { Note } from './db';

export type NoteInput = { title: string; body: string };

export const list = (): Note[] => repo.list();
export const get = (id: number) => repo.get(id);
export const create = (input: NoteInput) => repo.create(input.title, input.body);
export const update = (id: number, input: NoteInput) => repo.update(id, input.title, input.body);
export const remove = (id: number) => repo.remove(id);
