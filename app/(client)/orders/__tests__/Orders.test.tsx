import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ViewOrders from '../Orders'
import { ORDER_CONSTANTS } from '@/constants'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

jest.mock('@/hooks/queries/useOrders', () => ({
  useGetOrders: jest.fn(),
}))

jest.mock('@/hooks/queries/useOrderEvents', () => ({
  useOrderStatusStream: jest.fn(),
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton" />,
}))

import { useGetOrders } from '@/hooks/queries/useOrders'
import { useOrderStatusStream } from '@/hooks/queries/useOrderEvents'

const mockedUseGetOrders = useGetOrders as jest.Mock
const mockedUseOrderStatusStream = useOrderStatusStream as jest.Mock

const baseOrder = {
  _id: 'order-1',
  full_name: 'Vicky Selvam',
  ordered_on: '2026-08-01T10:00:00.000Z',
  status: ORDER_CONSTANTS.PLACED,
  products: [
    { id: '1', product_name: 'Margherita Pizza', quantity: 2, price: 249, image: '/pizza.jpg' },
  ],
}

beforeEach(() => {
  mockPush.mockClear()
  mockedUseOrderStatusStream.mockClear()
})

describe('ViewOrders', () => {
  it('shows skeletons while loading', () => {
    mockedUseGetOrders.mockReturnValue({ data: undefined, isLoading: true, isError: false })
    render(<ViewOrders />)
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
    expect(screen.queryByText(/no orders yet/i)).not.toBeInTheDocument()
  })

  it('shows error message when fetch fails', () => {
    mockedUseGetOrders.mockReturnValue({ data: undefined, isLoading: false, isError: true })
    render(<ViewOrders />)
    expect(screen.getByText(/failed to load orders/i)).toBeInTheDocument()
  })

  it('shows empty state when there are no orders', () => {
    mockedUseGetOrders.mockReturnValue({ data: [], isLoading: false, isError: false })
    render(<ViewOrders />)
    expect(screen.getByText(/no orders yet/i)).toBeInTheDocument()
  })

  it('renders order details when orders exist', () => {
    mockedUseGetOrders.mockReturnValue({ data: [baseOrder], isLoading: false, isError: false })
    render(<ViewOrders />)
    expect(screen.getByText('Vicky Selvam')).toBeInTheDocument()
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
    expect(screen.getByText(/qty 2/i)).toBeInTheDocument()
    expect(screen.getByText(ORDER_CONSTANTS.PLACED)).toBeInTheDocument()
  })

  it('shows cancelled message in timeline for cancelled orders', () => {
    const cancelledOrder = { ...baseOrder, status: ORDER_CONSTANTS.CANCELLED }
    mockedUseGetOrders.mockReturnValue({ data: [cancelledOrder], isLoading: false, isError: false })
    render(<ViewOrders />)
    expect(screen.getByText(/order cancelled/i)).toBeInTheDocument()
  })

  it('shows step timeline for non-cancelled orders', () => {
    mockedUseGetOrders.mockReturnValue({ data: [baseOrder], isLoading: false, isError: false })
    render(<ViewOrders />)
    expect(screen.getByText(ORDER_CONSTANTS.DELIVERED)).toBeInTheDocument()
    expect(screen.queryByText(/order cancelled/i)).not.toBeInTheDocument()
  })

  it('calls useOrderStatusStream to keep status updated', () => {
    mockedUseGetOrders.mockReturnValue({ data: [baseOrder], isLoading: false, isError: false })
    render(<ViewOrders />)
    expect(mockedUseOrderStatusStream).toHaveBeenCalled()
  })

  it('navigates back to /products when back button clicked', async () => {
    mockedUseGetOrders.mockReturnValue({ data: [baseOrder], isLoading: false, isError: false })
    render(<ViewOrders />)
    await userEvent.click(screen.getByRole('button'))
    expect(mockPush).toHaveBeenCalledWith('/products')
  })
})