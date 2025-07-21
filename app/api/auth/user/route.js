import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ConnectToDB from "@/DB/ConnectToDB";
import Users from "@/schema/Users";
import mongoose from "mongoose"; // NEW: Import mongoose for ObjectId validation

export async function GET() {
  try {
    // FIX: Await the cookies() call before accessing it
    const cookieStore = await cookies(); 
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // NEW: Validate if decoded.userId is a valid MongoDB ObjectId
    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      console.error("Invalid userId format in token:", decoded.userId);
      return NextResponse.json(
        { error: "Invalid user ID format in token" },
        { status: 401 }
      );
    }

    await ConnectToDB();
    // Select all necessary fields, including batchCodes and status
    const user = await Users.findById(decoded.userId).select("name email isAdmin batchCodes status");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        batchCodes: user.batchCodes, // Will be included (array)
        status: user.status // Will be included
      }
    });
  } catch (error) {
    console.error("Auth check error:", error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}