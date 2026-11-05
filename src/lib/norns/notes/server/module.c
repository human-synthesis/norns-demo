import { env } from 'cloudflare:workers'
import type { Container } from '@human-synthesis/norns/server'
import { NotesRepo } from './repo'
import { NotesService } from './service'

// Cloudflare D1. The binding comes from `cloudflare:workers` (wrangler in
// production, adapter-cloudflare's platform proxy under `vite dev`), read on
// each resolve rather than held as a process-wide singleton. Repo and service
// are transient too — they close over that resolve's `db`.
export default (app: Container) =>
	app.bind 'db', =>
		db := env.DB
		throw new Error 'D1 binding `DB` is missing — check [[d1_databases]] in wrangler.toml and run through wrangler or the adapter platform proxy' unless db
		db
	app.bind 'notes.repo', (c: Container) => new NotesRepo c.resolve('db')
	app.bind 'notes.service', (c: Container) => new NotesService c.resolve('notes.repo')
