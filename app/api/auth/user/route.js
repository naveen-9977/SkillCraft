import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ConnectToDB from "@/DB/ConnectToDB";
import Users from "@/schema/Users";
import mongoose from "mongoose";

export async function GET() {
  try {
    const cookieStore = cookies(); 
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      console.error("Invalid userId format in token:", decoded.userId);
      return NextResponse.json(
        { success: false, error: "Invalid user ID format in token" },
        { status: 401 }
      );
    }

    await ConnectToDB();
    // UPDATED: Ensure 'role' is selected from the database
    const user = await Users.findById(decoded.userId).select("name email role batchCodes status").lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed due to a server error." },
      { status: 500 }
    );
  }
}