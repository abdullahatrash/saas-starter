import Replicate from 'replicate'
import type { ReplicatePrediction } from '@/types/core'

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN || '',
})

export interface NanoBananaInput {
	bodyImageUrl: string
	designImageUrl: string
	prompt: string
	seed?: number
	webhookUrl?: string
}

export async function createPrediction(input: NanoBananaInput): Promise<ReplicatePrediction> {
	if (!process.env.REPLICATE_API_TOKEN) {
		throw new Error('REPLICATE_API_TOKEN is not configured')
	}

	try {
		// Using google/nano-banana model directly
		const requestBody = {
			input: {
				prompt: input.prompt,
				image_input: [input.bodyImageUrl, input.designImageUrl],
				output_format: 'jpg'
			}
		}

		// Add webhook if provided
		if (input.webhookUrl) {
			(requestBody as any).webhook = input.webhookUrl
			;(requestBody as any).webhook_events_filter = ['start', 'completed']
		}

		console.log('Creating nano-banana prediction with:', JSON.stringify(requestBody, null, 2))

		// Create the prediction using the specific nano-banana endpoint
		const response = await fetch('https://api.replicate.com/v1/models/google/nano-banana/predictions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${process.env.REPLICATE_API_TOKEN}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(requestBody)
		})

		if (!response.ok) {
			const error = await response.text()
			console.error('Replicate API error response:', error)
			throw new Error(`Replicate API error: ${response.status} - ${error}`)
		}

		const prediction = await response.json()

		if (prediction?.error) {
			throw new Error(JSON.stringify(prediction.error))
		}

		console.log('Prediction created successfully:', prediction.id)

		return {
			id: prediction.id,
			status: prediction.status as any,
			output: prediction.output as any,
			error: prediction.error ? JSON.stringify(prediction.error) : undefined,
			logs: prediction.logs,
			metrics: prediction.metrics as any,
		}
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
		
		if (prediction?.error) {
			throw new Error(JSON.stringify(prediction.error))
		}
		
		return {
			id: prediction.id,
			status: prediction.status as any,
			output: prediction.output as any,
			error: prediction.error ? JSON.stringify(prediction.error) : undefined,
			logs: prediction.logs,
			metrics: prediction.metrics as any,
		}
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
