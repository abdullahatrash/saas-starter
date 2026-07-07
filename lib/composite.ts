// Client-side placement + compositing for the visual editor.
//
// The design is placed over the body photo with a resolution-independent
// transform: everything is expressed as a fraction of the body image so the
// on-screen overlay and the full-resolution composite agree exactly. The editor
// updates a PlacementTransform live; on Generate we render the same transform
// onto an offscreen canvas at the body photo's natural resolution and upload the
// result.

export interface PlacementTransform {
	// Center of the design as a fraction of the body image (0..1).
	cx: number
	cy: number
	// Design width as a fraction of the body image width. Height follows from the
	// design's own aspect ratio, so the design is never distorted.
	scale: number
	rotationDeg: number
	// 0..1 — drawn as canvas alpha, not described in the prompt.
	opacity: number
}

export const DEFAULT_TRANSFORM: PlacementTransform = {
	cx: 0.5,
	cy: 0.5,
	scale: 0.35,
	rotationDeg: 0,
	opacity: 1,
}

// Loads an image for canvas use. `crossOrigin: 'anonymous'` lets us draw
// Vercel Blob URLs (which return `Access-Control-Allow-Origin: *`) without
// tainting the canvas, so `toBlob` stays readable.
export function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.crossOrigin = 'anonymous'
		img.onload = () => resolve(img)
		img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
		img.src = src
	})
}

// Renders the body photo with the design overlaid at `transform`, at the body
// photo's natural resolution. Returns a JPEG blob ready to upload.
export async function renderComposite(
	bodyUrl: string,
	designUrl: string,
	transform: PlacementTransform
): Promise<Blob> {
	const [body, design] = await Promise.all([loadImage(bodyUrl), loadImage(designUrl)])

	const width = body.naturalWidth || body.width
	const height = body.naturalHeight || body.height

	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	const ctx = canvas.getContext('2d')
	if (!ctx) throw new Error('Could not get canvas context')

	ctx.drawImage(body, 0, 0, width, height)

	const designAspect =
		(design.naturalWidth || design.width) / (design.naturalHeight || design.height)
	const drawWidth = transform.scale * width
	const drawHeight = drawWidth / designAspect

	ctx.save()
	ctx.globalAlpha = Math.max(0, Math.min(1, transform.opacity))
	ctx.translate(transform.cx * width, transform.cy * height)
	ctx.rotate((transform.rotationDeg * Math.PI) / 180)
	ctx.drawImage(design, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
	ctx.restore()

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Failed to render composite'))),
			'image/jpeg',
			0.92
		)
	})
}
