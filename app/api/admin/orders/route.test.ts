/** @jest-environment node */
import { GET, PATCH } from './route'
import { NextRequest } from 'next/server'
import { ObjectId } from 'mongodb'

jest.mock('@/config/mongodb', () => ({
  __esModule: true,
  default: { collection: jest.fn() },
}))

jest.mock('@/lib/order_events', () => ({
  orderEvents: { emit: jest.fn() },
}))

import db from '@/config/mongodb'
import { orderEvents } from '@/lib/order_events'

const mockAggregate = jest.fn()
const mockToArray = jest.fn()
const mockSort = jest.fn()
const mockUpdateOne = jest.fn()

function makeRequest(body?: any) {
  return new NextRequest('http://localhost/api/admin/orders', {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  jest.clearAllMocks()
  mockAggregate.mockReturnValue({ sort: mockSort })
  mockSort.mockReturnValue({ toArray: mockToArray })
  ;(db.collection as jest.Mock).mockReturnValue({
    aggregate: mockAggregate,
    updateOne: mockUpdateOne,
  })
})

describe('GET /api/admin/orders', () => {
  it('returns orders on success', async () => {
    const orders = [{ _id: '1', ordered_by: 'Vicky Selvam' }]
    mockToArray.mockResolvedValue(orders)

    const res = await GET({} as NextRequest)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(json.orders).toEqual(orders)
  })

  it('returns 500 when the aggregation throws', async () => {
    mockToArray.mockRejectedValue(new Error('db down'))

    const res = await GET({} as NextRequest)
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.msg).toBe('Internal Server Error')
  })
})

describe('PATCH /api/admin/orders', () => {
  it('returns 400 when order_id is missing', async () => {
    const res = await PATCH(makeRequest({ status: 'delivered' }))
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.success).toBe(false)
  })

  it('returns 400 when status is missing', async () => {
    const res = await PATCH(makeRequest({ order_id: new ObjectId().toString() }))
    const json = await res.json()

    expect(res.status).toBe(400)
  })

  it('returns 404 when no order matches the id', async () => {
    mockUpdateOne.mockResolvedValue({ matchedCount: 0 })

    const res = await PATCH(makeRequest({ order_id: new ObjectId().toString(), status: 'delivered' }))
    const json = await res.json()

    expect(res.status).toBe(404)
    expect(json.msg).toBe('Order not found')
  })

  it('updates the order, emits status-update, and returns 200', async () => {
    mockUpdateOne.mockResolvedValue({ matchedCount: 1 })
    const order_id = new ObjectId().toString()

    const res = await PATCH(makeRequest({ order_id, status: 'delivered' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.success).toBe(true)
    expect(orderEvents.emit).toHaveBeenCalledWith('status-update', { order_id, status: 'delivered' })
  })

  it('returns 500 when updateOne throws', async () => {
    mockUpdateOne.mockRejectedValue(new Error('db down'))

    const res = await PATCH(makeRequest({ order_id: new ObjectId().toString(), status: 'delivered' }))
    const json = await res.json()

    expect(res.status).toBe(500)
    expect(json.success).toBe(false)
  })
})