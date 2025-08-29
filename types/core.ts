// Core types for tattoo preview system

export type BodyPart =
	| 'arm'
	| 'hand'
	| 'ear'
	| 'neck'
	| 'leg'
	| 'back'
	| 'chest'
	| 'shoulder'
	| 'ankle'
	| 'wrist'
	| 'other'

export type TattooVariant = 'black_gray' | 'color' | 'fine_line' | 'watercolor'

export type PreviewStatus = 'queued' | 'running' | 'succeeded' | 'failed'

export interface TattooPromptParams {
	part: BodyPart
	variant: TattooVariant
	scale?: number // 0.1 to 2.0 (10% to 200%)
	rotationDeg?: number // -180 to 180
	opacity?: number // 0.1 to 1.0
	seed?: number
}

export interface VariantParams {
	variant: TattooVariant
	scale?: number
	rotationDeg?: number
	opacity?: number
}

export interface ReplicatePrediction {
	id: string
	status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
	output?: string | Array<string>
	error?: string
	logs?: string
	metrics?: {
		predict_time?: number
		total_time?: number
	}
}

export interface CreditPack {
	id: string
	name: string
	credits: number
	price: number
	stripePriceId: string
}