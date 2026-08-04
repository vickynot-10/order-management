"use client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { ShoppingCart, PackageSearch } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CartActionButtons from "./CartActionButtons";

const DrawerWithSides = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const syncCart = useCallback(() => {
    const stored = localStorage.getItem("cart");
    setProducts(stored ? JSON.parse(stored) : []);
  }, []);

  useEffect(() => {
    syncCart();

    window.addEventListener("cart-updated", syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener("cart-updated", syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, [syncCart]);

  const handleOpenChange = (next: boolean) => {
    if (next) syncCart();
    setOpen(next);
  };

  const total = useMemo(() => {
    return products.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );
  }, [products]);

  const isCartEmpty = products.length <= 0;

  function NaviagateCheckout() {
    if (isCartEmpty) {
      return toast.error("Atleast Pick 1 item to checkout");
    }
    setOpen(false);
    router.push("/checkout");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Drawer swipeDirection="right" open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger>
          <Button size="lg">View Cart</Button>
        </DrawerTrigger>
        <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[50vh] data-[vaul-drawer-direction=top]:max-h-[50vh]">
          <DrawerHeader className="relative">
            <DrawerClose>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>

            <DrawerTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart
            </DrawerTitle>

            <DrawerDescription>
              Review your selected items, update quantities, and proceed to
              checkout when you're ready.
            </DrawerDescription>
          </DrawerHeader>
          {products.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <PackageSearch className="h-16 w-16 text-muted-foreground" />

              <div className="text-center">
                <h3 className="text-lg font-semibold">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground">
                  Browse products and add your favorites.
                </p>
              </div>

              <Button>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          )}
          {products &&
            products.length > 0 &&
            products.map((item: any) => (
              <div key={item.id} className=" rounded-lg border p-3">
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
          <DrawerFooter className="border-t">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={isCartEmpty}
              onClick={NaviagateCheckout}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Proceed to Checkout
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default DrawerWithSides;