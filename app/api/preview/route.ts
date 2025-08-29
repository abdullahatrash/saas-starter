import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/drizzle'
import { previewJobs, bodyPhotos, designs, studios, teamMembers } from '@/lib/db/schema'
import { getUser } from '@/lib/db/queries'
import { consumeCredits, getUserCredits, initializeUserCredits, addCredits } from '@/lib/entitlements'
import { createPrediction } from '@/lib/replicate'
import { buildTattooPrompt } from '@/lib/prompt'
import { eq, and } from 'drizzle-orm'
import type { TattooPromptParams, BodyPart, TattooVariant } from '@/types/core'

export const runtime = 'nodejs'

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

		// Initialize credits if new user
		await initializeUserCredits(user.id)

		// Check credits
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

		// Build prompt - use custom if provided, otherwise generate
		let prompt: string
		if (customPrompt && customPrompt.trim()) {
			prompt = customPrompt
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

		// Images should already be absolute URLs from Vercel Blob
		// But handle both cases for backward compatibility
		const absoluteBodyUrl = bodyImageUrl
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

			const prediction = await createPrediction({
				bodyImageUrl: absoluteBodyUrl,
				designImageUrl: absoluteDesignUrl,
				prompt,
				seed: job.seed || undefined,
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
			// Refund credit on error
			await addCredits(user.id, 1)
			
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