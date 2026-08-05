import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import CartActionButtons from '../components/CartActionButtons'
import { CartItem } from '@/types/product.types'

const baseItem: CartItem = {
  id: '1',
  product_name: 'Margherita Pizza',
  price: 249,
  quantity: 5,
  image: '/pizza.jpg',
}

function TestHarness({ initialItem }: { initialItem: CartItem }) {
  const [products, setProducts] = useState<CartItem[]>([initialItem])
  const item = products.find((p) => p.id === initialItem.id)
  return <div>{item ? <CartActionButtons item={item} setProducts={setProducts} /> : <p>removed</p>}</div>
}

function getButtons() {
  const buttons = screen.getAllByRole('button')
  return { decrement: buttons[0], increment: buttons[1], remove: buttons[2] }
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('CartActionButtons', () => {
  it('increments quantity when + clicked', async () => {
    render(<TestHarness initialItem={baseItem} />)
    const { increment } = getButtons()
    await userEvent.click(increment)
    expect(screen.getByDisplayValue('6')).toBeInTheDocument()
  })

  it('decrements quantity when - clicked', async () => {
    render(<TestHarness initialItem={baseItem} />)
    const { decrement } = getButtons()
    await userEvent.click(decrement)
    expect(screen.getByDisplayValue('4')).toBeInTheDocument()
  })

  it('does not go below quantity 1', async () => {
    render(<TestHarness initialItem={{ ...baseItem, quantity: 1 }} />)
    const { decrement } = getButtons()
    await userEvent.click(decrement)
    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
  })

  it('does not exceed quantity 99', async () => {
    render(<TestHarness initialItem={{ ...baseItem, quantity: 99 }} />)
    const { increment } = getButtons()
    await userEvent.click(increment)
    expect(screen.getByDisplayValue('99')).toBeInTheDocument()
  })

  it('removes the item when trash icon clicked', async () => {
    render(<TestHarness initialItem={baseItem} />)
    const { remove } = getButtons()
    await userEvent.click(remove)
    expect(screen.getByText('removed')).toBeInTheDocument()
  })

  it('rejects non-numeric input in the quantity field', async () => {
    render(<TestHarness initialItem={baseItem} />)
    const input = screen.getByDisplayValue('5')
    await userEvent.type(input, 'abc')
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
  })

  it('clamps manually typed quantity to max 99', async () => {
    render(<TestHarness initialItem={baseItem} />)
    const input = screen.getByDisplayValue('5')
    await userEvent.clear(input)
    await userEvent.type(input, '150')
    expect(screen.getByDisplayValue('99')).toBeInTheDocument()
  })

  it('resets to 1 on blur when field is left empty', async () => {
    render(<TestHarness initialItem={baseItem} />)
    const input = screen.getByDisplayValue('5')
    await userEvent.clear(input)
    input.blur()
    expect(await screen.findByDisplayValue('1')).toBeInTheDocument()
  })

  it('debounces the localStorage write on rapid quantity changes', async () => {
    jest.useFakeTimers()
    render(<TestHarness initialItem={baseItem} />)
    const { increment } = getButtons()

    await userEvent.click(increment, { advanceTimers: jest.advanceTimersByTime })
    await userEvent.click(increment, { advanceTimers: jest.advanceTimersByTime })

    expect(window.localStorage.getItem('cart')).toBeNull()

    jest.advanceTimersByTime(300)

    const stored = JSON.parse(window.localStorage.getItem('cart') || '[]')
    expect(stored[0].quantity).toBe(7)

    jest.useRealTimers()
  })
})