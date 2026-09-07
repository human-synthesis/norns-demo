import { getScope } from '@human-synthesis/norns/server'
import type { Container } from '@human-synthesis/norns/server'
import { NotesRepo } from './repo'
import { NotesService } from './service'

// Cloudflare D1. The binding arrives per request on `event.platform.env.DB`
// (wrangler in production, adapter-cloudflare's platform proxy under
// `vite dev`), so `db` is a transient binding read from the current request
// scope rather than a process-wide singleton. Repo and service are transient
// too — they close over that request's `db`.
export default (app: Container) =>
	app.bind 'db', =>
		db := getScope()?.event?.platform?.env?.DB
		throw new Error 'D1 binding `DB` is missing — check [[d1_databases]] in wrangler.toml and run through wrangler or the adapter platform proxy' unless db
		db
	app.bind 'notes.repo', (c: Container) => new NotesRepo c.resolve('db')
	app.bind 'notes.service', (c: Container) => new NotesService c.resolve('notes.repo')
