"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Plus, Minus, Trash2 } from "lucide-react";

import { CartItem } from "@/types/product.types";

type CartActionButtonsProps = {
  item: CartItem;
  setProducts: React.Dispatch<React.SetStateAction<CartItem[]>>;
};

export default function CartActionButtons({
  item,
  setProducts,
}: CartActionButtonsProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const removeItem = (productId: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      localStorage.setItem("cart", JSON.stringify(updated));
      return updated;
    });
  };

  const updateQuantity = (productId: string, operation: "inc" | "dec") => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== productId) return p;
        const qty =
          operation === "inc"
            ? Math.min(99, p.quantity + 1)
            : Math.max(1, p.quantity - 1);
        return { ...p, quantity: qty };
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        localStorage.setItem("cart", JSON.stringify(updated));
      }, 300);

      return updated;
    });
  };

  const handleQuantityChange = (productId: string, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== productId) return p;
        let qty = value === "" ? 1 : Number(value);
        qty = Math.max(1, Math.min(99, qty));
        return { ...p, quantity: qty };
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        localStorage.setItem("cart", JSON.stringify(updated));
      }, 300);

      return updated;
    });
  };

  return (
    <div className="flex justify-end items-center gap-2">
      <Button
        size="icon"
        variant="outline"
        onClick={() => updateQuantity(item.id, "dec")}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        className="w-14 text-center"
        value={item.quantity}
        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
        onBlur={(e) => {
          if (e.target.value === "" || Number(e.target.value) < 1)
            handleQuantityChange(item.id, "1");
        }}
      />
      <Button
        size="icon"
        variant="outline"
        onClick={() => updateQuantity(item.id, "inc")}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="destructive"
        onClick={() => removeItem(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
