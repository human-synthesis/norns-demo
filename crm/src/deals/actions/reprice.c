// Custom body for deals.Action.reprice — the only hand-written action in the CRM.
// Contract: ({ row, input, container, user }) => result. Guards already ran in the shell.
import { eq } from 'drizzle-orm'

import { Deal } from '$lib/deals/schema.c'

export default async ({ input, container }) => {
	const db = container.resolve('db')
	const amount = Math.round(input.amount * 0.9)
	await db.update(Deal).set({ amount }).where(eq(Deal.id, input.id))
	return { amount }
}
