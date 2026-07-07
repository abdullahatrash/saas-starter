import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { getPreviewJobsForUser, getUser } from '@/lib/db/queries'
import { PreviewGalleryCard } from '@/components/preview-gallery-card'

export const dynamic = 'force-dynamic'

export default async function MyPreviewsPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>
}) {
	const user = await getUser()
	if (!user) {
		redirect('/sign-in')
	}

	const { page: pageParam } = await searchParams
	const requestedPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
	const { jobs, totalCount, page, pageSize } =
		await getPreviewJobsForUser(requestedPage)
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

	return (
		<div className='container mx-auto max-w-6xl px-4 py-8'>
			<div className='mb-8 flex flex-wrap items-end justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-bold'>My Previews</h1>
					<p className='mt-2 text-gray-600'>
						All your tattoo previews, newest first
					</p>
				</div>
				<Button asChild>
					<Link href='/studio'>New Preview</Link>
				</Button>
			</div>

			{jobs.length === 0 ? (
				<div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-24 text-center'>
					<ImageIcon className='h-10 w-10 text-gray-400' />
					<p className='mt-4 font-medium'>No previews yet</p>
					<p className='mt-1 text-sm text-gray-500'>
						Head to the studio to create your first tattoo preview.
					</p>
					<Button asChild className='mt-4'>
						<Link href='/studio'>Open Studio</Link>
					</Button>
				</div>
			) : (
				<>
					<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
						{jobs.map((job) => (
							<PreviewGalleryCard
								key={job.id}
								job={{
									id: job.id,
									status: job.status,
									createdAt: job.createdAt.toISOString(),
									bodyPart: job.bodyPart,
									variant: job.variant,
									result: job.result,
								}}
							/>
						))}
					</div>

					{totalPages > 1 && (
						<div className='mt-8 flex items-center justify-center gap-4'>
							<Button
								asChild
								variant='outline'
								size='sm'
								disabled={page <= 1}
							>
								{page > 1 ? (
									<Link href={`/previews?page=${page - 1}`}>
										<ChevronLeft className='h-4 w-4' />
										Previous
									</Link>
								) : (
									<span>
										<ChevronLeft className='h-4 w-4' />
										Previous
									</span>
								)}
							</Button>
							<span className='text-sm text-gray-600'>
								Page {page} of {totalPages}
							</span>
							<Button
								asChild
								variant='outline'
								size='sm'
								disabled={page >= totalPages}
							>
								{page < totalPages ? (
									<Link href={`/previews?page=${page + 1}`}>
										Next
										<ChevronRight className='h-4 w-4' />
									</Link>
								) : (
									<span>
										Next
										<ChevronRight className='h-4 w-4' />
									</span>
								)}
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	)
}
