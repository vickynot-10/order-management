/** @jest-environment node */
import { POST } from './route'
import { NextRequest } from 'next/server'

jest.mock('@/config/mongodb', () => ({
  __esModule: true,
  default: { collection: jest.fn() },
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

jest.mock('@/service/jwt.service', () => ({
  GenerateToken: jest.fn(() => 'mock-jwt-token'),
}))

import db from '@/config/mongodb'
import bcrypt from 'bcryptjs'

const mockFindOne = jest.fn()

function makeRequest(body: any) {
  return new NextRequest('http://localhost/api/sign-in', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(db.collection as jest.Mock).mockReturnValue({ findOne: mockFindOne })
})

describe('POST /api/sign-in', () => {
  it('returns 400 for invalid email format', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email', password: 'password123' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for password under 6 characters', async () => {
    const res = await POST(makeRequest({ email: 'user@test.com', password: '123' }))
    expect(res.status).toBe(400)
  })

  it('returns 401 when user is not found', async () => {
    mockFindOne.mockResolvedValue(null)
    const res = await POST(makeRequest({ email: 'user@test.com', password: 'password123' }))
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.msg).toBe('Invalid email or password')
  })

  it('returns 400 when account is deactivated', async () => {
    mockFindOne.mockResolvedValue({ _id: '1', email: 'user@test.com', password: 'hashed', status: false })
    const res = await POST(makeRequest({ email: 'user@test.com', password: 'password123' }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.msg).toMatch(/deactivated/i)
  })

  it('returns 401 when password does not match', async () => {
    mockFindOne.mockResolvedValue({ _id: '1', email: 'user@test.com', password: 'hashed', status: true })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

    const res = await POST(makeRequest({ email: 'user@test.com', password: 'wrongpass' }))
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.msg).toBe('Invalid email or password')
  })

  it('returns 200 and sets token cookie on success', async () => {
    mockFindOne.mockResolvedValue({
      _id: '1',
      email: 'user@test.com',
      password: 'hashed',
      status: true,
      full_name: 'Vicky Selvam',
    })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

    const res = await POST(makeRequest({ email: 'user@test.com', password: 'password123' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(res.cookies.get('token')?.value).toBe('mock-jwt-token')
  })

  it('returns 500 when db throws', async () => {
    mockFindOne.mockRejectedValue(new Error('db down'))
    const res = await POST(makeRequest({ email: 'user@test.com', password: 'password123' }))
    expect(res.status).toBe(500)
  })
})