import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { previewJobs, previewResults } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getPrediction } from '@/lib/replicate'
import { getUser } from '@/lib/db/queries'
import { probeImageDimensions } from '@/lib/image-dimensions'
import { refundCreditOnce } from '@/lib/entitlements'

export const runtime = 'nodejs'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const user = await getUser()
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

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

		// Return 404 for both missing jobs and jobs owned by someone else, so
		// the endpoint never confirms the existence of another user's job.
		if (!job || job.userId !== user.id) {
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

				// Update job status based on prediction status. nano-banana-2 returns
				// a single URI string; older models returned arrays — tolerate both.
				if (prediction.status === 'succeeded' && prediction.output) {
					// Save result
					const outputUrl = Array.isArray(prediction.output)
						? prediction.output[0]
						: prediction.output

					if (outputUrl) {
						// Check if result already exists
						const existingResult = results.find(r => r.imageUrl === outputUrl)

						if (!existingResult) {
							// Record the real output dimensions; null when the image can't
							// be probed, never a fabricated default.
							const dimensions = await probeImageDimensions(outputUrl)

							const [result] = await db
								.insert(previewResults)
								.values({
									jobId: job.id,
									imageUrl: outputUrl,
									thumbUrl: outputUrl, // Same for now
									width: dimensions?.width ?? null,
									height: dimensions?.height ?? null,
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
					// Refund the consumed credit — exactly once per job, even if the
					// webhook path also observed (or later observes) this failure.
					let creditsRefunded = false
					try {
						creditsRefunded = await refundCreditOnce(job.id, job.userId)
						if (creditsRefunded) {
							console.log(`Refunded 1 credit to user ${job.userId} for failed job ${job.id}`)
						}
					} catch (error) {
						console.error('Error refunding credit:', error)
					}

					// Update job status
					await db
						.update(previewJobs)
						.set({ 
							status: 'failed'
						})
						.where(eq(previewJobs.id, job.id))
					
					job.status = 'failed'
					const errorMessage = prediction.error || 'Generation failed'
					
					// Add refund flag to response
					if (creditsRefunded) {
						return NextResponse.json({
							job: {
								id: job.id,
								status: job.status,
								error: errorMessage,
								createdAt: job.createdAt,
								variantParams: job.variantParams,
							},
							results: [],
							creditsRefunded: true,
						})
					}
				} else if (
					prediction.status === 'processing' ||
					prediction.status === 'starting' ||
					prediction.status === 'queued'
				) {
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