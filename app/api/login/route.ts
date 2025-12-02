import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import mongoose from "mongoose";
import { createHash } from "crypto";
import { SignJWT } from "jose";
import { setSessionCookie } from "@/utils/auth";


function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const db = mongoose.connection;
    const usersCollection = db.collection("users");

    // Basic auth: look for user with matching email and passwordHash
    const user = await usersCollection.findOne({
      email,
      password: hashPassword(password),
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({ userId: user._id.toString(), role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(new TextEncoder().encode(process.env.NEXT_JWT_SECRET!));

    const response = NextResponse.json({
      message: "Logged in successfully",
      user: {
        _id: user._id?.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    setSessionCookie(response, token);

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { error: "Failed to login" },
      { status: 500 }
    );
  }
}


