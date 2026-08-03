import db from "@/config/mongodb";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  try {
    const orders = await db
      .collection("orders")
      .find()
      .sort({ ordered_on: -1 })
      .toArray();

    return NextResponse.json({ orders, success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}
