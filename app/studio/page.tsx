'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Upload, Loader2, Download, Share2, RotateCw, ZoomIn, Eye } from 'lucide-react'
import type { BodyPart, TattooVariant, TattooPromptParams } from '@/types/core'
import { buildTattooPrompt } from '@/lib/prompt'

const bodyParts: Array<{ value: BodyPart; label: string }> = [
	{ value: 'arm', label: 'Arm' },
	{ value: 'hand', label: 'Hand' },
	{ value: 'neck', label: 'Neck' },
	{ value: 'back', label: 'Back' },
	{ value: 'chest', label: 'Chest' },
	{ value: 'shoulder', label: 'Shoulder' },
	{ value: 'leg', label: 'Leg' },
	{ value: 'ankle', label: 'Ankle' },
	{ value: 'wrist', label: 'Wrist' },
]

const variants: Array<{ value: TattooVariant; label: string }> = [
	{ value: 'black_gray', label: 'Black & Gray' },
	{ value: 'color', label: 'Full Color' },
	{ value: 'fine_line', label: 'Fine Line' },
	{ value: 'watercolor', label: 'Watercolor' },
]

export default function StudioPage() {
	const [bodyImage, setBodyImage] = useState<string | null>(null)
	const [designImage, setDesignImage] = useState<string | null>(null)
	const [selectedPart, setSelectedPart] = useState<BodyPart>('arm')
	const [selectedVariant, setSelectedVariant] = useState<TattooVariant>('black_gray')
	const [scale, setScale] = useState(100)
	const [rotation, setRotation] = useState(0)
	const [opacity, setOpacity] = useState(100)
	const [customPrompt, setCustomPrompt] = useState('')
	const [useCustomPrompt, setUseCustomPrompt] = useState(false)
	const [generatedPrompt, setGeneratedPrompt] = useState('')
	const [showGeneratedPrompt, setShowGeneratedPrompt] = useState(false)
	const [isGenerating, setIsGenerating] = useState(false)
	const [previewResult, setPreviewResult] = useState<string | null>(null)
	const [jobId, setJobId] = useState<number | null>(null)
	const [credits, setCredits] = useState<number | null>(null)

	// Generate prompt preview when parameters change
	useEffect(() => {
		if (!useCustomPrompt) {
			const params: TattooPromptParams = {
				part: selectedPart,
				variant: selectedVariant,
				scale: scale / 100,
				rotationDeg: rotation,
				opacity: opacity / 100,
			}
			setGeneratedPrompt(buildTattooPrompt(params))
		}
	}, [selectedPart, selectedVariant, scale, rotation, opacity, useCustomPrompt])

	const handleFileUpload = useCallback(
		async (file: File, type: 'body' | 'design') => {
			const formData = new FormData()
			formData.append('file', file)

			try {
				const response = await fetch('/api/upload', {
					method: 'POST',
					body: formData,
				})

				if (!response.ok) throw new Error('Upload failed')

				const { url } = await response.json()
				if (type === 'body') {
					setBodyImage(url)
				} else {
					setDesignImage(url)
				}
			} catch (error) {
				console.error('Upload error:', error)
				alert('Failed to upload image')
			}
		},
		[]
	)

	const generatePreview = async () => {
		if (!bodyImage || !designImage) {
			alert('Please upload both body photo and design')
			return
		}

		setIsGenerating(true)
		setPreviewResult(null)

		try {
			const response = await fetch('/api/preview', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					bodyImageUrl: bodyImage,
					designImageUrl: designImage,
					part: selectedPart,
					variant: selectedVariant,
					scale: scale / 100,
					rotationDeg: rotation,
					opacity: opacity / 100,
					customPrompt: useCustomPrompt ? customPrompt : null,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				if (response.status === 402) {
					if (data.error?.includes('Replicate')) {
						alert(data.error)
					} else {
						alert(`Insufficient credits. You have ${data.credits} credits remaining.`)
					}
				} else if (response.status === 400 && data.error?.includes('localhost')) {
					alert(`${data.error}\n\n${data.suggestion || ''}`)
				} else {
					alert(data.error || 'Generation failed')
				}
				setIsGenerating(false)
				return
			}

			setJobId(data.jobId)
			setCredits(data.creditsRemaining)

			// Poll for results
			const pollInterval = setInterval(async () => {
				const statusResponse = await fetch(`/api/preview/${data.jobId}`)
				const statusData = await statusResponse.json()

				if (statusData.job.status === 'succeeded' && statusData.results.length > 0) {
					setPreviewResult(statusData.results[0].imageUrl)
					clearInterval(pollInterval)
					setIsGenerating(false)
				} else if (statusData.job.status === 'failed') {
					clearInterval(pollInterval)
					setIsGenerating(false)
					const errorMsg = statusData.job.error || 'Preview generation failed'
					alert(errorMsg)
				}
			}, 2000)
		} catch (error) {
			console.error('Generation error:', error)
			alert('Failed to generate preview')
			setIsGenerating(false)
		}
	}

	return (
		<div className='container mx-auto py-8 px-4'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold'>Tattoo Preview Studio</h1>
				<p className='text-gray-600 mt-2'>
					Upload a body photo and design to see how your tattoo will look
				</p>
				{credits !== null && (
					<div className='flex items-center gap-2 mt-1'>
						<p className='text-sm text-gray-500'>
							Credits: {credits === 999999 ? 'Unlimited (Dev Mode)' : credits}
						</p>
						{credits === 999999 && (
							<span className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded'>DEV MODE</span>
						)}
					</div>
				)}
			</div>

			<div className='grid lg:grid-cols-2 gap-8'>
				{/* Controls Panel */}
				<div className='space-y-6'>
					{/* Upload Section */}
					<Card className='p-6'>
						<h2 className='text-xl font-semibold mb-4'>Upload Images</h2>
						
						<div className='space-y-4'>
							<div>
								<Label htmlFor='body-upload'>Body Photo</Label>
								<div className='mt-2'>
									<label
										htmlFor='body-upload'
										className='flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400'
									>
										{bodyImage ? (
											<img
												src={bodyImage}
												alt='Body'
												className='h-full object-contain'
											/>
										) : (
											<div className='flex flex-col items-center'>
												<Upload className='w-8 h-8 text-gray-400' />
												<span className='mt-2 text-sm text-gray-500'>
													Upload body photo
												</span>
											</div>
										)}
										<input
											id='body-upload'
											type='file'
											className='hidden'
											accept='image/*'
											onChange={(e) =>
												e.target.files?.[0] &&
												handleFileUpload(e.target.files[0], 'body')
											}
										/>
									</label>
								</div>
							</div>

							<div>
								<Label htmlFor='design-upload'>Tattoo Design</Label>
								<div className='mt-2'>
									<label
										htmlFor='design-upload'
										className='flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400'
									>
										{designImage ? (
											<img
												src={designImage}
												alt='Design'
												className='h-full object-contain'
											/>
										) : (
											<div className='flex flex-col items-center'>
												<Upload className='w-8 h-8 text-gray-400' />
												<span className='mt-2 text-sm text-gray-500'>
													Upload tattoo design
												</span>
											</div>
										)}
										<input
											id='design-upload'
											type='file'
											className='hidden'
											accept='image/*'
											onChange={(e) =>
												e.target.files?.[0] &&
												handleFileUpload(e.target.files[0], 'design')
											}
										/>
									</label>
								</div>
							</div>
						</div>
					</Card>

					{/* Body Part Selection */}
					<Card className='p-6'>
						<h2 className='text-xl font-semibold mb-4'>Body Part</h2>
						<div className='grid grid-cols-3 gap-2'>
							{bodyParts.map((part) => (
								<Button
									key={part.value}
									variant={selectedPart === part.value ? 'default' : 'outline'}
									size='sm'
									onClick={() => setSelectedPart(part.value)}
								>
									{part.label}
								</Button>
							))}
						</div>
					</Card>

					{/* Style Selection */}
					<Card className='p-6'>
						<h2 className='text-xl font-semibold mb-4'>Tattoo Style</h2>
						<RadioGroup value={selectedVariant} onValueChange={(v) => setSelectedVariant(v as TattooVariant)}>
							{variants.map((variant) => (
								<div key={variant.value} className='flex items-center space-x-2'>
									<RadioGroupItem value={variant.value} id={variant.value} />
									<Label htmlFor={variant.value}>{variant.label}</Label>
								</div>
							))}
						</RadioGroup>
					</Card>

					{/* Adjustments */}
					<Card className='p-6'>
						<h2 className='text-xl font-semibold mb-4'>Adjustments</h2>
						<div className='space-y-4'>
							<div>
								<Label>Scale: {scale}%</Label>
								<input
									type='range'
									min='50'
									max='150'
									value={scale}
									onChange={(e) => setScale(parseInt(e.target.value))}
									className='w-full mt-2'
								/>
							</div>
							<div>
								<Label>Rotation: {rotation}°</Label>
								<input
									type='range'
									min='-180'
									max='180'
									value={rotation}
									onChange={(e) => setRotation(parseInt(e.target.value))}
									className='w-full mt-2'
								/>
							</div>
							<div>
								<Label>Opacity: {opacity}%</Label>
								<input
									type='range'
									min='50'
									max='100'
									value={opacity}
									onChange={(e) => setOpacity(parseInt(e.target.value))}
									className='w-full mt-2'
								/>
							</div>
						</div>
					</Card>

					{/* Custom Prompt */}
					<Card className='p-6'>
						<h2 className='text-xl font-semibold mb-4'>Prompt</h2>
						<div className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center space-x-2'>
									<input
										type='checkbox'
										id='use-custom-prompt'
										checked={useCustomPrompt}
										onChange={(e) => {
											setUseCustomPrompt(e.target.checked)
											setShowGeneratedPrompt(false)
										}}
										className='rounded border-gray-300'
									/>
									<Label htmlFor='use-custom-prompt'>Use custom prompt</Label>
								</div>
								{!useCustomPrompt && (
									<Button
										variant='outline'
										size='sm'
										onClick={() => setShowGeneratedPrompt(!showGeneratedPrompt)}
									>
										<Eye className='w-4 h-4 mr-1' />
										{showGeneratedPrompt ? 'Hide' : 'Show'} Generated
									</Button>
								)}
							</div>
							
							{useCustomPrompt ? (
								<textarea
									placeholder='Enter your custom prompt (e.g., "Apply the tattoo design from the second image onto the arm in the first image. Make it look realistic and natural.")'
									value={customPrompt}
									onChange={(e) => setCustomPrompt(e.target.value)}
									className='w-full p-3 border rounded-lg min-h-[120px] resize-y'
								/>
							) : showGeneratedPrompt ? (
								<div className='p-3 bg-gray-50 border rounded-lg'>
									<p className='text-sm font-mono text-gray-700'>{generatedPrompt}</p>
								</div>
							) : (
								<div className='p-3 bg-gray-50 border border-dashed rounded-lg'>
									<p className='text-sm text-gray-500'>
										Auto-generated based on your selections above. Click "Show Generated" to preview.
									</p>
								</div>
							)}
						</div>
					</Card>

					{/* Generate Button */}
					<Button
						onClick={generatePreview}
						disabled={isGenerating || !bodyImage || !designImage}
						className='w-full'
						size='lg'
					>
						{isGenerating ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Generating Preview...
							</>
						) : (
							<>
								<ZoomIn className='mr-2 h-4 w-4' />
								Generate Preview (1 Credit)
							</>
						)}
					</Button>
				</div>

				{/* Preview Panel */}
				<div className='space-y-6'>
					<Card className='p-6 min-h-[600px] flex items-center justify-center'>
						{previewResult ? (
							<div className='w-full'>
								<img
									src={previewResult}
									alt='Tattoo Preview'
									className='w-full h-auto rounded-lg'
								/>
								<div className='flex gap-2 mt-4'>
									<Button variant='outline' size='sm' className='flex-1'>
										<Download className='mr-2 h-4 w-4' />
										Download
									</Button>
									<Button variant='outline' size='sm' className='flex-1'>
										<Share2 className='mr-2 h-4 w-4' />
										Share
									</Button>
									<Button
										variant='outline'
										size='sm'
										className='flex-1'
										onClick={generatePreview}
										disabled={isGenerating}
									>
										<RotateCw className='mr-2 h-4 w-4' />
										Regenerate
									</Button>
								</div>
							</div>
						) : (
							<div className='text-center text-gray-500'>
								<ZoomIn className='w-16 h-16 mx-auto mb-4 text-gray-300' />
								<p>Your tattoo preview will appear here</p>
								<p className='text-sm mt-2'>Upload images and click Generate to start</p>
							</div>
						)}
					</Card>

					{jobId && (
						<Card className='p-4'>
							<p className='text-sm text-gray-600'>
								Share this preview:{' '}
								<a
									href={`/p/${jobId}`}
									target='_blank'
									rel='noopener noreferrer'
									className='text-blue-600 hover:underline'
								>
									{`${window.location.origin}/p/${jobId}`}
								</a>
							</p>
						</Card>
					)}
				</div>
			</div>
		</div>
	)
}