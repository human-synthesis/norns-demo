export default async ({ input, container }) => {
  if (input.type === 'invoice.paid') {
    const id = String(input.data?.dealId ?? '')
    if (id !== '') {
      await container.resolve('jobs').enqueue('deals.Job.sendWinEmail', { id }, null)
    }
  }
  return { received: true }
}
