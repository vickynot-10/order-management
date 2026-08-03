import db from "@/config/mongodb";
import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

const ProductSchema = z.object({
  id: z.number({
    error: "Product ID is required",
  }),

  product_name: z
    .string({
      error: "Product name is required",
    })
    .min(1, "Product name is required"),

  image: z
    .string({
      error: "Product image is required",
    })
    .url("Invalid product image URL"),

  price: z
    .number({
      error: "Product price is required",
    })
    .positive("Product price must be greater than 0"),

  quantity: z
    .number({
      error: "Product quantity is required",
    })
    .int("Product quantity must be an integer")
    .positive("Product quantity must be greater than 0"),
});

const PlaceOrderSchema = z.object({
  full_name: z
    .string({
      error: "Full name is required",
    })
    .min(1, "Full name is required"),

  address: z
    .string({
      error: "Address is required",
    })
    .min(1, "Address is required"),

  phone: z
    .string({
      error: "Phone number is required",
    })
    .min(10, "Phone number must be at least 10 digits"),

  products: z
    .array(ProductSchema, {
      error: "Products are required",
    })
    .min(1, "At least one product is required"),
});

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const body = await req.json();
    if (!body) {
      return NextResponse.json(
        {
          msg: "Invalid Format",
        },
        { status: 400 },
      );
    }
    const validate = PlaceOrderSchema.safeParse(body);

    if (!validate.success) {
      return NextResponse.json(
        {
          msg: validate.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const { full_name, address, phone, products } = validate.data;

    const payload = {
      full_name,
      address,
      phone,
      products,
      ordered_on: new Date(),
    };

    const insert = await db.collection("orders").insertOne(payload);

    if (!insert || !insert.acknowledged) {
      return NextResponse.json(
        {
          msg: "Failed to order , Please try again",
        },

        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        msg: "Order Placed Successfully",
        success: true,
      },
      {
        status: 200,
      },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        msg: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
