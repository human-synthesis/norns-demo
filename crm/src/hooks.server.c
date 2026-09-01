// Spec-first boot for the sample CRM: the generated tree (.norns/generated)
// owns routes and lib; this file wires db, triggers, serializer, and auth.
import { boot, applyMigrations, betterSqlite, d1 } from '@human-synthesis/norns/server'
import { tronSerializer } from '@human-synthesis/norns-tron/server'
import { env } from '$env/dynamic/private'

import { createAuth } from './auth.c'
import { Company } from '$lib/companies/schema.c'
import { Contact } from '$lib/contacts/schema.c'
import { Deal, Lead } from '$lib/deals/schema.c'
import { Activity, Task } from '$lib/activities/schema.c'

triggerFiles := import.meta.glob '/.norns/generated/lib/*/triggers.c', { eager: true }
triggers := Object.values(triggerFiles).map (m) => m.triggers ?? []

// Local dev: SQLite under .norns/ (gitignored), migrations applied on boot,
// sample rows seeded on first run. Production D1 migrates via
// `wrangler d1 migrations apply` instead.
devDb .= undefined
if import.meta.env.DEV
	devDb = await betterSqlite '.norns/dev.db'
	await applyMigrations devDb, 'migrations'
	existing := await devDb.select().from(Company).limit(1)
	if existing.length === 0
		id := => crypto.randomUUID()
		acme := id()
		globex := id()
		mara := id()
		liu := id()
		dealA := id()
		await devDb.insert(Company).values [
			{ id: acme, owner: 'dev', name: 'Acme Corp', industry: 'Manufacturing' }
			{ id: globex, owner: 'dev', name: 'Globex', domain: 'https://globex.example', industry: 'Energy' }
		]
		await devDb.insert(Contact).values [
			{ id: mara, owner: 'dev', name: 'Mara Voss', email: 'mara@acme.example', company: acme, phone: '+1 555 0100' }
			{ id: liu, owner: 'dev', name: 'Liu Chen', email: 'liu@globex.example', company: globex }
		]
		await devDb.insert(Deal).values [
			{ id: dealA, owner: 'dev', title: 'Acme expansion', amount: 42000, company: acme, contact: mara, status: 'open' }
			{ id: id(), owner: 'dev', title: 'Globex renewal', amount: 18000, company: globex, contact: liu, status: 'won' }
			{ id: id(), owner: 'dev', title: 'Globex pilot', amount: 5000, company: globex, status: 'lost' }
		]
		await devDb.insert(Lead).values [
			{ id: id(), owner: 'dev', name: 'Priya Nair', email: 'priya@startup.example', source: 'webform', status: 'new' }
		]
		await devDb.insert(Activity).values [
			{ id: id(), owner: 'dev', contact: mara, deal: dealA, kind: 'call', subject: 'Kickoff call', status: 'planned' }
			{ id: id(), owner: 'dev', contact: liu, kind: 'email', subject: 'Send renewal quote', status: 'planned' }
			{ id: id(), owner: 'dev', contact: mara, kind: 'meeting', subject: 'Contract review', status: 'done' }
			{ id: id(), owner: 'dev', contact: liu, kind: 'call', subject: 'Cold outreach', status: 'cancelled' }
		]
		await devDb.insert(Task).values [
			{ id: id(), owner: 'dev', title: 'Prepare Acme proposal deck' }
			{ id: id(), owner: 'dev', title: 'Update pipeline forecast', done: true }
		]

// On Cloudflare the D1 binding only exists per-request, so the scoped
// container gets its db here rather than at boot.
d1Handle := async ({ event, resolve }) =>
	if event.platform?.env?.DB
		db := await d1 event.platform.env.DB
		event.locals.container.single 'db', => db
	resolve event

// Auth is opt-in — see norns-app/src/hooks.server.c for the rationale.
auth := devDb and env.BETTER_AUTH_SECRET ? createAuth({ db: devDb, env }) : undefined

devUserHandle := async ({ event, resolve }) =>
	event.locals.user ?= { id: 'dev', roles: ['admin'] }
	resolve event

opts := {
	triggers
	serializer: tronSerializer()
	cronShim: import.meta.env.DEV
	extraHandle: import.meta.env.DEV and !auth ? [d1Handle, devUserHandle] : d1Handle
}
if auth then opts.auth = auth

app := await boot opts

if devDb then app.container.single 'db', => devDb

{ handle, handleError } := app
export { handle, handleError }
