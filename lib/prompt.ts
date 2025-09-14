import type { TattooPromptParams } from '@/types/core'

export function buildTattooPrompt(params: TattooPromptParams): string {
	// Map technical body part names to natural language
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