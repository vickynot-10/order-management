import db from "@/config/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { orderEvents } from "@/lib/order_events";
export async function GET(req: NextRequest) {
  try {
    const orders = await db
      .collection("orders")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "fk_user_id",
            foreignField: "_id",
            as: "ordered_by",
          },
        },
        {
          $unwind: {
            path: "$ordered_by",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $addFields: {
            ordered_by: "$ordered_by.name",
          },
        },
      ])
      .sort({ ordered_on: -1 })
      .toArray();

    return NextResponse.json({ orders, success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { order_id, status, fk_user_id } = await req.json();

    if (!order_id || !status || !fk_user_id) {
      return NextResponse.json(
        { msg: "order_id, status and fk_user_id are required", success: false },
        { status: 400 },
      );
    }

    const result = await db
      .collection("orders")
      .updateOne({ _id: new ObjectId(order_id) , fk_user_id : new ObjectId(fk_user_id) }, { $set: { status } });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { msg: "Order not found", success: false },
        { status: 404 },
      );
    }

    orderEvents.emit("status-update", { order_id, status, user_id: fk_user_id });

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
