import db from "@/config/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
export async function GET(req: NextRequest) {
  try {
    const device_id = req.nextUrl.searchParams.get("device_id");

    if (!device_id) {
      return NextResponse.json(
        { orders: [] },
        { status: 200 },
      );
    }

    const orders = await db
      .collection("orders")
      .find({ device_id })
      .sort({ ordered_on: -1 })
      .toArray();

    return NextResponse.json(
      { orders, success: true },
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { msg: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { order_id, status } = await req.json();

    if (!order_id || !status) {
      return NextResponse.json(
        { msg: "order_id and status are required", success: false },
        { status: 400 },
      );
    }

    const result = await db
      .collection("orders")
      .updateOne({ _id: new ObjectId(order_id) }, { $set: { status } });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { msg: "Order not found", success: false },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { msg: "Order updated successfully", success: true },
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { msg: "Internal Server Error", success: false },
      { status: 500 },
    );
  }
}
