'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Status derived from the real prediction lifecycle returned by
// GET /api/preview/[id]. No timer-driven fake percentage — the UI shows an
// honest label and an indeterminate animation while the job is in flight.
export type PreviewJobStatus =
  | 'idle'
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'still_running'

const POLL_INTERVAL_MS = 2000

// Generous safety cap. A job still running when this is hit is NOT abandoned or
// marked failed — we stop live-polling and tell the user it is still running so
// they can check My Previews later. The server keeps working on it.
const SAFETY_CAP_MS = 10 * 60 * 1000

interface PreviewJobCallbacks {
  onSucceeded?: (result: { jobId: number; imageUrl: string }) => void
  onFailed?: (result: { jobId: number; creditRefunded: boolean; error?: string }) => void
  onStillRunning?: (result: { jobId: number }) => void
}

interface UsePreviewJobOptions extends PreviewJobCallbacks {
  // localStorage key for the in-flight job id, scoped to the signed-in user so
  // one person's job is never picked up in another's session on a shared
  // browser. Null until the user id is known — persistence and restore are a
  // no-op until then.
  storageKey: string | null
}

interface UsePreviewJob {
  jobId: number | null
  status: PreviewJobStatus
  result: string | null
  // True while the job is queued or running (the button/preview should show the
  // generating state).
  isActive: boolean
  // Begin tracking a freshly created job (after POST /api/preview succeeds).
  track: (jobId: number) => void
  // Stop tracking and forget any in-flight job (e.g. on reset).
  reset: () => void
}

function readStorage(key: string | null): number | null {
  if (!key || typeof window === 'undefined') return null
  const saved = window.localStorage.getItem(key)
  if (!saved) return null
  const id = parseInt(saved, 10)
  return Number.isNaN(id) ? null : id
}

export function usePreviewJob(options: UsePreviewJobOptions): UsePreviewJob {
  const { storageKey } = options
  const [jobId, setJobId] = useState<number | null>(null)
  const [status, setStatus] = useState<PreviewJobStatus>('idle')
  const [result, setResult] = useState<string | null>(null)

  // Keep the latest callbacks and storage key in refs so the polling effect can
  // depend only on jobId — it must not restart (and reset the safety cap) when a
  // callback identity or the resolved storage key changes.
  const cbRef = useRef<PreviewJobCallbacks>({})
  cbRef.current = {
    onSucceeded: options.onSucceeded,
    onFailed: options.onFailed,
    onStillRunning: options.onStillRunning,
  }
  const storageKeyRef = useRef<string | null>(storageKey)
  storageKeyRef.current = storageKey

  const clearStorage = useCallback(() => {
    const key = storageKeyRef.current
    if (key && typeof window !== 'undefined') {
      window.localStorage.removeItem(key)
    }
  }, [])

  const track = useCallback((id: number) => {
    const key = storageKeyRef.current
    if (key && typeof window !== 'undefined') {
      window.localStorage.setItem(key, String(id))
    }
    setResult(null)
    setStatus('queued')
    setJobId(id)
  }, [])

  const reset = useCallback(() => {
    clearStorage()
    setJobId(null)
    setStatus('idle')
    setResult(null)
  }, [clearStorage])

  // Reconnect on return: when the studio remounts (reload or navigate back) and
  // the user is known, pick up any in-flight job persisted in storage.
  useEffect(() => {
    if (jobId !== null) return
    const saved = readStorage(storageKey)
    if (saved !== null) {
      setStatus('queued')
      setJobId(saved)
    }
    // Intentionally keyed on storageKey only: this runs once the user id
    // resolves. jobId is checked inside to avoid clobbering an active job.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // Poll the real job status until it reaches a terminal state or the safety
  // cap. Depends only on jobId so status transitions inside the loop don't
  // restart it.
  useEffect(() => {
    if (jobId === null) return

    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const startedAt = Date.now()

    const finish = () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }

    const poll = async () => {
      if (cancelled) return

      try {
        const res = await fetch(`/api/preview/${jobId}`, { cache: 'no-store' })

        // The job is gone or belongs to a different session — stop tracking
        // rather than poll forever.
        if (res.status === 401 || res.status === 404) {
          clearStorage()
          if (!cancelled) {
            setStatus('idle')
            setJobId(null)
          }
          return finish()
        }

        if (res.ok) {
          const data = await res.json()
          const jobStatus: string | undefined = data?.job?.status

          if (jobStatus === 'succeeded' && data.results?.length > 0) {
            const imageUrl: string = data.results[0].imageUrl
            clearStorage()
            if (!cancelled) {
              setResult(imageUrl)
              setStatus('succeeded')
              cbRef.current.onSucceeded?.({ jobId, imageUrl })
            }
            return finish()
          }

          if (jobStatus === 'failed') {
            clearStorage()
            if (!cancelled) {
              setStatus('failed')
              cbRef.current.onFailed?.({
                jobId,
                creditRefunded: Boolean(data.creditRefunded),
                error: data.job?.error,
              })
            }
            return finish()
          }

          // Still in flight — reflect the honest lifecycle label.
          if (!cancelled) {
            setStatus(jobStatus === 'queued' ? 'queued' : 'running')
          }
        }
      } catch {
        // Transient network error — keep polling; a slow/offline moment must
        // not abandon a job that may still be running.
      }

      if (cancelled) return

      // Safety cap reached: keep the job alive server-side, just stop live
      // polling and let the UI point the user at My Previews.
      if (Date.now() - startedAt >= SAFETY_CAP_MS) {
        clearStorage()
        if (!cancelled) {
          setStatus('still_running')
          cbRef.current.onStillRunning?.({ jobId })
        }
        return finish()
      }

      timer = setTimeout(poll, POLL_INTERVAL_MS)
    }

    poll()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [jobId, clearStorage])

  return {
    jobId,
    status,
    result,
    isActive: status === 'queued' || status === 'running',
    track,
    reset,
  }
}
