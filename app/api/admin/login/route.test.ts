/** @jest-environment node */
import { POST } from './route'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

jest.mock('@/config/mongodb', () => ({
  __esModule: true,
  default: {
    collection: jest.fn(),
  },
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

jest.mock('@/service/jwt.service', () => ({
  GenerateToken: jest.fn(() => 'mock-jwt-token'),
}))

import db from '@/config/mongodb'

const mockFindOne = jest.fn()
;(db.collection as jest.Mock).mockReturnValue({ findOne: mockFindOne })

function makeRequest(body: any) {
  return new NextRequest('http://localhost/api/login', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/login', () => {
  it('returns 400 for invalid email format', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email', password: 'password123' }))
    const json = await res.json()
    expect(res.status).toBe(400)
    expect(json.success).toBe(false)
  })

  it('returns 400 for password under 6 characters', async () => {
    const res = await POST(makeRequest({ email: 'user@test.com', password: '123' }))
    const json = await res.json()
    expect(res.status).toBe(400)
    expect(json.success).toBe(false)
  })

  it('returns 400 when email is missing', async () => {
    const res = await POST(makeRequest({ password: 'password123' }))
    expect(res.status).toBe(400)
  })

  it('returns 404 when user is not found', async () => {
    mockFindOne.mockResolvedValue(null)
    const res = await POST(makeRequest({ email: 'user@test.com', password: 'password123' }))
    const json = await res.json()
    expect(res.status).toBe(404)
    expect(json.message).toBe('User Not Found')
  })

  it('returns 401 when password does not match', async () => {
    mockFindOne.mockResolvedValue({ _id: 'abc123', email: 'user@test.com', password: 'hashed' })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)
    const res = await POST(makeRequest({ email: 'user@test.com', password: 'wrongpass' }))
    const json = await res.json()
    expect(res.status).toBe(401)
    expect(json.message).toBe('Invalid username or password')
  })

  it('returns 200 with user_id and sets cookie on success', async () => {
    mockFindOne.mockResolvedValue({
      _id: 'abc123',
      email: 'user@test.com',
      password: 'hashed',
      full_name: 'Vicky Selvam',
    })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

    const res = await POST(makeRequest({ email: 'user@test.com', password: 'password123' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.user_id).toBe('abc123')
    expect(res.cookies.get('admin-token')?.value).toBe('mock-jwt-token')
  })

  it('returns 500 when db throws an unexpected error', async () => {
    mockFindOne.mockRejectedValue(new Error('connection refused'))
    const res = await POST(makeRequest({ email: 'user@test.com', password: 'password123' }))
    const json = await res.json()
    expect(res.status).toBe(500)
    expect(json.success).toBe(false)
  })
})