import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Replicate SDK at its boundary so no request leaves the process.
// createPrediction must go through the SDK client (not raw fetch), targeting
// the nano-banana-2 model with the schema-confirmed defaults.
const { createMock, getMock, cancelMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  getMock: vi.fn(),
  cancelMock: vi.fn(),
}))

vi.mock('replicate', () => ({
  default: class ReplicateMock {
    predictions = {
      create: createMock,
      get: getMock,
      cancel: cancelMock,
    }
  },
}))

import { createPrediction } from '@/lib/replicate'

beforeEach(() => {
  createMock.mockReset()
  getMock.mockReset()
  cancelMock.mockReset()
  createMock.mockResolvedValue({
    id: 'pred_sdk_1',
    status: 'queued',
    output: null,
    error: null,
    logs: '',
  })
})

describe('createPrediction', () => {
  it('creates the prediction through the SDK against google/nano-banana-2', async () => {
    const prediction = await createPrediction({
      bodyImageUrl: 'https://blob.example.com/body.jpg',
      designImageUrl: 'https://blob.example.com/design.jpg',
      prompt: 'a test tattoo prompt',
    })

    expect(createMock).toHaveBeenCalledTimes(1)
    const args = createMock.mock.calls[0][0]
    expect(args.model).toBe('google/nano-banana-2')
    expect(prediction.id).toBe('pred_sdk_1')
    expect(prediction.status).toBe('queued')
  })

  it('sends body photo then design in image_input, matching aspect ratio at 1K, jpg output', async () => {
    await createPrediction({
      bodyImageUrl: 'https://blob.example.com/body.jpg',
      designImageUrl: 'https://blob.example.com/design.jpg',
      prompt: 'a test tattoo prompt',
    })

    const { input } = createMock.mock.calls[0][0]
    expect(input.image_input).toEqual([
      'https://blob.example.com/body.jpg',
      'https://blob.example.com/design.jpg',
    ])
    expect(input.aspect_ratio).toBe('match_input_image')
    expect(input.resolution).toBe('1K')
    expect(input.output_format).toBe('jpg')
    // nano-banana-2's confirmed input schema has no seed field, so none is sent.
    expect(input).not.toHaveProperty('seed')
  })

  it('passes webhook fields through when a webhook URL is provided', async () => {
    await createPrediction({
      bodyImageUrl: 'https://blob.example.com/body.jpg',
      designImageUrl: 'https://blob.example.com/design.jpg',
      prompt: 'a test tattoo prompt',
      webhookUrl: 'https://app.example.com/api/webhooks/replicate',
    })

    const args = createMock.mock.calls[0][0]
    expect(args.webhook).toBe('https://app.example.com/api/webhooks/replicate')
    expect(args.webhook_events_filter).toContain('completed')
  })

  it('omits webhook fields when no webhook URL is provided', async () => {
    await createPrediction({
      bodyImageUrl: 'https://blob.example.com/body.jpg',
      designImageUrl: 'https://blob.example.com/design.jpg',
      prompt: 'a test tattoo prompt',
    })

    const args = createMock.mock.calls[0][0]
    expect(args.webhook).toBeUndefined()
  })
})
