'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, Download, Share2, RotateCw, ZoomIn, Eye, AlertCircle, RefreshCw } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { track } from '@vercel/analytics'
import type { BodyPart, TattooVariant } from '@/types/core'
import { PlacementEditor } from '@/components/placement-editor'
import { renderComposite, DEFAULT_TRANSFORM, type PlacementTransform } from '@/lib/composite'
import { useFileUpload } from '@/hooks/use-file-upload'
import { compressImage, validateImageFile, downloadImage, copyToClipboard } from '@/lib/image-utils'
import { STUDIO_ERROR_MESSAGES, STUDIO_SUCCESS_MESSAGES, STUDIO_INFO_MESSAGES } from '@/lib/studio-errors'
import { ImageZoom } from '@/components/ui/kibo-ui/image-zoom'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { PurchaseCreditsDialog } from '@/components/purchase-credits-dialog'
import { PurchaseSuccessPoller } from '@/components/purchase-success-poller'
import { RegenerateConfirmDialog } from '@/components/regenerate-confirm-dialog'
import { usePreviewJob, type PreviewJobStatus } from '@/hooks/use-preview-job'

// Honest, human-readable label for each real prediction state. No percentage —
// the lifecycle has no meaningful progress fraction to report.
const GENERATION_STATUS_LABEL: Record<PreviewJobStatus, string> = {
  idle: '',
  queued: 'Queued — waiting to start…',
  running: 'Generating your preview…',
  succeeded: 'Preview ready',
  failed: 'Generation failed',
  still_running: 'Still generating — this is taking longer than usual',
}

const GENERATION_TOAST_ID = 'generation-status'

