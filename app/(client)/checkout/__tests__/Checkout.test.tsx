import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Checkout from "../Checkout";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockToastError = jest.fn();
jest.mock("sonner", () => ({
  toast: { error: (msg: string) => mockToastError(msg) },
}));

const mockMutate = jest.fn();
jest.mock("@/hooks/queries/useOrders", () => ({
  usePlaceOrder: jest.fn(),
}));

jest.mock("../../products/components/CartActionButtons", () => ({
  __esModule: true,
  default: () => <div data-testid="cart-action-buttons" />,
}));

import { usePlaceOrder } from "@/hooks/queries/useOrders";
const mockedUsePlaceOrder = usePlaceOrder as jest.Mock;

const cartItems = [
  {
    id: "1",
    product_name: "Margherita Pizza",
    price: 249,
    quantity: 2,
    image: "/pizza.jpg",
  },
  {
    id: "2",
    product_name: "Cheese Burger",
    price: 149,
    quantity: 1,
    image: "/burger.jpg",
  },
];

function setCart(items: any[]) {
  window.localStorage.setItem("cart", JSON.stringify(items));
}

beforeEach(() => {
  window.localStorage.clear();
  mockPush.mockClear();
  mockToastError.mockClear();
  mockMutate.mockClear();
  mockedUsePlaceOrder.mockReturnValue({ mutate: mockMutate, isPending: false });
});

async function fillDeliveryForm() {
  await userEvent.type(
    screen.getByPlaceholderText("Full Name"),
    "Vicky Selvam",
  );
  await userEvent.type(screen.getByPlaceholderText("Address"), "12 MG Road");
  await userEvent.type(screen.getByPlaceholderText("Phone"), "9876543210");
}

describe("Checkout", () => {
  it("renders cart items and subtotal from localStorage", () => {
    setCart(cartItems);
    render(<Checkout />);
    expect(screen.getByText("Margherita Pizza")).toBeInTheDocument();
    expect(screen.getByText("Cheese Burger")).toBeInTheDocument();
    expect(screen.getByText("$647.00")).toBeInTheDocument();
  });

  it("shows empty cart state when no items in localStorage", () => {
    render(<Checkout />);
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it("shows validation errors when submitting with empty fields", async () => {
    setCart(cartItems);
    render(<Checkout />);
    await userEvent.click(screen.getByRole("button", { name: /place order/i }));
    expect(
      await screen.findByText(/full name is required/i),
    ).toBeInTheDocument();
    expect(await screen.findByText(/address is required/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/phone number is required/i),
    ).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows a toast error when submitting a valid form with an empty cart", async () => {
    render(<Checkout />);
    await fillDeliveryForm();
    await userEvent.click(screen.getByRole("button", { name: /place order/i }));
    expect(mockToastError).toHaveBeenCalledWith("Your cart is empty");
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("calls mutate with delivery details and products when form is valid", async () => {
    setCart(cartItems);
    render(<Checkout />);
    await fillDeliveryForm();
    await userEvent.click(screen.getByRole("button", { name: /place order/i }));
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        full_name: "Vicky Selvam",
        address: "12 MG Road",
        phone: "9876543210",
        products: cartItems,
      }),
    );
  });

  it("disables submit button and shows loading text while pending", () => {
    mockedUsePlaceOrder.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });
    setCart(cartItems);
    render(<Checkout />);
    const button = screen.getByRole("button", { name: /loading/i });
    expect(button).toBeDisabled();
  });

  it("navigates to /products when back button clicked", async () => {
    setCart(cartItems);
    render(<Checkout />);
    const backButton = screen.getAllByRole("button")[0];
    await userEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith("/products");
  });
});
