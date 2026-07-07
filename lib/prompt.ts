import type { BodyPart, TattooPromptParams, TattooVariant } from '@/types/core'

// Map technical body part names to natural language.
const partNames: Record<string, string> = {
	'upper_arm': 'upper arm',
	'forearm': 'forearm',
	'hand': 'hand',
	'neck': 'neck',
	'back': 'back',
	'chest': 'chest',
	'shoulder': 'shoulder',
	'leg': 'leg',
	'ankle': 'ankle',
	'wrist': 'wrist',
	'ear': 'ear',
	'other': 'body part'
}

function styleClause(variant: TattooVariant): string {
	if (variant === 'black_gray') return 'Render it as a black and grey tattoo with no color. '
	if (variant === 'fine_line') return 'Render it as a fine line tattoo with delicate strokes. '
	if (variant === 'watercolor') return 'Render it as a watercolor style tattoo with soft edges and color diffusion. '
	return 'Render it as a full color realistic tattoo. '
}

// Prompt used when the client sends a composite — the body photo with the design
// already overlaid at the user's chosen position, size, rotation, and opacity.
// The placement is carried by the pixels, so this prompt must NOT restate scale,
// rotation, or opacity as prose; it only asks the model to turn the rough
// overlay into a believable tattoo where it already sits.
export function buildCompositePrompt(params: { part: BodyPart; variant: TattooVariant }): string {
	const bodyPart = partNames[params.part] || params.part

	let prompt =
		`The first image is a photo of a ${bodyPart} with a tattoo design roughly overlaid to show its intended placement, size, and angle. ` +
		`The second image is the clean tattoo design for reference. ` +
		`Turn the overlaid design into a realistic tattoo on the skin, keeping it in exactly the same position, size, and orientation as shown in the first image — do not move, resize, straighten, or reinterpret it. `

	prompt += styleClause(params.variant)

	prompt +=
		`Integrate it into the skin so it looks like real ink: follow the body's natural contours so the design wraps over the surface, ` +
		`match the photo's lighting, shadows, and skin texture, and blend the edges naturally. ` +
		`Preserve every detail and element of the design from the second image without alterations.`

	return prompt
}

export function buildTattooPrompt(params: TattooPromptParams): string {
	const bodyPart = partNames[params.part] || params.part

	// Build natural language prompt like in Replicate UI examples
	let prompt = `Apply the tattoo design from the second image onto the ${bodyPart} shown in the first image. Keep the tattoo design exactly as it appears in the second image - do not modify or reinterpret the design. `
	
	// Add style instructions
	if (params.variant === 'black_gray') {
		prompt += 'Make it a black and grey tattoo with no color. '
	} else if (params.variant === 'fine_line') {
		prompt += 'Make it a fine line tattoo with delicate strokes. '
	} else if (params.variant === 'watercolor') {
		prompt += 'Make it a watercolor style tattoo with soft edges and color diffusion. '
	} else {
		prompt += 'Make it a full color realistic tattoo. '
	}
	
	// Add size if not default
	if (params.scale && params.scale !== 1) {
		const percentage = Math.round(params.scale * 100)
		if (percentage > 100) {
			prompt += `Make the tattoo larger, about ${percentage}% of the original design size. `
		} else {
			prompt += `Make the tattoo smaller, about ${percentage}% of the original design size. `
		}
	}
	
	// Add rotation if specified
	if (params.rotationDeg && params.rotationDeg !== 0) {
		prompt += `Rotate the design ${Math.abs(params.rotationDeg)} degrees ${params.rotationDeg > 0 ? 'clockwise' : 'counter-clockwise'}. `
	}
	
	// Add opacity/fade effect if not full
	if (params.opacity && params.opacity < 1) {
		const percentage = Math.round(params.opacity * 100)
		prompt += `Make the tattoo appear faded or lighter, about ${percentage}% opacity. `
	}
	
	// Add realism instructions
	prompt += 'Make the scene natural. The tattoo should look realistic on the skin, following the body\'s natural contours and lighting. Preserve all details and elements from the original tattoo design without alterations.'
	
	return prompt
}

// Helper to build variation prompt with minor changes
export function buildVariationPrompt(
	baseParams: TattooPromptParams,
	changes: Partial<TattooPromptParams>
): string {
	return buildTattooPrompt({ ...baseParams, ...changes })
}