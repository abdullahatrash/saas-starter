'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Download, ExternalLink, Loader2, XCircle } from 'lucide-react'
import { downloadImage } from '@/lib/image-utils'

export type GalleryCardJob = {
	id: number
	status: string
	createdAt: string
	bodyPart: string | null
	variant: string | null
	result: { imageUrl: string; thumbUrl: string | null } | null
}

function formatLabel(value: string | null) {
	if (!value) return null
	return value
		.split('_')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ')
}

const IN_FLIGHT_STATUSES = ['queued', 'running']
const POLL_INTERVAL_MS = 3000

export function PreviewGalleryCard({ job: initialJob }: { job: GalleryCardJob }) {
	const [job, setJob] = useState(initialJob)
	const [downloading, setDownloading] = useState(false)

	const inFlight = IN_FLIGHT_STATUSES.includes(job.status)

	// Live status for in-flight jobs: poll the existing status endpoint until
	// the job settles (succeeded/failed).
	useEffect(() => {
		if (!inFlight) return

		let cancelled = false
		const poll = async () => {
			try {
				const response = await fetch(`/api/preview/${job.id}`)
				if (!response.ok || cancelled) return
				const data = await response.json()
				if (cancelled || !data?.job) return
				const latest = data.results?.[data.results.length - 1]
				setJob((prev) => ({
					...prev,
					status: data.job.status,
					result: latest
						? { imageUrl: latest.imageUrl, thumbUrl: latest.thumbUrl ?? null }
						: prev.result,
				}))
			} catch {
				// Transient polling errors are ignored; the next tick retries.
			}
		}

		poll()
		const interval = setInterval(poll, POLL_INTERVAL_MS)
		return () => {
			cancelled = true
			clearInterval(interval)
		}
	}, [inFlight, job.id])

	const handleDownload = async () => {
		if (!job.result) return
		setDownloading(true)
		try {
			await downloadImage(job.result.imageUrl, `tattoo-preview-${job.id}.jpg`)
		} finally {
			setDownloading(false)
		}
	}

	const succeeded = job.status === 'succeeded'
	const failed = job.status === 'failed'
	const bodyPart = formatLabel(job.bodyPart)
	const variant = formatLabel(job.variant)

	return (
		<Card className='overflow-hidden p-0 gap-0'>
			<div className='relative aspect-square bg-gray-100'>
				{succeeded && job.result ? (
					<img
						src={job.result.thumbUrl || job.result.imageUrl}
						alt={`Tattoo preview ${job.id}`}
						className='h-full w-full object-cover'
						loading='lazy'
					/>
				) : failed ? (
					<div className='flex h-full w-full flex-col items-center justify-center gap-2 text-red-500'>
						<XCircle className='h-8 w-8' />
						<span className='text-sm font-medium'>Generation failed</span>
					</div>
				) : (
					<div className='flex h-full w-full flex-col items-center justify-center gap-2 text-gray-500'>
						<Loader2 className='h-8 w-8 animate-spin' />
						<span className='text-sm font-medium capitalize'>{job.status}…</span>
					</div>
				)}
				<span
					className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
						succeeded
							? 'bg-green-100 text-green-700'
							: failed
								? 'bg-red-100 text-red-700'
								: 'bg-amber-100 text-amber-700'
					}`}
				>
					{job.status}
				</span>
			</div>

			<div className='p-4'>
				<div className='text-sm font-medium'>
					{[bodyPart, variant].filter(Boolean).join(' · ') || 'Preview'}
				</div>
				<div className='mt-1 text-xs text-gray-500'>
					{new Date(job.createdAt).toLocaleDateString(undefined, {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
					})}
				</div>

				<div className='mt-3 flex gap-2'>
					<Button asChild variant='outline' size='sm' className='flex-1'>
						<Link href={`/p/${job.id}`}>
							<ExternalLink className='h-4 w-4' />
							Open
						</Link>
					</Button>
					{succeeded && job.result && (
						<Button
							variant='outline'
							size='sm'
							className='flex-1'
							onClick={handleDownload}
							disabled={downloading}
						>
							{downloading ? (
								<Loader2 className='h-4 w-4 animate-spin' />
							) : (
								<Download className='h-4 w-4' />
							)}
							Download
						</Button>
					)}
				</div>
			</div>
		</Card>
	)
}
