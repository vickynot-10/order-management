import db from "@/config/mongodb";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { GenerateToken } from "@/service/jwt.service";
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { full_name, email, phone, password } = data;

    if (!full_name || !email || !phone || !password) {
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

    if (phone.length < 10) {
      return NextResponse.json(
        { msg: "Invalid phone number" },
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
      { email: email },
      {
        projection: {
          email: 1,
          _id: 1,
        },
      },
    );

    if (find_user) {
      return NextResponse.json(
        { msg: "User with this mail already exists !" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const payload_to_insert = {
      full_name,
      email,
      password: hashedPassword,
      phone,
      created_on: Date.now(),
      updated_on: Date.now(),
      user_type: 2,
      status: true,
    };

    const insert_doc = await db
      .collection("users")
      .insertOne(payload_to_insert);

    if (!insert_doc || !insert_doc.acknowledged || !insert_doc.insertedId) {
      return NextResponse.json(
        { msg: "Failed to create User , Please Try Again !" },
        { status: 400 },
      );
    }

    const token = GenerateToken({
      email,
      user_id: insert_doc.insertedId,
      full_name,
      user_type: 2,
    });

    const response = NextResponse.json(
      { msg: "User Registered successful" },
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
