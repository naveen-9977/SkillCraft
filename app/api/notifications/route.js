// app/api/notifications/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ConnectToDB from "@/DB/ConnectToDB";
import Notification from "@/schema/Notification";
import Users from "@/schema/Users"; // NEW: Import Users schema for batch codes
import mongoose from "mongoose"; // NEW: Import mongoose for ObjectId validation

// Utility function to verify user and get their batch codes
async function verifyUserAndGetBatchCodes(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found', status: 401 };
    }

    let decoded;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return { success: false, error: 'Invalid token', status: 401 };
    }

    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      console.error("Invalid userId format in token:", decoded.userId);
      return { success: false, error: 'Invalid user ID format in token', status: 401 };
    }

    await ConnectToDB();

    const user = await Users.findById(decoded.userId).select('batchCodes status');

    if (!user) {
      return { success: false, error: 'User not found', status: 404 };
    }

    if (user.status !== 'approved' || !Array.isArray(user.batchCodes) || user.batchCodes.length === 0) {
      return { success: false, error: 'User not approved or not assigned to any batch. Please contact your administrator.', status: 403 };
    }

    return { success: true, userId: decoded.userId, userBatchCodes: user.batchCodes }; // Return userId and batchCodes
  } catch (error) {
    console.error("Detailed Authentication Failed Error in verifyUserAndGetBatchCodes (notifications API):", error);
    return { success: false, error: `Authentication failed: ${error.message || 'Unknown error'}`, status: 500 };
  }
}

export async function GET(req) {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const authResult = await verifyUserAndGetBatchCodes(req); // NEW: Use helper function
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await ConnectToDB();

    // NEW: Filter notifications by user ID AND by any of their assigned batch codes
    const notifications = await Notification.find({
      user: authResult.userId,
      batchCode: { $in: authResult.userBatchCodes } // Only show notifications for user's batches
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}