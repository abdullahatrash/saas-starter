import { createHmac } from 'node:crypto'

// Produces the svix-style signing headers Replicate sends with a webhook, so
// tests can deliver a payload with a valid (or deliberately invalid) signature.
export function signReplicateWebhook(opts: {
  id: string
  timestamp: string
  body: string
  secret: string
}) {
  const secretBytes = Buffer.from(opts.secret.replace(/^whsec_/, ''), 'base64')
  const signedContent = `${opts.id}.${opts.timestamp}.${opts.body}`
  const signature = createHmac('sha256', secretBytes).update(signedContent).digest('base64')
  return {
    'webhook-id': opts.id,
    'webhook-timestamp': opts.timestamp,
    'webhook-signature': `v1,${signature}`,
  }
}
