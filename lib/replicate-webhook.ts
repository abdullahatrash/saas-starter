import { createHmac, timingSafeEqual } from 'node:crypto'

// Replicate's docs advise rejecting deliveries whose timestamp falls outside a
// tolerance window, so a captured payload cannot be replayed later even with a
// valid signature.
const TIMESTAMP_TOLERANCE_SECONDS = 5 * 60

// Verifies a Replicate webhook signature (svix scheme). Replicate sends three
// headers — webhook-id, webhook-timestamp, webhook-signature — and signs the
// content `${id}.${timestamp}.${rawBody}` with HMAC-SHA256, keyed on the
// base64 secret that follows the `whsec_` prefix. The signature header carries
// one or more space-delimited `v<version>,<base64>` entries; a delivery is
// valid if any entry matches and the timestamp is within tolerance.
export function verifyReplicateWebhook(
  headers: Headers,
  rawBody: string,
  signingSecret: string
): boolean {
  const id = headers.get('webhook-id')
  const timestamp = headers.get('webhook-timestamp')
  const signatureHeader = headers.get('webhook-signature')

  if (!id || !timestamp || !signatureHeader) {
    return false
  }

  const timestampSeconds = Number(timestamp)
  if (
    !Number.isFinite(timestampSeconds) ||
    Math.abs(Date.now() / 1000 - timestampSeconds) > TIMESTAMP_TOLERANCE_SECONDS
  ) {
    return false
  }

  const secretBytes = Buffer.from(signingSecret.replace(/^whsec_/, ''), 'base64')
  const signedContent = `${id}.${timestamp}.${rawBody}`
  const expected = createHmac('sha256', secretBytes).update(signedContent).digest('base64')
  const expectedBuf = Buffer.from(expected)

  return signatureHeader.split(' ').some((entry) => {
    const candidate = entry.includes(',') ? entry.slice(entry.indexOf(',') + 1) : entry
    const candidateBuf = Buffer.from(candidate)
    return (
      candidateBuf.length === expectedBuf.length &&
      timingSafeEqual(candidateBuf, expectedBuf)
    )
  })
}
