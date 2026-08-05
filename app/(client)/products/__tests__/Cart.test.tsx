import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DrawerWithSides from '../components/CartDrawer'

const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

const mockToastError = jest.fn()
jest.mock('sonner', () => ({
  toast: { error: (msg: string) => mockToastError(msg) },
}))

jest.mock('../components/CartActionButtons', () => ({
  __esModule: true,
  default: () => <div data-testid="cart-action-buttons" />,
}))
const cartItems = [
  { id: '1', product_name: 'Margherita Pizza', price: 249, quantity: 2, image: '/pizza.jpg' },
  { id: '2', product_name: 'Cheese Burger', price: 149, quantity: 1, image: '/burger.jpg' },
]

function setCart(items: any[]) {
  window.localStorage.setItem('cart', JSON.stringify(items))
}

beforeEach(() => {
  window.localStorage.clear()
  mockPush.mockClear()
  mockToastError.mockClear()
})

describe('DrawerWithSides', () => {
  it('shows empty state when cart is empty', async () => {
    render(<DrawerWithSides />)
    await userEvent.click(screen.getByRole('button', { name: /view cart/i }))
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })

  it('renders cart items and total from localStorage', async () => {
    setCart(cartItems)
    render(<DrawerWithSides />)
    await userEvent.click(screen.getByRole('button', { name: /view cart/i }))
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
    expect(screen.getByText('Cheese Burger')).toBeInTheDocument()
    expect(screen.getByText('$647.00')).toBeInTheDocument()
  })

  it('resyncs cart from localStorage when cart-updated event fires', async () => {
    render(<DrawerWithSides />)
    setCart(cartItems)
    fireEvent(window, new Event('cart-updated'))
    await userEvent.click(screen.getByRole('button', { name: /view cart/i }))
    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
  })

  it('disables checkout button when cart is empty', async () => {
    render(<DrawerWithSides />)
    await userEvent.click(screen.getByRole('button', { name: /view cart/i }))
    expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeDisabled()
  })

  it('navigates to /checkout when cart has items', async () => {
    setCart(cartItems)
    render(<DrawerWithSides />)
    await userEvent.click(screen.getByRole('button', { name: /view cart/i }))
    await userEvent.click(screen.getByRole('button', { name: /proceed to checkout/i }))
    expect(mockPush).toHaveBeenCalledWith('/checkout')
  })
})