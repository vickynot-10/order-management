/** @jest-environment node */
import { GET } from './route'
import { NextRequest } from 'next/server'

jest.mock('@/service/jwt.service', () => ({
  DecryptJWT: jest.fn(),
}))

import { DecryptJWT } from '@/service/jwt.service'

function makeRequest(token?: string) {
  const req = new NextRequest('http://localhost/api/me')
  if (token) {
    req.cookies.set('token', token)
  }
  return req
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GET /api/me', () => {
  it('returns success:false when no token cookie is present', async () => {
    const res = await GET(makeRequest())
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(false)
    expect(DecryptJWT).not.toHaveBeenCalled()
  })

  it('returns decrypted user data when a valid token is present', async () => {
    const decoded = { user_id: 'abc123', email: 'user@test.com' }
    ;(DecryptJWT as jest.Mock).mockReturnValue(decoded)

    const res = await GET(makeRequest('valid-token'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.data).toEqual(decoded)
    expect(DecryptJWT).toHaveBeenCalledWith('valid-token')
  })

  it('returns 500 when DecryptJWT throws', async () => {
    ;(DecryptJWT as jest.Mock).mockImplementation(() => {
      throw new Error('invalid signature')
    })

    const res = await GET(makeRequest('bad-token'))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.msg).toBe('Internal Server Error')
  })
})