import db from "@/config/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { GetUserDetails } from "@/service/getUserID";
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Login Required to Place order !" },
        { status: 401 },
      );
    }
    const user: any = GetUserDetails(token);

    if (!user || !user.user_id) {
      return NextResponse.json(
        { message: "Login Required to Place order !" },
        { status: 401 },
      );
    }

    const orders = await db
      .collection("orders")
      .find({ fk_user_id: new ObjectId(user.user_id) })
      .sort({ ordered_on: -1 })
      .toArray();

    return NextResponse.json({ orders, success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}


