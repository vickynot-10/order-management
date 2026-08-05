/** @jest-environment node */
import { POST } from './route'

const mockDelete = jest.fn()
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({ delete: mockDelete })),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/sign-out', () => {
  it('deletes the token cookie and returns success', async () => {
    const res = await POST()
    const json = await res.json()

    expect(mockDelete).toHaveBeenCalledWith('token')
    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
  })

  it('returns 500 if cookie deletion throws', async () => {
    mockDelete.mockImplementation(() => {
      throw new Error('cookie store unavailable')
    })
    const res = await POST()
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.success).toBe(false)
  })
})