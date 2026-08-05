import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductsList from '../ProductsList'

beforeEach(() => {
  window.localStorage.clear()
})

describe('ProductsList', () => {
  it('renders all products with name and price', () => {
    render(<ProductsList />)
    expect(screen.getByText('Nike Jordan Air Rev')).toBeInTheDocument()
    expect(screen.getByText('$69.99')).toBeInTheDocument()
    expect(screen.getByText('Vans Old Skool')).toBeInTheDocument()
  })

  it('shows the correct item count', () => {
    render(<ProductsList />)
    expect(screen.getByText('6 items available')).toBeInTheDocument()
  })

  it('adds a new product to an empty cart', async () => {
    render(<ProductsList />)
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i })
    await userEvent.click(addButtons[0])

    const cart = JSON.parse(window.localStorage.getItem('cart') || '[]')
    expect(cart).toHaveLength(1)
    expect(cart[0]).toMatchObject({ id: 1, product_name: 'Nike Jordan Air Rev', quantity: 1 })
  })

  it('increments quantity when the same product is added again', async () => {
    render(<ProductsList />)
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i })
    await userEvent.click(addButtons[0])
    await userEvent.click(addButtons[0])

    const cart = JSON.parse(window.localStorage.getItem('cart') || '[]')
    expect(cart).toHaveLength(1)
    expect(cart[0].quantity).toBe(2)
  })

  it('adds different products as separate cart entries', async () => {
    render(<ProductsList />)
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i })
    await userEvent.click(addButtons[0])
    await userEvent.click(addButtons[1])

    const cart = JSON.parse(window.localStorage.getItem('cart') || '[]')
    expect(cart).toHaveLength(2)
    expect(cart.map((c: any) => c.id)).toEqual([1, 2])
  })
})