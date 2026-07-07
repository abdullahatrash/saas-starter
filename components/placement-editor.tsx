'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { RotateCw, Move, Maximize2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { loadImage, type PlacementTransform } from '@/lib/composite'

interface PlacementEditorProps {
	bodyImageUrl: string
	designImageUrl: string
	transform: PlacementTransform
	onTransformChange: (t: PlacementTransform) => void
	// Disabled while a generation is in flight so the placement can't shift under
	// a running job.
	disabled?: boolean
}

interface Point {
	x: number
	y: number
}

// Snapshot captured at the start of a gesture so each move is computed relative
// to a stable origin rather than accumulating floating-point drift.
interface GestureStart {
	mode: 'move' | 'resize' | 'rotate' | 'pinch'
	transform: PlacementTransform
	pointer: Point
	center: Point
	// pinch only
	secondPointer?: Point
	startDist?: number
	startAngle?: number
}

const MIN_SCALE = 0.05
const MAX_SCALE = 1.5

function clamp(v: number, lo: number, hi: number): number {
	return Math.max(lo, Math.min(hi, v))
}

export function PlacementEditor({
	bodyImageUrl,
	designImageUrl,
	transform,
	onTransformChange,
	disabled = false,
}: PlacementEditorProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const [designAspect, setDesignAspect] = useState(1)

	// Mirror the controlled transform so gesture handlers read the latest value
	// without being re-created on every change.
	const transformRef = useRef(transform)
	transformRef.current = transform

	const gestureRef = useRef<GestureStart | null>(null)
	// Active pointers currently on the overlay, for pinch detection.
	const pointersRef = useRef<Map<number, Point>>(new Map())

	useEffect(() => {
		let cancelled = false
		loadImage(designImageUrl)
			.then((img) => {
				if (cancelled) return
				const w = img.naturalWidth || img.width
				const h = img.naturalHeight || img.height
				if (w && h) setDesignAspect(w / h)
			})
			.catch(() => {})
		return () => {
			cancelled = true
		}
	}, [designImageUrl])

	const rect = () => containerRef.current?.getBoundingClientRect() ?? null

	const centerPx = useCallback((t: PlacementTransform, r: DOMRect): Point => {
		return { x: t.cx * r.width, y: t.cy * r.height }
	}, [])

	const relativePoint = (e: { clientX: number; clientY: number }, r: DOMRect): Point => ({
		x: e.clientX - r.left,
		y: e.clientY - r.top,
	})

	const beginGesture = (
		mode: GestureStart['mode'],
		e: React.PointerEvent
	) => {
		if (disabled) return
		const r = rect()
		if (!r) return
		e.preventDefault()
		e.stopPropagation()
		;(e.target as Element).setPointerCapture?.(e.pointerId)

		const pointer = relativePoint(e, r)
		pointersRef.current.set(e.pointerId, pointer)

		// A second finger on the overlay upgrades a move into a pinch (scale +
		// rotate together), the natural mobile gesture.
		if (mode === 'move' && pointersRef.current.size === 2) {
			const [a, b] = [...pointersRef.current.values()]
			gestureRef.current = {
				mode: 'pinch',
				transform: transformRef.current,
				pointer: a,
				secondPointer: b,
				center: centerPx(transformRef.current, r),
				startDist: Math.hypot(b.x - a.x, b.y - a.y),
				startAngle: Math.atan2(b.y - a.y, b.x - a.x),
			}
			return
		}

		gestureRef.current = {
			mode,
			transform: transformRef.current,
			pointer,
			center: centerPx(transformRef.current, r),
		}
	}

	const onPointerMove = (e: React.PointerEvent) => {
		const g = gestureRef.current
		const r = rect()
		if (!g || !r) return
		e.preventDefault()

		const p = relativePoint(e, r)
		if (pointersRef.current.has(e.pointerId)) {
			pointersRef.current.set(e.pointerId, p)
		}

		if (g.mode === 'move') {
			const dx = (p.x - g.pointer.x) / r.width
			const dy = (p.y - g.pointer.y) / r.height
			onTransformChange({
				...g.transform,
				cx: clamp(g.transform.cx + dx, 0, 1),
				cy: clamp(g.transform.cy + dy, 0, 1),
			})
			return
		}

		if (g.mode === 'resize') {
			const startDist = Math.hypot(g.pointer.x - g.center.x, g.pointer.y - g.center.y)
			const curDist = Math.hypot(p.x - g.center.x, p.y - g.center.y)
			if (startDist > 0) {
				onTransformChange({
					...g.transform,
					scale: clamp((g.transform.scale * curDist) / startDist, MIN_SCALE, MAX_SCALE),
				})
			}
			return
		}

		if (g.mode === 'rotate') {
			const startAngle = Math.atan2(g.pointer.y - g.center.y, g.pointer.x - g.center.x)
			const curAngle = Math.atan2(p.y - g.center.y, p.x - g.center.x)
			const deltaDeg = ((curAngle - startAngle) * 180) / Math.PI
			onTransformChange({
				...g.transform,
				rotationDeg: Math.round(g.transform.rotationDeg + deltaDeg),
			})
			return
		}

		if (g.mode === 'pinch' && pointersRef.current.size >= 2) {
			const [a, b] = [...pointersRef.current.values()]
			const curDist = Math.hypot(b.x - a.x, b.y - a.y)
			const curAngle = Math.atan2(b.y - a.y, b.x - a.x)
			const scale =
				g.startDist && g.startDist > 0
					? clamp((g.transform.scale * curDist) / g.startDist, MIN_SCALE, MAX_SCALE)
					: g.transform.scale
			const deltaDeg =
				g.startAngle !== undefined ? ((curAngle - g.startAngle) * 180) / Math.PI : 0
			onTransformChange({
				...g.transform,
				scale,
				rotationDeg: Math.round(g.transform.rotationDeg + deltaDeg),
			})
		}
	}

	const endPointer = (e: React.PointerEvent) => {
		pointersRef.current.delete(e.pointerId)
		;(e.target as Element).releasePointerCapture?.(e.pointerId)
		if (pointersRef.current.size === 0) {
			gestureRef.current = null
		}
	}

	// Overlay width as a percentage of the body image; height follows from the
	// design aspect ratio via CSS aspect-ratio so it never distorts.
	const overlayWidthPct = transform.scale * 100

	return (
		<div className="space-y-3">
			<div
				ref={containerRef}
				className="relative w-full overflow-hidden rounded-lg border bg-gray-100 touch-none select-none"
				onPointerMove={onPointerMove}
				onPointerUp={endPointer}
				onPointerCancel={endPointer}
			>
				{/* Body photo defines the reference box. */}
				<img
					src={bodyImageUrl}
					alt="Body"
					draggable={false}
					className="block w-full h-auto pointer-events-none select-none"
				/>

				{/* Design overlay */}
				<div
					className="absolute"
					style={{
						left: `${transform.cx * 100}%`,
						top: `${transform.cy * 100}%`,
						width: `${overlayWidthPct}%`,
						// height derived from the body-width fraction and the design aspect,
						// expressed relative to width via aspect-ratio to stay distortion-free.
						aspectRatio: `${designAspect}`,
						transform: `translate(-50%, -50%) rotate(${transform.rotationDeg}deg)`,
						opacity: transform.opacity,
						touchAction: 'none',
						cursor: disabled ? 'default' : 'move',
					}}
					onPointerDown={(e) => beginGesture('move', e)}
				>
					<img
						src={designImageUrl}
						alt="Design"
						draggable={false}
						className="w-full h-full object-contain pointer-events-none select-none"
					/>

					{!disabled && (
						<>
							{/* Selection outline */}
							<div className="absolute inset-0 border-2 border-primary/70 rounded-sm pointer-events-none" />

							{/* Move affordance (center) */}
							<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary/80 text-white rounded-full p-1 pointer-events-none">
								<Move className="w-3 h-3" />
							</div>

							{/* Resize handle (bottom-right) */}
							<button
								type="button"
								aria-label="Resize design"
								className="absolute -bottom-3 -right-3 bg-primary text-white rounded-full p-1.5 shadow cursor-nwse-resize touch-none"
								style={{ touchAction: 'none' }}
								onPointerDown={(e) => beginGesture('resize', e)}
							>
								<Maximize2 className="w-3.5 h-3.5" />
							</button>

							{/* Rotate handle (top-center) */}
							<button
								type="button"
								aria-label="Rotate design"
								className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white rounded-full p-1.5 shadow cursor-grab touch-none"
								style={{ touchAction: 'none' }}
								onPointerDown={(e) => beginGesture('rotate', e)}
							>
								<RotateCw className="w-3.5 h-3.5" />
							</button>
						</>
					)}
				</div>
			</div>

			{/* Opacity lives with the editor now, not as a blind slider. */}
			<div>
				<Label className="text-sm">Opacity: {Math.round(transform.opacity * 100)}%</Label>
				<Slider
					value={[Math.round(transform.opacity * 100)]}
					onValueChange={([v]) => onTransformChange({ ...transform, opacity: v / 100 })}
					min={20}
					max={100}
					step={5}
					className="mt-2"
					disabled={disabled}
				/>
			</div>

			<p className="text-xs text-gray-500">
				Drag to move · corner handle to resize · top handle to rotate · pinch on touch. This
				placement is sent to the AI — no guessing.
			</p>
		</div>
	)
}
