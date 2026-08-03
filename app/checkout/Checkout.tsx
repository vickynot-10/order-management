"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { CartItem } from "@/types/product.types";
import CartActionButtons from "../products/components/CartActionButtons";
import { PackageSearch } from "lucide-react";
import { usePlaceOrder } from "@/hooks/queries/useOrders";
import Link from "next/link";
type DeliveryDetails = {
  full_name: string;
  address: string;
  phone: string;
};

function getDeviceId(): string {
  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
}

export default function Checkout() {
  const [products, setProducts] = useState<CartItem[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryDetails>();

  useEffect(() => {
    const products = localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart") || "[]")
      : [];
    setProducts(products);
  }, []);
  const { mutate, isPending } = usePlaceOrder();

  const subtotal = useMemo(() => {
    return products.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [products]);

  const onSubmit = (data: DeliveryDetails) => {
    if (products.length === 0) {
      return toast.error("Your cart is empty");
    }
    (data as any).products = products;
(data as any).device_id = getDeviceId();
    mutate(data);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Shopping Cart</h2>
        <p className="text-sm text-muted-foreground mb-4">
          You have {products.length} items in your cart
        </p>

        <div className="flex flex-col gap-3">
          {products.length <= 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <PackageSearch className="h-16 w-16 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-semibold">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground">
                  Browse products and add your favorites.
                </p>
              </div>
              <Button>
                <Link href="/">Browse Products</Link>
              </Button>
            </div>
          )}

          {products &&
            products.length > 0 &&
            products.map((item) => (
              <div key={item.id} className="rounded-lg border p-3">
                <div className="flex gap-3">
                  <img
                    src={item.image}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div>
                    <h4 className="font-medium">{item.product_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${item.price}
                    </p>
                  </div>
                </div>
                <CartActionButtons item={item} setProducts={setProducts} />
              </div>
            ))}
        </div>

        <div className="border-t mt-4 pt-4 flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">Delivery Details</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <Input
              placeholder="Full Name"
              {...register("full_name", { required: "Full name is required" })}
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Address</label>
            <Input
              placeholder="Address"
              {...register("address", { required: "Address is required" })}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input
              placeholder="Phone"
              {...register("phone", { required: "Phone number is required" })}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <Button
            size="lg"
            className="w-full"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Loading..." : "Place Order"}
          </Button>
        </form>
      </div>
    </div>
  );
}
