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

		const timestamp = Date.now()
		const fileName = `${user.id}-${timestamp}-${file.name}`
		const pathname = `tattoo-previews/${fileName}`

		// Use Vercel Blob if token is available
		if (process.env.BLOB_READ_WRITE_TOKEN) {
			const blob = await put(pathname, file, {
				access: 'public',
				contentType: file.type || 'image/jpeg', // Specify the content type
			})
			
			console.log('File uploaded to Vercel Blob:', blob.url, 'Type:', file.type)
			
			return NextResponse.json({
				url: blob.url,
				pathname: blob.pathname,
			})
		} else {
			// Fallback to local storage
			const uploadDir = '/uploads'
			const localFileName = `${user.id}-${timestamp}-${file.name}`
			
			// For local development without Blob, just return a local URL
			// Note: This won't work with Replicate API
			console.warn('No BLOB_READ_WRITE_TOKEN - using local URLs (won\'t work with Replicate)')
			
			return NextResponse.json({
				url: `${uploadDir}/${localFileName}`,
				pathname: localFileName,
			})
		}
	} catch (error) {
		console.error('Upload error:', error)
		return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
	}
}