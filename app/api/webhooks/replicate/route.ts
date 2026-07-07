import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { previewJobs, previewResults } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { verifyReplicateWebhook } from '@/lib/replicate-webhook'
import { probeImageDimensions } from '@/lib/image-dimensions'
import { refundCreditOnce } from '@/lib/entitlements'
import type { ReplicatePrediction } from '@/types/core'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
	try {
		const signingSecret = process.env.REPLICATE_WEBHOOK_SIGNING_SECRET

		// Read the raw body before parsing: the signature covers the exact bytes,
		// and verification must pass before we touch the database.
		const rawBody = await request.text()

		if (!signingSecret || !verifyReplicateWebhook(request.headers, rawBody, signingSecret)) {
			return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
		}

		let prediction: ReplicatePrediction
		try {
			prediction = JSON.parse(rawBody)
		} catch {
			return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
		}

		if (!prediction.id) {
			return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
		}

		// Find job by prediction ID
		const [job] = await db
			.select()
			.from(previewJobs)
			.where(eq(previewJobs.replicatePredictionId, prediction.id))
			.limit(1)

		if (!job) {
			console.warn(`No job found for prediction ${prediction.id}`)
			return NextResponse.json({ error: 'Job not found' }, { status: 404 })
		}

		// Update job status. nano-banana-2 returns a single URI string; older
		// models returned arrays — tolerate both shapes.
		if (prediction.status === 'succeeded' && prediction.output) {
			const outputUrl = Array.isArray(prediction.output)
				? prediction.output[0]
				: prediction.output

			if (outputUrl) {
				// Record the real output dimensions; null when the image can't be
				// probed, never a fabricated default.
				const dimensions = await probeImageDimensions(outputUrl)

				await db.insert(previewResults).values({
					jobId: job.id,
					imageUrl: outputUrl,
					thumbUrl: outputUrl, // Could generate thumbnail here
					width: dimensions?.width ?? null,
					height: dimensions?.height ?? null,
				})

				// Update job status
				await db
					.update(previewJobs)
					.set({ status: 'succeeded' })
					.where(eq(previewJobs.id, job.id))
			}
		} else if (prediction.status === 'failed' || prediction.status === 'canceled') {
			// Update job status
			await db
				.update(previewJobs)
				.set({ status: 'failed' })
				.where(eq(previewJobs.id, job.id))

			// Refund the consumed credit — exactly once per job, even if the
			// polling path also observes this failure or the webhook is replayed.
			await refundCreditOnce(job.id, job.userId)
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Webhook error:', error)
		return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
	}
}