export default async ({ input, container }) => {
  const send = container.resolve('deals.Service.mailer.send')
  const result = await send({
    to: 'sales@example.com',
    subject: 'Deal won: ' + input.id,
    html: '<p>Deal ' + input.id + ' just closed. Time to celebrate.</p>'
  })
  return { sent: Boolean(result) }
}
