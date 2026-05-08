import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

import type { Container } from '@human-synthesis/norns/server'

DB_PATH := 'data/notes.db'

export default (app: Container) =>
	app.single 'db', =>
		mkdirSync dirname(DB_PATH), { recursive: true }
		db := new Database DB_PATH
		db.pragma 'journal_mode = WAL'
		db
	app.single 'notes.repo', (c: Container) => new NotesRepo c.resolve('db')
	app.single 'notes.service', (c: Container) => new NotesService c.resolve('notes.repo')
