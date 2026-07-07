import Replicate from 'replicate'
import type { ReplicatePrediction } from '@/types/core'

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN || '',
})

// Generation model. Confirmed input schema (from the model's published OpenAPI
// schema, version 9a1df086...): prompt (required), image_input (array of URIs,
// up to 14), aspect_ratio (enum incl. 'match_input_image', default
// 'match_input_image'), resolution ('1K' | '2K' | '4K', default '1K'),
// output_format ('jpg' | 'png'), google_search, image_search. There is NO seed
// input, so reproducibility cannot be wired through. Output is a single URI
// string (older models returned arrays; handlers tolerate both).
export const GENERATION_MODEL = 'google/nano-banana-2'

export interface NanoBananaInput {
	bodyImageUrl: string
	designImageUrl: string
	prompt: string
	aspectRatio?: string
	resolution?: '1K' | '2K'
	webhookUrl?: string
}

function toReplicatePrediction(prediction: {
	id: string
	status: string
	output?: unknown
	error?: unknown
	logs?: string
	metrics?: { predict_time?: number; total_time?: number }
}): ReplicatePrediction {
	return {
		id: prediction.id,
		status: prediction.status as ReplicatePrediction['status'],
		output: prediction.output as ReplicatePrediction['output'],
		error: prediction.error
			? typeof prediction.error === 'string'
				? prediction.error
				: JSON.stringify(prediction.error)
			: undefined,
		logs: prediction.logs,
		metrics: prediction.metrics,
	}
}

export async function createPrediction(input: NanoBananaInput): Promise<ReplicatePrediction> {
	if (!process.env.REPLICATE_API_TOKEN) {
		throw new Error('REPLICATE_API_TOKEN is not configured')
	}

	try {
		const prediction = await replicate.predictions.create({
			model: GENERATION_MODEL,
			input: {
				prompt: input.prompt,
				// Order matters: the body photo first, then the design to place on it.
				image_input: [input.bodyImageUrl, input.designImageUrl],
				// Default: match the input photo's aspect ratio at 1K resolution.
				aspect_ratio: input.aspectRatio ?? 'match_input_image',
				resolution: input.resolution ?? '1K',
				output_format: 'jpg',
			},
			...(input.webhookUrl
				? {
						webhook: input.webhookUrl,
						webhook_events_filter: ['start', 'completed'] as ('start' | 'completed')[],
					}
				: {}),
		})

		if (prediction?.error) {
			throw new Error(
				typeof prediction.error === 'string' ? prediction.error : JSON.stringify(prediction.error)
			)
		}

		return toReplicatePrediction(prediction)
	} catch (error: any) {
		console.error('Replicate API error:', error)

		// Check for rate limit or billing errors
		if (error.message?.includes('insufficient credit') || error.message?.includes('billing')) {
			throw new Error('Replicate API billing error: Please check your Replicate account credits')
		}

		throw error
	}
}

export async function getPrediction(predictionId: string): Promise<ReplicatePrediction> {
	if (!process.env.REPLICATE_API_TOKEN) {
		throw new Error('REPLICATE_API_TOKEN is not configured')
	}

	try {
		const prediction = await replicate.predictions.get(predictionId)
		return toReplicatePrediction(prediction)
	} catch (error: any) {
		console.error('Error getting prediction:', error)
		throw new Error(`Replicate API error: ${error.message || error}`)
	}
}

export async function cancelPrediction(predictionId: string): Promise<void> {
	if (!process.env.REPLICATE_API_TOKEN) {
		console.warn('REPLICATE_API_TOKEN not set, skipping cancel')
		return
	}

	try {
		await replicate.predictions.cancel(predictionId)
	} catch (error: any) {
		console.error('Error canceling prediction:', error)
		throw new Error(`Failed to cancel prediction: ${error.message || error}`)
	}
}
