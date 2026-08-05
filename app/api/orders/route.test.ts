/** @jest-environment node */
import { GET } from './route'
import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'

jest.mock('@/config/mongodb', () => ({
  __esModule: true,
  default: { collection: jest.fn() },
}))

jest.mock('@/service/getUserID', () => ({
  GetUserDetails: jest.fn(),
}))

import db from '@/config/mongodb'
import { GetUserDetails } from '@/service/getUserID'

const mockToArray = jest.fn()
const mockSort = jest.fn()
const mockFind = jest.fn()

function makeRequest(token?: string) {
  const req = new NextRequest('http://localhost/api/orders')
  if (token) req.cookies.set('token', token)
  return req
}

beforeEach(() => {
  jest.clearAllMocks()
  mockFind.mockReturnValue({ sort: mockSort })
  mockSort.mockReturnValue({ toArray: mockToArray })
  ;(db.collection as jest.Mock).mockReturnValue({ find: mockFind })
})

describe('GET /api/orders', () => {
  it('returns 401 when no token cookie is present', async () => {
    const res = await GET(makeRequest())
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.message).toBe('Login Required to Place order !')
  })

  it('returns 401 when token decodes to no user_id', async () => {
    ;(GetUserDetails as jest.Mock).mockReturnValue({})
    const res = await GET(makeRequest('bad-token'))

    expect(res.status).toBe(401)
  })

  it('returns the users orders on success', async () => {
    const userId = new ObjectId().toString()
    ;(GetUserDetails as jest.Mock).mockReturnValue({ user_id: userId })
    const orders = [{ _id: '1', status: 'placed' }]
    mockToArray.mockResolvedValue(orders)

    const res = await GET(makeRequest('valid-token'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.orders).toEqual(orders)
  })

  it('returns 500 when db throws', async () => {
    ;(GetUserDetails as jest.Mock).mockReturnValue({ user_id: new ObjectId().toString() })
    mockToArray.mockRejectedValue(new Error('db down'))

    const res = await GET(makeRequest('valid-token'))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.msg).toBe('Internal Server Error')
  })
})