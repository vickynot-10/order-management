import { NextRequest, NextResponse } from "next/server";
import db from "@/config/mongodb";
import bcrypt from "bcryptjs";
import { GenerateToken } from "@/service/jwt.service";

import { z } from "zod";

const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email format"),

  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = LoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message,
        },
        { status: 400 },
      );
    }

    const { email, password } = validation.data;

    
    const user = await db.collection("users").findOne(
      {
        email: email,
        user_type: 1,
      },
      {
        projection: {
          email: 1,
          password: 1,
        },
      },
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User Not Found" },
        { status: 404 },
      );
    }

    const storedHash = user.password;

    const isMatch = await bcrypt.compare(password, storedHash);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 },
      );
    }

    const token = GenerateToken({
      email: email,
      user_id: user._id,
      full_name: user.full_name,
      user_type: 1,
    });

    const response = NextResponse.json(
      {
        success: true,
        user_id: String(user._id),
      },
      { status: 200 },
    );

    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
}
