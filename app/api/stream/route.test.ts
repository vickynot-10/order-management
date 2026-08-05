/** @jest-environment node */
import { GET } from './route'
import { orderEvents } from '@/lib/order_events'

jest.useFakeTimers()

async function readChunk(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const { value } = await reader.read()
  return new TextDecoder().decode(value)
}

describe('GET /api/stream', () => {
  it('sets the correct SSE headers', async () => {
    const res = await GET()
    expect(res.headers.get('Content-Type')).toBe('text/event-stream')
    expect(res.headers.get('Cache-Control')).toBe('no-cache')
    expect(res.headers.get('Connection')).toBe('keep-alive')
  })

  it('sends order data when a status-update event fires', async () => {
    const res = await GET()
    const reader = res.body!.getReader()

    const payload = { order_id: '1', status: 'delivered' }
    orderEvents.emit('status-update', payload)

    const chunk = await readChunk(reader)
    expect(chunk).toBe(`data: ${JSON.stringify(payload)}\n\n`)

    reader.cancel()
  })

  it('sends a ping on the keep-alive interval', async () => {
    const res = await GET()
    const reader = res.body!.getReader()

    jest.advanceTimersByTime(15000)

    const chunk = await readChunk(reader)
    expect(chunk).toBe(': ping\n\n')

    reader.cancel()
  })

  it('removes the status-update listener when the stream is cancelled', async () => {
    const before = orderEvents.listenerCount('status-update')
    const res = await GET()
    const reader = res.body!.getReader()

    // Trigger start() by reading once to attach the listener, without needing a real event
    const readPromise = reader.read()
    await Promise.race([readPromise, Promise.resolve()])

    expect(orderEvents.listenerCount('status-update')).toBe(before + 1)

    await reader.cancel('test done')
    expect(orderEvents.listenerCount('status-update')).toBe(before)
  })
})

afterEach(() => {
  jest.clearAllTimers()
})