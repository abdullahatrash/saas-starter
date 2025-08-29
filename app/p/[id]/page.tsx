import { notFound } from 'next/navigation'
import { db } from '@/lib/db/drizzle'
import { previewJobs, previewResults, bodyPhotos, designs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Calendar, Palette, User } from 'lucide-react'

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const jobId = parseInt(id)

	if (isNaN(jobId)) {
		notFound()
	}

	// Get job with related data
	const job = await db
		.select({
			job: previewJobs,
			bodyPhoto: bodyPhotos,
			design: designs,
		})
		.from(previewJobs)
		.leftJoin(bodyPhotos, eq(previewJobs.bodyPhotoId, bodyPhotos.id))
		.leftJoin(designs, eq(previewJobs.designId, designs.id))
		.where(eq(previewJobs.id, jobId))
		.limit(1)

	if (!job[0]) {
		notFound()
	}

	// Get results
	const results = await db
		.select()
		.from(previewResults)
		.where(eq(previewResults.jobId, jobId))
		.orderBy(previewResults.createdAt)

	const { job: jobData, bodyPhoto, design } = job[0]
	const variantParams = jobData.variantParams as any

	return (
		<div className='min-h-screen bg-gray-50'>
			<div className='container mx-auto py-12 px-4'>
				<div className='max-w-4xl mx-auto'>
					{/* Header */}
					<div className='text-center mb-8'>
						<h1 className='text-3xl font-bold mb-2'>Tattoo Preview</h1>
						<p className='text-gray-600'>
							See how this design looks as a tattoo
						</p>
					</div>

					{/* Main Preview */}
					{results.length > 0 ? (
						<Card className='p-8 mb-8'>
							<img
								src={results[0].imageUrl}
								alt='Tattoo Preview'
								className='w-full h-auto rounded-lg shadow-lg'
							/>
						</Card>
					) : jobData.status === 'running' ? (
						<Card className='p-12 mb-8 text-center'>
							<div className='animate-pulse'>
								<div className='w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4'></div>
								<p className='text-gray-600'>Generating preview...</p>
								<p className='text-sm text-gray-500 mt-2'>This usually takes 10-30 seconds</p>
							</div>
						</Card>
					) : jobData.status === 'failed' ? (
						<Card className='p-12 mb-8 text-center'>
							<p className='text-red-600'>Preview generation failed</p>
							<p className='text-sm text-gray-500 mt-2'>Please try again</p>
						</Card>
					) : (
						<Card className='p-12 mb-8 text-center'>
							<p className='text-gray-600'>Preview pending...</p>
						</Card>
					)}

					{/* Details */}
					<div className='grid md:grid-cols-2 gap-6 mb-8'>
						<Card className='p-6'>
							<h2 className='font-semibold mb-4 flex items-center'>
								<Palette className='w-5 h-5 mr-2' />
								Style Details
							</h2>
							<dl className='space-y-2'>
								<div className='flex justify-between'>
									<dt className='text-gray-600'>Style:</dt>
									<dd className='font-medium'>
										{variantParams?.variant === 'black_gray'
											? 'Black & Gray'
											: variantParams?.variant === 'fine_line'
											? 'Fine Line'
											: variantParams?.variant === 'watercolor'
											? 'Watercolor'
											: 'Full Color'}
									</dd>
								</div>
								<div className='flex justify-between'>
									<dt className='text-gray-600'>Body Part:</dt>
									<dd className='font-medium capitalize'>{bodyPhoto?.part}</dd>
								</div>
								{variantParams?.scale && (
									<div className='flex justify-between'>
										<dt className='text-gray-600'>Scale:</dt>
										<dd className='font-medium'>{Math.round(variantParams.scale * 100)}%</dd>
									</div>
								)}
								{variantParams?.opacity && (
									<div className='flex justify-between'>
										<dt className='text-gray-600'>Opacity:</dt>
										<dd className='font-medium'>{Math.round(variantParams.opacity * 100)}%</dd>
									</div>
								)}
							</dl>
						</Card>

						<Card className='p-6'>
							<h2 className='font-semibold mb-4 flex items-center'>
								<Calendar className='w-5 h-5 mr-2' />
								Preview Info
							</h2>
							<dl className='space-y-2'>
								<div className='flex justify-between'>
									<dt className='text-gray-600'>Created:</dt>
									<dd className='font-medium'>
										{new Date(jobData.createdAt).toLocaleDateString()}
									</dd>
								</div>
								<div className='flex justify-between'>
									<dt className='text-gray-600'>Status:</dt>
									<dd className='font-medium capitalize'>{jobData.status}</dd>
								</div>
								<div className='flex justify-between'>
									<dt className='text-gray-600'>Preview ID:</dt>
									<dd className='font-medium'>#{jobData.id}</dd>
								</div>
							</dl>
						</Card>
					</div>

					{/* CTA */}
					<Card className='p-8 text-center bg-gradient-to-r from-purple-50 to-pink-50'>
						<h3 className='text-xl font-semibold mb-2'>Love this design?</h3>
						<p className='text-gray-600 mb-6'>
							Book a consultation with our artists to make it a reality
						</p>
						<div className='flex gap-4 justify-center'>
							<Button size='lg'>
								Book Consultation
							</Button>
							<Button variant='outline' size='lg'>
								Create Your Own
							</Button>
						</div>
					</Card>
				</div>
			</div>
		</div>
	)
}