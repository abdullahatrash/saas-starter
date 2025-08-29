import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { previewJobs, previewResults } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type { ReplicatePrediction } from '@/types/core'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
	try {
		const prediction: ReplicatePrediction = await request.json()

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

		// Update job status
		if (prediction.status === 'succeeded' && prediction.output) {
			const outputUrl = Array.isArray(prediction.output)
				? prediction.output[0]
				: prediction.output

			if (outputUrl) {
				// Save result
				await db.insert(previewResults).values({
					jobId: job.id,
					imageUrl: outputUrl,
					thumbUrl: outputUrl, // Could generate thumbnail here
					width: 1024, // Default, could extract from image
					height: 1024,
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

			// Could refund credit here
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Webhook error:', error)
		return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
	}
}