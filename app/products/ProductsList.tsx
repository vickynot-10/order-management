"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

 const products = [
  {
    id: 1,
    product_name: "Nike Jordan Air Rev",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop",
    price: 69.99,
  },
  {
    id: 2,
    product_name: "Adidas Ultraboost",
    image:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=500&auto=format&fit=crop",
    price: 89.99,
  },
  {
    id: 3,
    product_name: "Puma RS-X",
    image:
      "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=500&auto=format&fit=crop",
    price: 74.99,
  },
  {
    id: 4,
    product_name: "New Balance 574",
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&auto=format&fit=crop",
    price: 79.99,
  },
  {
    id: 5,
    product_name: "Converse Chuck Taylor",
    image:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&auto=format&fit=crop",
    price: 59.99,
  },
  {
    id: 6,
    product_name: "Vans Old Skool",
    image:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&auto=format&fit=crop",
    price: 64.99,
  },
];

export default function ProductsList() {
  function saveToCart(product: any) {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  return (
    <>
    
          <h4>Products</h4>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

      {products.map((product) => (
        <div
          key={product.id}
          className="relative max-w-md rounded-xl bg-linear-to-r from-neutral-600 to-violet-300 shadow-lg"
        >
          <div className="flex h-60 items-center justify-center">
            <img
              src={product.image}
              alt={product.product_name}
              className="h-52 object-contain"
            />
          </div>

          <Card className="ring-0">
            <CardHeader>
              <CardTitle>{product.product_name}</CardTitle>
            </CardHeader>

            <CardFooter className="justify-between">
              <span className="text-xl font-semibold">${product.price}</span>
              <Button onClick={() => saveToCart(product)}>Add to cart</Button>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
    </>
  );
}
