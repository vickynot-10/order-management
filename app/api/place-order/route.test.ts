/** @jest-environment node */
import { POST } from './route'
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

const mockInsertOne = jest.fn()

const validProduct = {
  id: 1,
  product_name: 'Margherita Pizza',
  image: 'https://example.com/pizza.jpg',
  price: 249,
  quantity: 2,
}

const validBody = {
  full_name: 'Vicky Selvam',
  address: '12 MG Road',
  phone: '9876543210',
  products: [validProduct],
}

function makeRequest(body: any, token?: string) {
  const req = new NextRequest('http://localhost/api/place-order', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
  if (token) req.cookies.set('token', token)
  return req
}

beforeEach(() => {
  jest.clearAllMocks()
  ;(db.collection as jest.Mock).mockReturnValue({ insertOne: mockInsertOne })
})

describe('POST /api/place-order', () => {
  it('returns 401 when no token cookie is present', async () => {
    const res = await POST(makeRequest(validBody))
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.message).toBe('Login Required to Place order !')
  })

  it('returns 400 when full_name is missing', async () => {
    const { full_name, ...rest } = validBody
    const res = await POST(makeRequest(rest, 'valid-token'))
    expect(res.status).toBe(400)
  })

  it('returns 400 when phone is under 10 digits', async () => {
    const res = await POST(makeRequest({ ...validBody, phone: '123' }, 'valid-token'))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.msg).toMatch(/at least 10 digits/i)
  })

  it('returns 400 when products array is empty', async () => {
    const res = await POST(makeRequest({ ...validBody, products: [] }, 'valid-token'))
    expect(res.status).toBe(400)
  })

  it('returns 400 when a product price is not positive', async () => {
    const badProduct = { ...validProduct, price: -5 }
    const res = await POST(makeRequest({ ...validBody, products: [badProduct] }, 'valid-token'))
    expect(res.status).toBe(400)
  })

  it('returns 401 when token decodes to no user_id', async () => {
    ;(GetUserDetails as jest.Mock).mockReturnValue({})
    const res = await POST(makeRequest(validBody, 'bad-token'))

    expect(res.status).toBe(401)
  })

  it('places the order and returns success', async () => {
    ;(GetUserDetails as jest.Mock).mockReturnValue({ user_id: new ObjectId().toString() })
    mockInsertOne.mockResolvedValue({ acknowledged: true, insertedId: new ObjectId() })

    const res = await POST(makeRequest(validBody, 'valid-token'))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.msg).toBe('Order Placed Successfully')
    expect(mockInsertOne).toHaveBeenCalledWith(
      expect.objectContaining({ full_name: 'Vicky Selvam', status: 'placed' })
    )
  })

  it('returns 400 when insert is not acknowledged', async () => {
    ;(GetUserDetails as jest.Mock).mockReturnValue({ user_id: new ObjectId().toString() })
    mockInsertOne.mockResolvedValue({ acknowledged: false })

    const res = await POST(makeRequest(validBody, 'valid-token'))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.msg).toMatch(/failed to order/i)
  })

  it('returns 500 when db throws', async () => {
    ;(GetUserDetails as jest.Mock).mockReturnValue({ user_id: new ObjectId().toString() })
    mockInsertOne.mockRejectedValue(new Error('db down'))

    const res = await POST(makeRequest(validBody, 'valid-token'))
    const json = await res.json()

    expect(res.status).toBe(500)
  })
})