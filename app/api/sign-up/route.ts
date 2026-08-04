
import db from "@/config/mongodb";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { GenerateToken } from "@/service/jwt.service";

const SignupSchema = z
  .object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .min(1, "Name is required"),

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

    confirmPassword: z
      .string({
        required_error: "Confirm password is required",
      })
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validate = SignupSchema.safeParse(body);

    if (!validate.success) {
      return NextResponse.json(
        {
          msg: validate.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const { name, email, password } = validate.data;

    const find_user = await db.collection("users").findOne(
      { email },
      {
        projection: {
          email: 1,
          _id: 1,
        },
      },
    );

    if (find_user) {
      return NextResponse.json(
        {
          msg: "User with this email already exists!",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const payload_to_insert = {
      name,
      email,
      password: hashedPassword,
      created_on: new Date(),
      updated_on: new Date(),
      user_type: 2,
      status: true,
    };

    const insert_doc = await db
      .collection("users")
      .insertOne(payload_to_insert);

    if (!insert_doc.acknowledged || !insert_doc.insertedId) {
      return NextResponse.json(
        {
          msg: "Failed to create user. Please try again!",
        },
        { status: 400 },
      );
    }

    const token = GenerateToken({
      email,
      user_id: insert_doc.insertedId,
      name,
    });

    const response = NextResponse.json(
      {
        msg: "User registered successfully",
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
    console.error("SIGNUP ERROR:", error);

    return NextResponse.json(
      {
        msg: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}