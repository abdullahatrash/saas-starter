import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { previewJobs, previewResults } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getPrediction } from '@/lib/replicate'

export const runtime = 'nodejs'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const jobId = parseInt(id)

		if (isNaN(jobId)) {
			return NextResponse.json({ error: 'Invalid job ID' }, { status: 400 })
		}

		// Get job details
		const [job] = await db
			.select()
			.from(previewJobs)
			.where(eq(previewJobs.id, jobId))
			.limit(1)

		if (!job) {
			return NextResponse.json({ error: 'Job not found' }, { status: 404 })
		}

		// Get results if any
		const results = await db
			.select()
			.from(previewResults)
			.where(eq(previewResults.jobId, jobId))
			.orderBy(previewResults.createdAt)

		// If job is running and has prediction ID, check status
		if ((job.status === 'running' || job.status === 'queued') && job.replicatePredictionId) {
			try {
				console.log(`Checking prediction status for job ${job.id}, prediction ${job.replicatePredictionId}`)
				const prediction = await getPrediction(job.replicatePredictionId)
				console.log(`Prediction status: ${prediction.status}`, prediction.output ? 'Has output' : 'No output yet')
				
				// Check if prediction failed due to localhost URLs
				if (prediction.error?.includes('localhost') || prediction.error?.includes('Connection refused')) {
					// Update job status to failed
					await db
						.update(previewJobs)
						.set({ status: 'failed' })
						.where(eq(previewJobs.id, job.id))
					
					return NextResponse.json({
						job: {
							id: job.id,
							status: 'failed',
							error: 'Images not accessible: Please use ngrok or deploy to production for testing with Replicate API',
							createdAt: job.createdAt,
							variantParams: job.variantParams,
						},
						results: [],
					})
				}

				// Update job status based on prediction status
				if (prediction.status === 'succeeded' && prediction.output) {
					// Save result
					const outputUrl = Array.isArray(prediction.output)
						? prediction.output[0]
						: prediction.output

					if (outputUrl) {
						// Check if result already exists
						const existingResult = results.find(r => r.imageUrl === outputUrl)
						
						if (!existingResult) {
							const [result] = await db
								.insert(previewResults)
								.values({
									jobId: job.id,
									imageUrl: outputUrl,
									thumbUrl: outputUrl, // Same for now
								})
								.returning()
							results.push(result)
						}

						// Update job status
						await db
							.update(previewJobs)
							.set({ status: 'succeeded' })
							.where(eq(previewJobs.id, job.id))
						
						// Update job status in response
						job.status = 'succeeded'
					}
				} else if (prediction.status === 'failed' || prediction.status === 'canceled') {
					// Update job status
					await db
						.update(previewJobs)
						.set({ status: 'failed' })
						.where(eq(previewJobs.id, job.id))
					
					job.status = 'failed'
				} else if (prediction.status === 'processing' || prediction.status === 'starting') {
					// Keep as running
					job.status = 'running'
				}
			} catch (error) {
				console.error('Error checking prediction:', error)
				// Don't fail the whole request, just log the error
			}
		}

		return NextResponse.json({
			job: {
				id: job.id,
				status: job.status,
				createdAt: job.createdAt,
				variantParams: job.variantParams,
			},
			results: results.map((r) => ({
				id: r.id,
				imageUrl: r.imageUrl,
				thumbUrl: r.thumbUrl,
				createdAt: r.createdAt,
			})),
		})
	} catch (error) {
		console.error('Error fetching preview:', error)
		return NextResponse.json({ error: 'Failed to fetch preview' }, { status: 500 })
	}
}