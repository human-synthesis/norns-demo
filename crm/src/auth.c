// better-auth factory. Enabled from hooks.server.c only when
// BETTER_AUTH_SECRET is set. better-auth manages its own tables — create
// them once with `bunx @better-auth/cli migrate`.
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

export createAuth := ({ db, env }) =>
	betterAuth {
		secret: env.BETTER_AUTH_SECRET
		database: drizzleAdapter db, { provider: 'sqlite' }
		emailAndPassword: { enabled: true }
	}
