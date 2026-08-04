import db from "@/config/mongodb";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { GenerateToken } from "@/service/jwt.service";
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { email, password } = data;

    if (!email || !password) {
      return NextResponse.json(
        { msg: "All fields are required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { msg: "Invalid email format" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { msg: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const find_user = await db.collection("users").findOne(
      { email: email, user_type: 2 },
      {
        projection: {
          email: 1,
          _id: 1,
          password: 1,
          full_name: 1,
        },
      },
    );

    if (!find_user) {
      return NextResponse.json({ msg: "User not Found!" }, { status: 404 });
    }

    if (find_user && find_user.status === false) {
      return NextResponse.json(
        { msg: "Account is Deactivated , Try Contacting Admins" },
        { status: 400 },
      );
    }

    const isMatch = await bcrypt.compare(password, find_user.password);

    if (!isMatch) {
      return NextResponse.json(
        { msg: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = GenerateToken({
      email,
      user_id: find_user._id,
      full_name: find_user.full_name,
      user_type: 2,
    });

    const response = NextResponse.json(
      { msg: "Login successful" },
      { status: 200 },
    );
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        msg: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
