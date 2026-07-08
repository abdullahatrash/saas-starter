// Core types for tattoo & piercing preview system

// Which kind of preview the studio is generating. Tattoo overlays a design on
// skin; piercing overlays a jewelry photo on a placement like an ear or nose.
export type StudioMode = 'tattoo' | 'piercing'

export type BodyPart =
	| 'upper_arm'
	| 'forearm'
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

export type PiercingPlacement =
	| 'ear_lobe'
	| 'helix'
	| 'tragus'
	| 'conch'
	| 'industrial'
	| 'nostril'
	| 'septum'
	| 'eyebrow'
	| 'lip'
	| 'navel'
	| 'other'

// Metal finish for piercing previews. 'as_photo' keeps whatever metal the
// uploaded jewelry photo shows; the rest override it.
export type JewelryFinish = 'as_photo' | 'gold' | 'silver' | 'rose_gold' | 'black'

// Placement/style unions across both studio modes. The DB stores these as
// plain strings, so widening here needs no migration.
export type PreviewPlacement = BodyPart | PiercingPlacement
export type PreviewVariant = TattooVariant | JewelryFinish

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
	status: 'queued' | 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
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