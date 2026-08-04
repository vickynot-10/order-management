import { NextRequest, NextResponse } from "next/server";
import { DecryptJWT } from "@/service/jwt.service";
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success : false }, { status: 200 });
    }

    const data = DecryptJWT(token);

    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json({ msg: "Internal Server Error" }, { status: 500 });
  }
}
