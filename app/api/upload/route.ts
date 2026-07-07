import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getUser } from '@/lib/db/queries'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
	try {
		const user = await getUser()
		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const formData = await request.formData()
		const file = formData.get('file') as File

		if (!file) {
			return NextResponse.json({ error: 'No file provided' }, { status: 400 })
		}

		// Validate file type
		const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
		if (!validTypes.includes(file.type)) {
			return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
		}

		// Validate file size (max 10MB)
		if (file.size > 10 * 1024 * 1024) {
			return NextResponse.json({ error: 'File too large' }, { status: 400 })
		}

		// Replicate can only fetch publicly hosted images, so Vercel Blob is the
		// only supported upload target. Without a token there is no usable URL to
		// return, so fail loudly rather than hand back a URL that points nowhere.
		if (!process.env.BLOB_READ_WRITE_TOKEN) {
			console.error('Upload failed: BLOB_READ_WRITE_TOKEN is not configured')
			return NextResponse.json(
				{ error: 'Image storage is not configured' },
				{ status: 500 }
			)
		}

		const timestamp = Date.now()
		const fileName = `${user.id}-${timestamp}-${file.name}`
		const pathname = `tattoo-previews/${fileName}`

		const blob = await put(pathname, file, {
			access: 'public',
			contentType: file.type || 'image/jpeg',
		})

		return NextResponse.json({
			url: blob.url,
			pathname: blob.pathname,
		})
	} catch (error) {
		console.error('Upload error:', error)
		return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
	}
}