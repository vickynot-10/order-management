import db from "@/config/mongodb";
import { NextRequest, NextResponse } from "next/server";
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
