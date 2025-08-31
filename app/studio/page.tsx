'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Loader2, Download, Share2, RotateCw, ZoomIn, Eye, AlertCircle, RefreshCw } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import type { BodyPart, TattooVariant, TattooPromptParams } from '@/types/core'
import { buildTattooPrompt } from '@/lib/prompt'
import { useFileUpload, formatBytes } from '@/hooks/use-file-upload'
import { compressImage, validateImageFile, downloadImage, copyToClipboard } from '@/lib/image-utils'
import { STUDIO_ERROR_MESSAGES, STUDIO_SUCCESS_MESSAGES, STUDIO_INFO_MESSAGES } from '@/lib/studio-errors'
import { ImageZoom } from '@/components/ui/kibo-ui/image-zoom'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

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
	const [bodyImageUrl, setBodyImageUrl] = useState<string | null>(null)
	const [designImageUrl, setDesignImageUrl] = useState<string | null>(null)
	const [selectedPart, setSelectedPart] = useState<BodyPart>('arm')
	const [selectedVariant, setSelectedVariant] = useState<TattooVariant>('black_gray')
	const [scale, setScale] = useState(100)
	const [rotation, setRotation] = useState(0)
	const [opacity, setOpacity] = useState(100)
	const [customPrompt, setCustomPrompt] = useState('')
	const [useCustomPrompt, setUseCustomPrompt] = useState(false)
	const [generatedPrompt, setGeneratedPrompt] = useState('')
	const [showGeneratedPrompt, setShowGeneratedPrompt] = useState(false)
	// Dynamic prompt builder states
	const [promptRealism, setPromptRealism] = useState('realistic')
	const [promptBlending, setPromptBlending] = useState('natural')
	const [promptDetails, setPromptDetails] = useState('')
	const [isGenerating, setIsGenerating] = useState(false)
	const [isUploading, setIsUploading] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const [previewResult, setPreviewResult] = useState<string | null>(null)
	const [jobId, setJobId] = useState<number | null>(null)
	const [credits, setCredits] = useState<number | null>(null)
	const [generationProgress, setGenerationProgress] = useState(0)
	const [recentPreviews, setRecentPreviews] = useState<Array<{ id: number; url: string; createdAt: Date }>>([])

	// File upload hooks for body and design images
	const [
		{ files: bodyFiles, isDragging: bodyDragging, errors: bodyErrors },
		{
			handleDragEnter: bodyDragEnter,
			handleDragLeave: bodyDragLeave,
			handleDragOver: bodyDragOver,
			handleDrop: bodyDrop,
			openFileDialog: openBodyDialog,
			removeFile: removeBodyFile,
			getInputProps: getBodyInputProps,
		},
	] = useFileUpload({
		accept: 'image/jpeg,image/jpg,image/png,image/webp',
		maxSize: 10 * 1024 * 1024, // 10MB
		multiple: false,
	})

	const [
		{ files: designFiles, isDragging: designDragging, errors: designErrors },
		{
			handleDragEnter: designDragEnter,
			handleDragLeave: designDragLeave,
			handleDragOver: designDragOver,
			handleDrop: designDrop,
			openFileDialog: openDesignDialog,
			removeFile: removeDesignFile,
			getInputProps: getDesignInputProps,
		},
	] = useFileUpload({
		accept: 'image/jpeg,image/jpg,image/png,image/webp',
		maxSize: 10 * 1024 * 1024, // 10MB
		multiple: false,
	})

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
			let basePrompt = buildTattooPrompt(params)
			
			// Add dynamic enhancements
			if (promptRealism === 'photorealistic') {
				basePrompt += ', photorealistic quality, high detail'
			} else if (promptRealism === 'artistic') {
				basePrompt += ', artistic style, stylized'
			}
			
			if (promptBlending === 'seamless') {
				basePrompt += ', seamlessly blended with skin'
			} else if (promptBlending === 'bold') {
				basePrompt += ', bold and prominent'
			}
			
			if (promptDetails) {
				basePrompt += `, ${promptDetails}`
			}
			
			setGeneratedPrompt(basePrompt)
		}
	}, [selectedPart, selectedVariant, scale, rotation, opacity, useCustomPrompt, promptRealism, promptBlending, promptDetails])

	// Handle file uploads when files change
	useEffect(() => {
		if (bodyFiles.length > 0 && !bodyImageUrl) {
			handleFileUpload(bodyFiles[0].file as File, 'body')
		}
	}, [bodyFiles])

	useEffect(() => {
		if (designFiles.length > 0 && !designImageUrl) {
			handleFileUpload(designFiles[0].file as File, 'design')
		}
	}, [designFiles])

	const handleFileUpload = useCallback(
		async (file: File, type: 'body' | 'design') => {
			// Validate file
			const validation = validateImageFile(file)
			if (!validation.valid) {
				toast.error(validation.error)
				return
			}

			setIsUploading(true)
			setUploadProgress(0)

			try {
				// Show compression toast
				const compressionToast = toast.loading(STUDIO_INFO_MESSAGES.COMPRESSING)
				
				// Compress image
				const compressedFile = await compressImage(file, {
					maxSizeMB: 2,
					maxWidthOrHeight: 2048,
					onProgress: (progress) => {
						setUploadProgress(progress * 50) // First 50% for compression
					},
				})

				toast.dismiss(compressionToast)
				
				// Upload compressed file
				const uploadToast = toast.loading(STUDIO_INFO_MESSAGES.UPLOADING)
				setUploadProgress(50)

				const formData = new FormData()
				formData.append('file', compressedFile)

				const response = await fetch('/api/upload', {
					method: 'POST',
					body: formData,
				})

				setUploadProgress(100)
				toast.dismiss(uploadToast)

				if (!response.ok) {
					throw new Error(STUDIO_ERROR_MESSAGES.UPLOAD_FAILED)
				}

				const { url } = await response.json()
				
				if (type === 'body') {
					setBodyImageUrl(url)
				} else {
					setDesignImageUrl(url)
				}
				
				toast.success(STUDIO_SUCCESS_MESSAGES.UPLOAD_SUCCESS)
			} catch (error) {
				console.error('Upload error:', error)
				toast.error(error instanceof Error ? error.message : STUDIO_ERROR_MESSAGES.UPLOAD_FAILED)
				
				// Remove the file from the list if upload failed
				if (type === 'body' && bodyFiles.length > 0) {
					removeBodyFile(bodyFiles[0].id)
				} else if (type === 'design' && designFiles.length > 0) {
					removeDesignFile(designFiles[0].id)
				}
			} finally {
				setIsUploading(false)
				setUploadProgress(0)
			}
		},
		[bodyFiles, designFiles, removeBodyFile, removeDesignFile]
	)

	const generatePreview = async () => {
		if (!bodyImageUrl || !designImageUrl) {
			toast.error(STUDIO_ERROR_MESSAGES.MISSING_IMAGES)
			return
		}

		setIsGenerating(true)
		setPreviewResult(null)
		setGenerationProgress(0)

		// Start progress animation
		const progressInterval = setInterval(() => {
			setGenerationProgress(prev => {
				if (prev >= 90) return 90
				return prev + 10
			})
		}, 3000)

		const generatingToast = toast.loading(
			<div className="flex flex-col gap-1">
				<span>{STUDIO_SUCCESS_MESSAGES.GENERATION_STARTED}</span>
				<span className="text-xs opacity-70">{STUDIO_INFO_MESSAGES.GENERATING}</span>
			</div>
		)

		try {
			const response = await fetch('/api/preview', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					bodyImageUrl,
					designImageUrl,
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
				clearInterval(progressInterval)
				toast.dismiss(generatingToast)
				
				if (response.status === 402) {
					if (data.error?.includes('Replicate')) {
						toast.error(data.error)
					} else {
						toast.error(
							<div className="flex flex-col gap-1">
								<span>{STUDIO_ERROR_MESSAGES.CREDITS_INSUFFICIENT}</span>
								<span className="text-xs">You have {data.credits} credits remaining</span>
							</div>
						)
					}
				} else if (response.status === 400 && data.error?.includes('localhost')) {
					toast.error(STUDIO_ERROR_MESSAGES.LOCALHOST_ERROR)
				} else {
					toast.error(data.error || STUDIO_ERROR_MESSAGES.GENERATION_FAILED)
				}
				setIsGenerating(false)
				setGenerationProgress(0)
				return
			}

			setJobId(data.jobId)
			setCredits(data.creditsRemaining)

			// Poll for results
			const pollInterval = setInterval(async () => {
				try {
					const statusResponse = await fetch(`/api/preview/${data.jobId}`)
					const statusData = await statusResponse.json()

					if (statusData.job.status === 'succeeded' && statusData.results.length > 0) {
						clearInterval(pollInterval)
						clearInterval(progressInterval)
						setGenerationProgress(100)
						setPreviewResult(statusData.results[0].imageUrl)
						
						// Add to recent previews
						setRecentPreviews(prev => [
							{ id: data.jobId, url: statusData.results[0].imageUrl, createdAt: new Date() },
							...prev.slice(0, 3)
						])
						
						toast.dismiss(generatingToast)
						toast.success(STUDIO_SUCCESS_MESSAGES.GENERATION_COMPLETE)
						setIsGenerating(false)
						setGenerationProgress(0)
					} else if (statusData.job.status === 'failed') {
						clearInterval(pollInterval)
						clearInterval(progressInterval)
						toast.dismiss(generatingToast)
						
						const errorMsg = statusData.job.error || STUDIO_ERROR_MESSAGES.GENERATION_FAILED
						toast.error(
							<div className="flex flex-col gap-1">
								<span>{STUDIO_ERROR_MESSAGES.REPLICATE_ERROR}</span>
								<span className="text-xs opacity-70">{errorMsg}</span>
							</div>
						)
						
						// Update credits if refunded
						if (statusData.creditsRefunded) {
							setCredits(prev => prev !== null ? prev + 1 : prev)
							toast.info(STUDIO_SUCCESS_MESSAGES.CREDIT_REFUNDED)
						}
						
						setIsGenerating(false)
						setGenerationProgress(0)
					}
				} catch (error) {
					console.error('Polling error:', error)
				}
			}, 2000)
			
			// Timeout after 2 minutes
			setTimeout(() => {
				if (isGenerating) {
					clearInterval(pollInterval)
					clearInterval(progressInterval)
					toast.dismiss(generatingToast)
					toast.error('Generation timed out. Please try again.')
					setIsGenerating(false)
					setGenerationProgress(0)
				}
			}, 120000)
		} catch (error) {
			clearInterval(progressInterval)
			toast.dismiss(generatingToast)
			console.error('Generation error:', error)
			toast.error(STUDIO_ERROR_MESSAGES.GENERATION_FAILED)
			setIsGenerating(false)
			setGenerationProgress(0)
		}
	}

	const handleDownload = async () => {
		if (!previewResult) return
		
		try {
			const filename = `tattoo-preview-${jobId || Date.now()}.jpg`
			await downloadImage(previewResult, filename)
			toast.success(STUDIO_SUCCESS_MESSAGES.IMAGE_DOWNLOADED)
		} catch (error) {
			toast.error('Failed to download image')
		}
	}

	const handleShare = async () => {
		if (!jobId) return
		
		const shareUrl = `${window.location.origin}/p/${jobId}`
		
		try {
			await copyToClipboard(shareUrl)
			toast.success(STUDIO_SUCCESS_MESSAGES.LINK_COPIED)
		} catch (error) {
			toast.error('Failed to copy link')
		}
	}

	const reusePreview = (preview: { id: number; url: string }) => {
		setPreviewResult(preview.url)
		setJobId(preview.id)
		toast.info('Preview restored')
	}

	const handleReset = () => {
		// Clear images
		setBodyImageUrl(null)
		setDesignImageUrl(null)
		if (bodyFiles.length > 0) {
			removeBodyFile(bodyFiles[0].id)
		}
		if (designFiles.length > 0) {
			removeDesignFile(designFiles[0].id)
		}
		
		// Reset settings to defaults
		setSelectedPart('arm')
		setSelectedVariant('black_gray')
		setScale(100)
		setRotation(0)
		setOpacity(100)
		setPromptRealism('realistic')
		setPromptBlending('natural')
		setPromptDetails('')
		setCustomPrompt('')
		setUseCustomPrompt(false)
		setShowGeneratedPrompt(false)
		
		// Clear preview result but keep history
		setPreviewResult(null)
		setJobId(null)
		
		toast.success('Studio reset - ready for new design!')
	}

	return (
		<div className='container mx-auto py-8 px-4 pb-24'>
			<Toaster position="top-center" richColors />
			
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
					{/* Upload Section with new component */}
					<Card className='p-6'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='text-xl font-semibold'>Upload Images</h2>
							{(bodyImageUrl || designImageUrl) && (
								<Button
									variant='outline'
									size='sm'
									onClick={handleReset}
									className='text-sm'
								>
									<RefreshCw className='w-4 h-4 mr-1' />
									Reset
								</Button>
							)}
						</div>
						
						<div className='space-y-4'>
							{/* Body Photo Upload */}
							<div>
								<Label>Body Photo</Label>
								<div className='mt-2'>
									<div
										onDragEnter={bodyDragEnter}
										onDragLeave={bodyDragLeave}
										onDragOver={bodyDragOver}
										onDrop={bodyDrop}
										data-dragging={bodyDragging || undefined}
										className='border-input data-[dragging=true]:bg-accent/50 relative flex min-h-32 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors justify-center'
									>
										<input
											{...getBodyInputProps()}
											className='sr-only'
											aria-label='Upload body photo'
										/>
										{bodyImageUrl ? (
											<img
												src={bodyImageUrl}
												alt='Body'
												className='h-28 object-contain'
											/>
										) : isUploading && uploadProgress < 50 ? (
											<div className='flex flex-col items-center gap-2'>
												<Loader2 className='h-8 w-8 animate-spin text-gray-400' />
												<span className='text-sm text-gray-500'>Compressing...</span>
												<Progress value={uploadProgress} className='w-32' />
											</div>
										) : (
											<div className='flex flex-col items-center'>
												<Button variant='outline' onClick={openBodyDialog} disabled={isUploading}>
													Upload body photo
												</Button>
												<span className='mt-2 text-xs text-gray-500'>
													or drag & drop
												</span>
											</div>
										)}
									</div>
									{bodyErrors.length > 0 && (
										<div className='text-destructive flex items-center gap-1 text-xs mt-2' role='alert'>
											<AlertCircle className='size-3 shrink-0' />
											<span>{bodyErrors[0]}</span>
										</div>
									)}
								</div>
							</div>

							{/* Design Upload */}
							<div>
								<Label>Tattoo Design</Label>
								<div className='mt-2'>
									<div
										onDragEnter={designDragEnter}
										onDragLeave={designDragLeave}
										onDragOver={designDragOver}
										onDrop={designDrop}
										data-dragging={designDragging || undefined}
										className='border-input data-[dragging=true]:bg-accent/50 relative flex min-h-32 flex-col items-center overflow-hidden rounded-xl border border-dashed p-4 transition-colors justify-center'
									>
										<input
											{...getDesignInputProps()}
											className='sr-only'
											aria-label='Upload tattoo design'
										/>
										{designImageUrl ? (
											<img
												src={designImageUrl}
												alt='Design'
												className='h-28 object-contain'
											/>
										) : isUploading && uploadProgress >= 50 ? (
											<div className='flex flex-col items-center gap-2'>
												<Loader2 className='h-8 w-8 animate-spin text-gray-400' />
												<span className='text-sm text-gray-500'>Uploading...</span>
												<Progress value={uploadProgress} className='w-32' />
											</div>
										) : (
											<div className='flex flex-col items-center'>
												<Button variant='outline' onClick={openDesignDialog} disabled={isUploading}>
													Upload tattoo design
												</Button>
												<span className='mt-2 text-xs text-gray-500'>
													or drag & drop
												</span>
											</div>
										)}
									</div>
									{designErrors.length > 0 && (
										<div className='text-destructive flex items-center gap-1 text-xs mt-2' role='alert'>
											<AlertCircle className='size-3 shrink-0' />
											<span>{designErrors[0]}</span>
										</div>
									)}
								</div>
							</div>
						</div>
					</Card>

					{/* Mobile-optimized controls */}
					<div className='lg:hidden'>
						<Accordion type="single" collapsible defaultValue="params">
							<AccordionItem value="params">
								<AccordionTrigger>Customize Your Tattoo</AccordionTrigger>
								<AccordionContent className='space-y-4'>
									{/* Body Part Selection */}
									<div>
										<Label className='mb-3 block'>Body Part</Label>
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
									</div>

									{/* Style Selection */}
									<div>
										<Label className='mb-3 block'>Tattoo Style</Label>
										<RadioGroup value={selectedVariant} onValueChange={(v) => setSelectedVariant(v as TattooVariant)}>
											{variants.map((variant) => (
												<div key={variant.value} className='flex items-center space-x-2'>
													<RadioGroupItem value={variant.value} id={variant.value} />
													<Label htmlFor={variant.value}>{variant.label}</Label>
												</div>
											))}
										</RadioGroup>
									</div>

									{/* Adjustments */}
									<div className='space-y-4'>
										<div>
											<Label>Scale: {scale}%</Label>
											<Slider
												value={[scale]}
												onValueChange={([v]) => setScale(v)}
												min={50}
												max={150}
												step={5}
												className='mt-2'
											/>
										</div>
										<div>
											<Label>Rotation: {rotation}°</Label>
											<Slider
												value={[rotation]}
												onValueChange={([v]) => setRotation(v)}
												min={-180}
												max={180}
												step={5}
												className='mt-2'
											/>
										</div>
										<div>
											<Label>Opacity: {opacity}%</Label>
											<Slider
												value={[opacity]}
												onValueChange={([v]) => setOpacity(v)}
												min={50}
												max={100}
												step={5}
												className='mt-2'
											/>
										</div>
									</div>
								</AccordionContent>
							</AccordionItem>
						</Accordion>
					</div>

					{/* Desktop controls */}
					<div className='hidden lg:block space-y-6'>
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
									<Slider
										value={[scale]}
										onValueChange={([v]) => setScale(v)}
										min={50}
										max={150}
										step={5}
										className='mt-2'
									/>
								</div>
								<div>
									<Label>Rotation: {rotation}°</Label>
									<Slider
										value={[rotation]}
										onValueChange={([v]) => setRotation(v)}
										min={-180}
										max={180}
										step={5}
										className='mt-2'
									/>
								</div>
								<div>
									<Label>Opacity: {opacity}%</Label>
									<Slider
										value={[opacity]}
										onValueChange={([v]) => setOpacity(v)}
										min={50}
										max={100}
										step={5}
										className='mt-2'
									/>
								</div>
							</div>
						</Card>
					</div>

					{/* Enhanced Prompt Builder */}
					<Card className='p-6'>
						<h2 className='text-xl font-semibold mb-4'>Fine-tune Output</h2>
						<div className='space-y-4'>
							<div className='flex items-center justify-between mb-2'>
								<Label className='text-sm font-medium'>Prompt Mode</Label>
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
									<Label htmlFor='use-custom-prompt' className='text-sm'>Advanced</Label>
								</div>
							</div>
							
							{useCustomPrompt ? (
								<div className='space-y-2'>
									<Label className='text-xs text-gray-500'>Full Control Mode</Label>
									<textarea
										placeholder='Enter your custom prompt (e.g., "Apply the tattoo design from the second image onto the arm in the first image. Make it look realistic and natural.")'
										value={customPrompt}
										onChange={(e) => setCustomPrompt(e.target.value)}
										className='w-full p-3 border rounded-lg min-h-[120px] resize-y text-sm'
									/>
								</div>
							) : (
								<div className='space-y-4'>
									{/* Realism Level */}
									<div>
										<Label className='text-sm mb-2 block'>Realism</Label>
										<div className='grid grid-cols-3 gap-2'>
											<Button
												variant={promptRealism === 'realistic' ? 'default' : 'outline'}
												size='sm'
												onClick={() => setPromptRealism('realistic')}
											>
												Realistic
											</Button>
											<Button
												variant={promptRealism === 'photorealistic' ? 'default' : 'outline'}
												size='sm'
												onClick={() => setPromptRealism('photorealistic')}
											>
												Photo-Real
											</Button>
											<Button
												variant={promptRealism === 'artistic' ? 'default' : 'outline'}
												size='sm'
												onClick={() => setPromptRealism('artistic')}
											>
												Artistic
											</Button>
										</div>
									</div>
									
									{/* Blending Style */}
									<div>
										<Label className='text-sm mb-2 block'>Skin Blending</Label>
										<div className='grid grid-cols-3 gap-2'>
											<Button
												variant={promptBlending === 'natural' ? 'default' : 'outline'}
												size='sm'
												onClick={() => setPromptBlending('natural')}
											>
												Natural
											</Button>
											<Button
												variant={promptBlending === 'seamless' ? 'default' : 'outline'}
												size='sm'
												onClick={() => setPromptBlending('seamless')}
											>
												Seamless
											</Button>
											<Button
												variant={promptBlending === 'bold' ? 'default' : 'outline'}
												size='sm'
												onClick={() => setPromptBlending('bold')}
											>
												Bold
											</Button>
										</div>
									</div>
									
									{/* Additional Details */}
									<div>
										<Label className='text-sm mb-2 block'>Additional Details (Optional)</Label>
										<input
											type='text'
											placeholder='e.g., "fresh ink look, vibrant colors, aged appearance"'
											value={promptDetails}
											onChange={(e) => setPromptDetails(e.target.value)}
											className='w-full p-2 border rounded-lg text-sm'
										/>
									</div>
									
									{/* Show Generated Prompt */}
									<div>
										<Button
											variant='ghost'
											size='sm'
											onClick={() => setShowGeneratedPrompt(!showGeneratedPrompt)}
											className='text-xs'
										>
											<Eye className='w-3 h-3 mr-1' />
											{showGeneratedPrompt ? 'Hide' : 'View'} Final Prompt
										</Button>
										{showGeneratedPrompt && (
											<div className='mt-2 p-2 bg-gray-50 border rounded text-xs font-mono'>
												{generatedPrompt}
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					</Card>

				</div>

				{/* Preview Panel */}
				<div className='space-y-6'>
					<Card className='p-6 min-h-[600px] flex items-center justify-center'>
						{isGenerating && !previewResult ? (
							<div className='w-full space-y-4'>
								<Skeleton className='w-full h-96' />
								<div className='text-center'>
									<Loader2 className='w-8 h-8 mx-auto mb-2 animate-spin text-gray-400' />
									<p className='text-gray-600'>Generating your tattoo preview...</p>
									<p className='text-sm text-gray-500 mt-1'>This usually takes 30-60 seconds</p>
								</div>
							</div>
						) : previewResult ? (
							<div className='w-full'>
								<ImageZoom>
									<img
										src={previewResult}
										alt='Tattoo Preview'
										className='w-full h-auto rounded-lg cursor-zoom-in'
									/>
								</ImageZoom>
								<div className='flex gap-2 mt-4'>
									<Button variant='outline' size='sm' className='flex-1' onClick={handleDownload}>
										<Download className='mr-2 h-4 w-4' />
										Download
									</Button>
									<Button variant='outline' size='sm' className='flex-1' onClick={handleShare}>
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

					{jobId && previewResult && (
						<Card className='p-4'>
							<p className='text-sm text-gray-600'>
								Share this preview:{' '}
								<button
									onClick={handleShare}
									className='text-blue-600 hover:underline'
								>
									{`${window.location.origin}/p/${jobId}`}
								</button>
							</p>
						</Card>
					)}

					{/* Recent Previews */}
					{recentPreviews.length > 0 && (
						<Card className='p-6'>
							<h3 className='text-lg font-semibold mb-4'>Recent Previews</h3>
							<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
								{recentPreviews.map((preview) => (
									<button
										key={preview.id}
										onClick={() => reusePreview(preview)}
										className='group relative aspect-square rounded-lg overflow-hidden border hover:ring-2 hover:ring-primary transition-all'
									>
										<img
											src={preview.url}
											alt='Recent preview'
											className='w-full h-full object-cover'
										/>
										<div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
											<Eye className='text-white' />
										</div>
									</button>
								))}
							</div>
						</Card>
					)}
				</div>
			</div>

			{/* Floating Action Bar */}
			<div className='fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50'>
				<div className='container mx-auto px-4 py-3'>
					<div className='flex items-center justify-between gap-4'>
						{/* Status indicators */}
						<div className='flex items-center gap-4 text-sm'>
							{bodyImageUrl && designImageUrl ? (
								<div className='flex items-center gap-2'>
									<div className='w-2 h-2 bg-green-500 rounded-full'></div>
									<span className='text-gray-600'>Ready to generate</span>
								</div>
							) : (
								<div className='flex items-center gap-2'>
									<div className='w-2 h-2 bg-yellow-500 rounded-full animate-pulse'></div>
									<span className='text-gray-600'>
										{!bodyImageUrl && !designImageUrl ? 'Upload both images' : 
										 !bodyImageUrl ? 'Upload body photo' : 'Upload design'}
									</span>
								</div>
							)}
							{credits !== null && credits !== 999999 && (
								<div className='hidden sm:flex items-center gap-1'>
									<span className='text-gray-500'>Credits:</span>
									<span className='font-medium'>{credits}</span>
								</div>
							)}
						</div>

						{/* Generate Button */}
						<div className='flex items-center gap-2'>
							{(bodyImageUrl || designImageUrl) && !isGenerating && (
								<Button
									variant='ghost'
									size='lg'
									onClick={handleReset}
									className='px-3'
									title='Start over with new images'
								>
									<RefreshCw className='h-4 w-4' />
								</Button>
							)}
							{isGenerating && (
								<div className='hidden sm:block w-32'>
									<Progress value={generationProgress} className='h-2' />
								</div>
							)}
							<Button
								onClick={generatePreview}
								disabled={isGenerating || !bodyImageUrl || !designImageUrl || isUploading}
								size='lg'
								className='min-w-[180px]'
							>
								{isGenerating ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										{generationProgress > 0 ? `${generationProgress}%` : 'Generating...'}
									</>
								) : (
									<>
										<ZoomIn className='mr-2 h-4 w-4' />
										Generate Preview
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}