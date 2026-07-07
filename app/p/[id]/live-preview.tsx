'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const POLL_INTERVAL_MS = 3000

// Renders the share page's preview area and keeps it live: while the job is
// still in flight it polls the public status endpoint and swaps in the result
// on completion — no manual refresh needed.
export function LivePreview({
  jobId,
  initialStatus,
  initialImageUrl,
}: {
  jobId: number
  initialStatus: string
  initialImageUrl: string | null
}) {
  const [status, setStatus] = useState(initialStatus)
  const [imageUrl, setImageUrl] = useState(initialImageUrl)

  const inFlight =
    !imageUrl && (status === 'queued' || status === 'running')

  useEffect(() => {
    if (!inFlight) return

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/p/${jobId}/status`)
        if (!res.ok) return
        const data: { status: string; imageUrl: string | null } =
          await res.json()
        setStatus(data.status)
        if (data.imageUrl) setImageUrl(data.imageUrl)
      } catch {
        // Network hiccup — keep polling.
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [jobId, inFlight])

  if (imageUrl) {
    return (
      <Card className='p-8 mb-8'>
        <img
          src={imageUrl}
          alt='Tattoo Preview'
          className='w-full h-auto rounded-lg shadow-lg'
        />
      </Card>
    )
  }

  if (inFlight) {
    return (
      <Card className='p-12 mb-8 text-center'>
        <div className='animate-pulse'>
          <div className='w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4'></div>
          <p className='text-gray-600'>Generating preview...</p>
          <p className='text-sm text-gray-500 mt-2'>
            This usually takes 10-30 seconds
          </p>
        </div>
      </Card>
    )
  }

  // Failed, or finished without a result — show a clear terminal state
  // instead of an eternal pulsing placeholder.
  return (
    <Card className='p-12 mb-8 text-center'>
      <p className='text-red-600 font-medium'>
        This preview could not be generated
      </p>
      <p className='text-sm text-gray-500 mt-2 mb-6'>
        The generation failed, but you can create your own in seconds
      </p>
      <Button asChild size='lg'>
        <Link href='/sign-up'>Create Your Own</Link>
      </Button>
    </Card>
  )
}
