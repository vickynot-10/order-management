/** @jest-environment node */
import { POST } from './route'
import { NextRequest } from 'next/server'

jest.mock('@/config/mongodb', () => ({
  __esModule: true,
  default: { collection: jest.fn() },
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
}))

jest.mock('@/service/jwt.service', () => ({
  GenerateToken: jest.fn(() => 'mock-jwt-token'),
}))

import db from '@/config/mongodb'

const mockFindOne = jest.fn()
const mockInsertOne = jest.fn()

const validBody = {
  name: 'Vicky Selvam',
  email: 'user@test.com',
  password: 'password123',
  confirmPassword: 'password123',
}

function makeRequest(body: any) {
  return new NextRequest('http://localhost/api/sign-up', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(db.collection as jest.Mock).mockReturnValue({ findOne: mockFindOne, insertOne: mockInsertOne })
})

describe('POST /api/sign-up', () => {
  it('returns 400 when passwords do not match', async () => {
    const res = await POST(makeRequest({ ...validBody, confirmPassword: 'different' }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.msg).toMatch(/do not match/i)
  })

  it('returns 400 for invalid email format', async () => {
    const res = await POST(makeRequest({ ...validBody, email: 'not-an-email' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when name is missing', async () => {
    const { name, ...rest } = validBody
    const res = await POST(makeRequest(rest))
    expect(res.status).toBe(400)
  })

  it('returns 400 when user already exists', async () => {
    mockFindOne.mockResolvedValue({ _id: '1', email: 'user@test.com' })
    const res = await POST(makeRequest(validBody))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.msg).toMatch(/already exists/i)
  })

  it('creates user and returns 200 with token cookie', async () => {
    mockFindOne.mockResolvedValue(null)
    mockInsertOne.mockResolvedValue({ acknowledged: true, insertedId: '1' })

    const res = await POST(makeRequest(validBody))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(res.cookies.get('token')?.value).toBe('mock-jwt-token')
    expect(mockInsertOne).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'user@test.com', password: 'hashed-password', user_type: 2, status: true })
    )
  })

  it('returns 400 when insert is not acknowledged', async () => {
    mockFindOne.mockResolvedValue(null)
    mockInsertOne.mockResolvedValue({ acknowledged: false })

    const res = await POST(makeRequest(validBody))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.msg).toMatch(/failed to create user/i)
  })

  it('returns 500 when db throws', async () => {
    mockFindOne.mockRejectedValue(new Error('db down'))
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(500)
  })
})