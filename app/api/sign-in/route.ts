import db from "@/config/mongodb";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { GenerateToken } from "@/service/jwt.service";

const LoginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email format"),

  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validate = LoginSchema.safeParse(body);

    if (!validate.success) {
      return NextResponse.json(
        {
          msg: validate.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const { email, password } = validate.data;

    const find_user = await db.collection("users").findOne(
      {
        email,
        user_type: 2,
      },
      {
        projection: {
          email: 1,
          _id: 1,
          password: 1,
          full_name: 1,
          status: 1,
        },
      },
    );

    if (!find_user) {
      return NextResponse.json(
        {
          msg: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    if (find_user.status === false) {
      return NextResponse.json(
        {
          msg: "Account is deactivated. Please contact the admin.",
        },
        { status: 400 },
      );
    }

    const isMatch = await bcrypt.compare(password, find_user.password);

    if (!isMatch) {
      return NextResponse.json(
        {
          msg: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    const token = GenerateToken({
      email,
      user_id: find_user._id,
      name: find_user.name,
    });

    const response = NextResponse.json(
      {
        msg: "Login successful",
        success: true,
      },
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
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        msg: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
