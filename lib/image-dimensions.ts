// Best-effort probe of a remote image's pixel dimensions. nano-banana-2's
// prediction metadata does not include output dimensions, so the only way to
// record real values is to fetch the image and read its header. Any failure
// (network, unknown format, truncated data) yields null — callers store null
// dimensions rather than fabricated ones.

export interface ImageDimensions {
	width: number
	height: number
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

function parsePng(buf: Buffer): ImageDimensions | null {
	if (buf.length < 24 || !buf.subarray(0, 8).equals(PNG_SIGNATURE)) return null
	if (buf.toString('ascii', 12, 16) !== 'IHDR') return null
	return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

function parseJpeg(buf: Buffer): ImageDimensions | null {
	if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null
	let offset = 2
	while (offset + 9 < buf.length) {
		if (buf[offset] !== 0xff) {
			offset += 1
			continue
		}
		const marker = buf[offset + 1]
		// SOF0–SOF15 (excluding DHT/JPG/DAC) carry the frame dimensions.
		if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
			return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) }
		}
		// Standalone markers have no length field.
		if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
			offset += 2
			continue
		}
		offset += 2 + buf.readUInt16BE(offset + 2)
	}
	return null
}

export async function probeImageDimensions(url: string): Promise<ImageDimensions | null> {
	try {
		const response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
		if (!response.ok) return null
		const buf = Buffer.from(await response.arrayBuffer())
		return parsePng(buf) ?? parseJpeg(buf)
	} catch (error) {
		console.warn(`Could not probe image dimensions for ${url}:`, error)
		return null
	}
}