const bodyParts: Array<{ value: BodyPart; label: string }> = [
	{ value: 'upper_arm', label: 'Upper Arm' },
	{ value: 'forearm', label: 'Forearm' },
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
	const [selectedPart, setSelectedPart] = useState<BodyPart>('forearm')
	const [selectedVariant, setSelectedVariant] = useState<TattooVariant>('black_gray')
	// Visual placement: position/scale/rotation/opacity of the design over the
	// body photo. Survives a generation round-trip so the user can nudge and
	// regenerate without re-placing.
	const [transform, setTransform] = useState<PlacementTransform>(DEFAULT_TRANSFORM)
	const [customPrompt, setCustomPrompt] = useState('')
	const [useCustomPrompt, setUseCustomPrompt] = useState(false)
	// True while we render the composite and upload it, before the job is created.
	const [isComposing, setIsComposing] = useState(false)
	const [isUploadingBody, setIsUploadingBody] = useState(false)
	const [isUploadingDesign, setIsUploadingDesign] = useState(false)
	const [bodyUploadProgress, setBodyUploadProgress] = useState(0)
	const [designUploadProgress, setDesignUploadProgress] = useState(0)
	const [previewResult, setPreviewResult] = useState<string | null>(null)
	const [jobId, setJobId] = useState<number | null>(null)
	const [credits, setCredits] = useState<number | null>(null)
	const [userId, setUserId] = useState<number | null>(null)
	const [recentPreviews, setRecentPreviews] = useState<Array<{ id: number; url: string; createdAt: Date }>>([])
	const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
	const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)

	// In-flight job id is persisted per-user so it survives reload / navigation.
	const storageKey = userId !== null ? `taatoo:active-preview-job:${userId}` : null

	const previewJob = usePreviewJob({
		storageKey,
		onSucceeded: ({ jobId: id, imageUrl }) => {
			setPreviewResult(imageUrl)
			setJobId(id)
			setRecentPreviews(prev => {
				if (prev.some(p => p.id === id)) return prev
				return [{ id, url: imageUrl, createdAt: new Date() }, ...prev.slice(0, 3)]
			})
			toast.success(STUDIO_SUCCESS_MESSAGES.GENERATION_COMPLETE, { id: GENERATION_TOAST_ID })
		},
		onFailed: ({ creditRefunded }) => {
			toast.error(STUDIO_ERROR_MESSAGES.REPLICATE_ERROR, { id: GENERATION_TOAST_ID })
			// The server guarantees an exactly-once refund on failure; reflect it
			// so the user sees their credit is back.
			if (creditRefunded) {
				setCredits(prev => (prev !== null && prev !== 999999 ? prev + 1 : prev))
				toast.info(STUDIO_SUCCESS_MESSAGES.CREDIT_REFUNDED)
			}
		},
		onStillRunning: () => {
			toast.info(
				'Still generating — this is taking longer than usual. You can leave; find it in My Previews when it finishes.',
				{ id: GENERATION_TOAST_ID, duration: 8000 }
			)
		},
	})

	const isGenerating = previewJob.isActive

	// Load the signed-in user's id (to scope the in-flight job) and current
	// credit balance once on mount.
	useEffect(() => {
		let cancelled = false
		fetch('/api/user/dashboard', { cache: 'no-store' })
			.then(res => (res.ok ? res.json() : null))
			.then(data => {
				if (cancelled || !data) return
				if (typeof data.user?.id === 'number') setUserId(data.user.id)
				if (typeof data.credits === 'number') setCredits(data.credits)
			})
			.catch(() => {})
		return () => {
			cancelled = true
		}
	}, [])

	// Drive the persistent loading toast from the real status while a job is in
	// flight — covers both a fresh Generate and a job reconnected on return.
	useEffect(() => {
		if (previewJob.status === 'queued' || previewJob.status === 'running') {
			toast.loading(GENERATION_STATUS_LABEL[previewJob.status], { id: GENERATION_TOAST_ID })
		}
	}, [previewJob.status])

	// The Stripe purchase flow leaves and re-enters /studio as a full
	// navigation, which would otherwise discard the user's uploads and
	// placement right after they paid. Persist the working session (the
	// uploaded Blob URLs survive navigation) and restore it on mount.
	const SESSION_KEY = 'taatoo:studio-session'
	const [sessionRestored, setSessionRestored] = useState(false)

	useEffect(() => {
		try {
			const raw = sessionStorage.getItem(SESSION_KEY)
			if (raw) {
				const saved = JSON.parse(raw)
				if (typeof saved.bodyImageUrl === 'string') setBodyImageUrl(saved.bodyImageUrl)
				if (typeof saved.designImageUrl === 'string') setDesignImageUrl(saved.designImageUrl)
				if (typeof saved.selectedPart === 'string') setSelectedPart(saved.selectedPart)
				if (typeof saved.selectedVariant === 'string') setSelectedVariant(saved.selectedVariant)
				if (saved.transform && typeof saved.transform === 'object') setTransform(saved.transform)
			}
		} catch {}
		setSessionRestored(true)
	}, [])

	useEffect(() => {
		if (!sessionRestored) return
		try {
			if (!bodyImageUrl && !designImageUrl) {
				sessionStorage.removeItem(SESSION_KEY)
				return
			}
			sessionStorage.setItem(
				SESSION_KEY,
				JSON.stringify({ bodyImageUrl, designImageUrl, selectedPart, selectedVariant, transform })
			)
		} catch {}
	}, [sessionRestored, bodyImageUrl, designImageUrl, selectedPart, selectedVariant, transform])

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

			// Set appropriate uploading state
			if (type === 'body') {
				setIsUploadingBody(true)
				setBodyUploadProgress(0)
			} else {
				setIsUploadingDesign(true)
				setDesignUploadProgress(0)
			}

			try {
				// Show compression toast
				const compressionToast = toast.loading(STUDIO_INFO_MESSAGES.COMPRESSING)

				// Compress image
				const compressedFile = await compressImage(file, {
					maxSizeMB: 2,
					maxWidthOrHeight: 2048,
					onProgress: (progress) => {
						if (type === 'body') {
							setBodyUploadProgress(progress * 50) // First 50% for compression
						} else {
							setDesignUploadProgress(progress * 50)
						}
					},
				})

				toast.dismiss(compressionToast)

				// Upload compressed file
				const uploadToast = toast.loading(STUDIO_INFO_MESSAGES.UPLOADING)
				if (type === 'body') {
					setBodyUploadProgress(50)
				} else {
					setDesignUploadProgress(50)
				}

				const formData = new FormData()
				formData.append('file', compressedFile)

				const response = await fetch('/api/upload', {
					method: 'POST',
					body: formData,
				})

				if (type === 'body') {
					setBodyUploadProgress(100)
				} else {
					setDesignUploadProgress(100)
				}
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
				if (type === 'body') {
					setIsUploadingBody(false)
					setBodyUploadProgress(0)
				} else {
					setIsUploadingDesign(false)
					setDesignUploadProgress(0)
				}
			}
		},
		[bodyFiles, designFiles, removeBodyFile, removeDesignFile]
	)

	const generatePreview = async () => {
		if (!bodyImageUrl || !designImageUrl) {
			toast.error(STUDIO_ERROR_MESSAGES.MISSING_IMAGES)
			return
		}
		track('generate_clicked')

		// Render the placement client-side and upload it. The composite (body photo
		// with the design overlaid at the chosen transform) is what the model works
		// from, so placement is carried by pixels, not prose.
		let compositeImageUrl: string
		setIsComposing(true)
		const composeToast = toast.loading('Preparing your placement…')
		try {
			const blob = await renderComposite(bodyImageUrl, designImageUrl, transform)
			const file = new File([blob], 'composite.jpg', { type: 'image/jpeg' })
			const formData = new FormData()
			formData.append('file', file)
			const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
			if (!uploadRes.ok) throw new Error('composite upload failed')
			compositeImageUrl = (await uploadRes.json()).url
		} catch (error) {
			console.error('Composite error:', error)
			toast.dismiss(composeToast)
			toast.error('Could not prepare the placement. Please try again.')
			return
		} finally {
			setIsComposing(false)
		}
		toast.dismiss(composeToast)

		toast.loading(GENERATION_STATUS_LABEL.queued, { id: GENERATION_TOAST_ID })

		try {
			const response = await fetch('/api/preview', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					bodyImageUrl,
					designImageUrl,
					compositeImageUrl,
					part: selectedPart,
					variant: selectedVariant,
					// Recorded for metadata / the share page; no longer drives the prompt.
					scale: transform.scale,
					rotationDeg: transform.rotationDeg,
					opacity: transform.opacity,
					customPrompt: useCustomPrompt ? customPrompt : null,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				toast.dismiss(GENERATION_TOAST_ID)

				if (response.status === 402) {
					if (data.error?.includes('Replicate')) {
						// Replicate-side billing failure, not the user's credit balance.
						toast.error(data.error)
					} else {
						// The paywall: open the purchase flow at the moment of intent.
						track('paywall_shown')
						setShowPurchaseDialog(true)
					}
				} else if (response.status === 400 && data.error?.includes('localhost')) {
					toast.error(STUDIO_ERROR_MESSAGES.LOCALHOST_ERROR)
				} else {
					toast.error(data.error || STUDIO_ERROR_MESSAGES.GENERATION_FAILED)
				}
				return
			}

			setCredits(data.creditsRemaining)
			// Hand the job to the polling hook, which derives status from the real
			// prediction lifecycle and reconnects if the user leaves and returns.
			previewJob.track(data.jobId)
		} catch (error) {
			toast.dismiss(GENERATION_TOAST_ID)
			console.error('Generation error:', error)
			toast.error(STUDIO_ERROR_MESSAGES.GENERATION_FAILED)
		}
	}

	const handleRegenerate = () => setShowRegenerateDialog(true)

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
		setSelectedPart('forearm')
		setSelectedVariant('black_gray')
		setTransform(DEFAULT_TRANSFORM)
		setCustomPrompt('')
		setUseCustomPrompt(false)
		
		// Clear preview result and stop tracking any in-flight job, but keep history
		setPreviewResult(null)
		setJobId(null)
		previewJob.reset()

		toast.success('Studio reset - ready for new design!')
	}

	return (
		<div className='container mx-auto py-8 px-4 pb-24'>
			<Toaster position="top-center" richColors />
			<PurchaseSuccessPoller onConfirmed={setCredits} />
			<PurchaseCreditsDialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog} />
			<RegenerateConfirmDialog
				open={showRegenerateDialog}
				onOpenChange={setShowRegenerateDialog}
				onConfirm={generatePreview}
			/>

			<div className='mb-8'>
				<h1 className='text-3xl font-bold'>Tattoo Preview Studio</h1>
				<p className='text-gray-600 mt-2'>
					Upload a body photo and design to see how your tattoo will look
				</p>
				<a href='/previews' className='text-sm text-blue-600 hover:underline mt-1 inline-block'>My Previews →</a>
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
										) : isUploadingBody ? (
											<div className='flex flex-col items-center gap-2'>
												<Loader2 className='h-8 w-8 animate-spin text-gray-400' />
												<span className='text-sm text-gray-500'>
													{bodyUploadProgress < 50 ? 'Compressing...' : 'Uploading...'}
												</span>
												<Progress value={bodyUploadProgress} className='w-32' />
											</div>
										) : (
											<div className='flex flex-col items-center'>
												<Button variant='outline' onClick={openBodyDialog} disabled={isUploadingBody || isUploadingDesign}>
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
										) : isUploadingDesign ? (
											<div className='flex flex-col items-center gap-2'>
												<Loader2 className='h-8 w-8 animate-spin text-gray-400' />
												<span className='text-sm text-gray-500'>
													{designUploadProgress < 50 ? 'Compressing...' : 'Uploading...'}
												</span>
												<Progress value={designUploadProgress} className='w-32' />
											</div>
										) : (
											<div className='flex flex-col items-center'>
												<Button variant='outline' onClick={openDesignDialog} disabled={isUploadingBody || isUploadingDesign}>
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
					</div>

					{/* Advanced: optional free-text style direction. Placement is handled
					    visually now, so this only nudges the look — capped server-side. */}
					<Card className='p-6'>
						<div className='flex items-center justify-between mb-2'>
							<Label className='text-sm font-medium'>Advanced prompt</Label>
							<div className='flex items-center space-x-2'>
								<input
									type='checkbox'
									id='use-custom-prompt'
									checked={useCustomPrompt}
									onChange={(e) => setUseCustomPrompt(e.target.checked)}
									className='rounded border-gray-300'
								/>
								<Label htmlFor='use-custom-prompt' className='text-sm'>Enable</Label>
							</div>
						</div>

						{useCustomPrompt ? (
							<div className='space-y-2'>
								<Label className='text-xs text-gray-500'>
									Full control — describe exactly how the tattoo should be rendered.
								</Label>
								<textarea
									placeholder='e.g., "Render the design as a realistic black and grey tattoo, following the arm&apos;s contours with natural skin shading."'
									value={customPrompt}
									maxLength={2000}
									onChange={(e) => setCustomPrompt(e.target.value)}
									className='w-full p-3 border rounded-lg min-h-[120px] resize-y text-sm'
								/>
								<p className='text-xs text-gray-400 text-right'>{customPrompt.length}/2000</p>
							</div>
						) : (
							<p className='text-sm text-gray-500'>
								Leave off to let the studio write the prompt from your style and placement.
							</p>
						)}
					</Card>

				</div>

				{/* Preview Panel */}
				<div className='space-y-6'>
					{/* Visual placement editor — the design is positioned live on the
					    body photo; the rendered composite is what the model receives.
					    The transform persists across generations so the user can nudge
					    and regenerate without re-placing. */}
					{bodyImageUrl && designImageUrl && (
						<Card className='p-6'>
							<h2 className='text-xl font-semibold mb-4'>Position Your Design</h2>
							<PlacementEditor
								bodyImageUrl={bodyImageUrl}
								designImageUrl={designImageUrl}
								transform={transform}
								onTransformChange={setTransform}
								disabled={isGenerating || isComposing}
							/>
						</Card>
					)}

					<Card className='p-6 min-h-[600px] flex items-center justify-center'>
						{isGenerating && !previewResult ? (
							<div className='w-full space-y-4'>
								<Skeleton className='w-full h-96' />
								{/* Indeterminate animation + honest status label derived from
								    the real prediction lifecycle — never a fake percentage. */}
								<div className='text-center'>
									<Loader2 className='w-8 h-8 mx-auto mb-2 animate-spin text-gray-400' />
									<p className='text-gray-600'>{GENERATION_STATUS_LABEL[previewJob.status] || GENERATION_STATUS_LABEL.running}</p>
									<p className='text-sm text-gray-500 mt-1'>You can leave this page — your preview keeps generating and appears in My Previews.</p>
								</div>
							</div>
						) : previewJob.status === 'still_running' && !previewResult ? (
							<div className='text-center text-gray-600'>
								<Loader2 className='w-8 h-8 mx-auto mb-3 animate-spin text-gray-400' />
								<p className='font-medium'>Still generating</p>
								<p className='text-sm text-gray-500 mt-2 max-w-xs mx-auto'>
									This is taking longer than usual. It will keep running — check My Previews in a bit to see the result.
								</p>
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
										onClick={handleRegenerate}
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
								<span className='hidden sm:block text-sm text-gray-600 max-w-[220px] truncate'>
									{GENERATION_STATUS_LABEL[previewJob.status]}
								</span>
							)}
							<Button
								onClick={generatePreview}
								disabled={isGenerating || isComposing || !bodyImageUrl || !designImageUrl || isUploadingBody || isUploadingDesign}
								size='lg'
								className='min-w-[180px]'
							>
								{isComposing ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Preparing…
									</>
								) : isGenerating ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										{previewJob.status === 'queued' ? 'Queued…' : 'Generating…'}
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