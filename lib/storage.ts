import { put, del } from '@vercel/blob'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const isProduction = process.env.NODE_ENV === 'production'
const uploadDir = join(process.cwd(), 'public', 'uploads')

// Initialize upload directory for local development
async function ensureUploadDir() {
	if (!isProduction && !existsSync(uploadDir)) {
		await mkdir(uploadDir, { recursive: true })
	}
}

export interface UploadResult {
	url: string
	pathname: string
}

export async function uploadFile(
	file: File | Buffer,
	pathname: string
): Promise<UploadResult> {
	// Use Vercel Blob if token is available (both dev and production)
	if (process.env.BLOB_READ_WRITE_TOKEN) {
		// Use Vercel Blob
		const blob = await put(pathname, file, {
			access: 'public',
		})
		return {
			url: blob.url,
			pathname: blob.pathname,
		}
	} else {
		// Fallback to local file system only if no Blob token
		await ensureUploadDir()
		const fileName = pathname.split('/').pop() || 'file'
		const localPath = join(uploadDir, fileName)
		
		const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file
		await writeFile(localPath, buffer)
		
		return {
			url: `/uploads/${fileName}`,
			pathname: localPath,
		}
	}
}

export async function deleteFile(pathname: string): Promise<void> {
	if (process.env.BLOB_READ_WRITE_TOKEN) {
		await del(pathname)
	} else {
		// Delete from local file system
		const fileName = pathname.split('/').pop() || 'file'
		const localPath = join(uploadDir, fileName)
		if (existsSync(localPath)) {
			await unlink(localPath)
		}
	}
}

export async function generateUploadUrl(pathname: string): Promise<{
	uploadUrl: string
	publicUrl: string
}> {
	if (isProduction && process.env.BLOB_READ_WRITE_TOKEN) {
		// In production, we'll handle uploads through our API
		const baseUrl = process.env.NEXT_PUBLIC_URL || ''
		return {
			uploadUrl: `${baseUrl}/api/upload`,
			publicUrl: '', // Will be returned after upload
		}
	} else {
		// In development, use local upload endpoint
		return {
			uploadUrl: '/api/upload',
			publicUrl: '', // Will be returned after upload
		}
	}
}