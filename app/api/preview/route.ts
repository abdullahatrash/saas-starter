import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { previewJobs, bodyPhotos, designs, studios, teamMembers } from '@/lib/db/schema'
import { getUser } from '@/lib/db/queries'
import { consumeCredits, getUserCredits, refundCreditOnce } from '@/lib/entitlements'
import { createPrediction } from '@/lib/replicate'
import { buildTattooPrompt, buildCompositePrompt } from '@/lib/prompt'
import { eq, and } from 'drizzle-orm'
import type { TattooPromptParams, BodyPart, TattooVariant } from '@/types/core'

export const runtime = 'nodejs'

// Cap on the Advanced custom prompt. Placement is carried by the composite
// pixels now, so the free-text field is only for stylistic direction — a bound
// keeps a pasted essay (or abuse) from reaching the model.
const MAX_CUSTOM_PROMPT_LENGTH = 2000

export async function POST(request: NextRequest) {
	try {
		const user = await getUser()
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const data = await request.json()
		const {
			bodyImageUrl,
			designImageUrl,
			// The client-rendered composite (body photo with the design overlaid at
			// the chosen transform). When present, it becomes the image the model
			// works from and the prompt switches to the composite variant.
			compositeImageUrl,
			part,
			variant = 'black_gray',
			scale = 1.0,
			rotationDeg = 0,
			opacity = 1.0,
			seed,
			customPrompt,
		} = data

		// Validate required fields
		if (!bodyImageUrl || !designImageUrl || !part) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
		}

		if (typeof customPrompt === 'string' && customPrompt.length > MAX_CUSTOM_PROMPT_LENGTH) {
			return NextResponse.json(
				{ error: `Custom prompt must be ${MAX_CUSTOM_PROMPT_LENGTH} characters or fewer` },
				{ status: 400 }
			)
		}

		// Hard paywall: no free credits are granted anywhere. The balance check
		// below is the sole enforcement point; a zero balance never mutates a
		// credit row and never reaches Replicate.
		const credits = await getUserCredits(user.id)
		if (credits < 1) {
			return NextResponse.json({ error: 'Insufficient credits', credits }, { status: 402 })
		}

		// Store body photo if new
		let [bodyPhoto] = await db
			.select()
			.from(bodyPhotos)
			.where(and(eq(bodyPhotos.userId, user.id), eq(bodyPhotos.imageUrl, bodyImageUrl)))
			.limit(1)

		if (!bodyPhoto) {
			[bodyPhoto] = await db
				.insert(bodyPhotos)
				.values({
					userId: user.id,
					part: part as string,
					imageUrl: bodyImageUrl,
				})
				.returning()
		}

		// Store design if new (simplified for MVP - associate with first studio)
		let [design] = await db
			.select()
			.from(designs)
			.where(eq(designs.imageUrl, designImageUrl))
			.limit(1)

		if (!design) {
			// Get or create a default studio
			let [studio] = await db
				.select()
				.from(studios)
				.where(eq(studios.name, 'Default Studio'))
				.limit(1)

			if (!studio) {
				// Get user's team
				const teamMember = await db
					.select()
					.from(teamMembers)
					.where(eq(teamMembers.userId, user.id))
					.limit(1)

				const teamId = teamMember[0]?.teamId || 1

				;[studio] = await db
					.insert(studios)
					.values({
						teamId,
						name: 'Default Studio',
					})
					.returning()
			}

			;[design] = await db
				.insert(designs)
				.values({
					studioId: studio.id,
					title: 'Uploaded Design',
					imageUrl: designImageUrl,
				})
				.returning()
		}

		// Build prompt. A custom prompt always wins. Otherwise the composite flow
		// uses the placement-aware variant (no scale/rotation/opacity prose — the
		// pixels carry that), and the legacy flow keeps the slider-driven prose.
		let prompt: string
		if (customPrompt && customPrompt.trim()) {
			prompt = customPrompt
		} else if (compositeImageUrl) {
			prompt = buildCompositePrompt({
				part: part as BodyPart,
				variant: variant as TattooVariant,
			})
		} else {
			const promptParams: TattooPromptParams = {
				part: part as BodyPart,
				variant: variant as TattooVariant,
				scale,
				rotationDeg,
				opacity,
				seed,
			}
			prompt = buildTattooPrompt(promptParams)
		}

		// Create preview job
		const [job] = await db
			.insert(previewJobs)
			.values({
				userId: user.id,
				bodyPhotoId: bodyPhoto.id,
				designId: design.id,
				status: 'queued',
				prompt,
				seed: seed || Math.floor(Math.random() * 1000000),
				variantParams: {
					variant,
					scale,
					rotationDeg,
					opacity,
				},
			})
			.returning()

		// Consume credit
		await consumeCredits(user.id, 1)

		// Images should already be absolute URLs from Vercel Blob.
		// When a composite was rendered client-side, it is what the model works
		// from: image_input becomes [composite, design] instead of [body, design].
		const absoluteBodyUrl = compositeImageUrl || bodyImageUrl
		const absoluteDesignUrl = designImageUrl
		
		// Log URLs for debugging
		console.log('Image URLs:', {
			body: absoluteBodyUrl,
			design: absoluteDesignUrl,
			isBodyAbsolute: absoluteBodyUrl.startsWith('http'),
			isDesignAbsolute: absoluteDesignUrl.startsWith('http'),
		})

		// Create webhook URL - only use if we have a public URL (not localhost)
		const webhookUrl = process.env.NEXT_PUBLIC_URL && !process.env.NEXT_PUBLIC_URL.includes('localhost')
			? `${process.env.NEXT_PUBLIC_URL}/api/webhooks/replicate`
			: undefined

		// Start prediction
		try {
			console.log('Creating prediction with:', {
				bodyUrl: absoluteBodyUrl,
				designUrl: absoluteDesignUrl,
				promptLength: prompt.length,
				webhookUrl: webhookUrl || 'polling (no webhook)',
			})

			// nano-banana-2 has no seed input, so the stored seed is not sent.
			const prediction = await createPrediction({
				bodyImageUrl: absoluteBodyUrl,
				designImageUrl: absoluteDesignUrl,
				prompt,
				webhookUrl,
			})

			console.log('Prediction created:', {
				id: prediction.id,
				status: prediction.status,
				hasOutput: !!prediction.output,
			})

			// Update job with prediction ID and status
			const predictionStatus = prediction.status === 'starting' ? 'running' : prediction.status as string
			await db
				.update(previewJobs)
				.set({
					replicatePredictionId: prediction.id,
					status: predictionStatus,
				})
				.where(eq(previewJobs.id, job.id))

			return NextResponse.json({
				jobId: job.id,
				predictionId: prediction.id,
				status: predictionStatus,
				creditsRemaining: credits - 1,
			})
		} catch (error: any) {
			// Refund the consumed credit through the same once-only guard used by
			// the webhook and polling paths.
			await refundCreditOnce(job.id, user.id)

			await db
				.update(previewJobs)
				.set({ status: 'failed' })
				.where(eq(previewJobs.id, job.id))

			// Provide specific error messages
			if (error.message?.includes('billing')) {
				return NextResponse.json(
					{ error: 'Replicate account has insufficient credits. Please check your Replicate billing.' },
					{ status: 402 }
				)
			}

			throw error
		}
	} catch (error: any) {
		console.error('Preview generation error:', error)
		
		// Return more specific error messages
		const errorMessage = error.message || 'Failed to generate preview'
		
		return NextResponse.json(
			{ error: errorMessage },
			{ status: 500 }
		)
	}
}