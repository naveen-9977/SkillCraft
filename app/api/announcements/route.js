import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Announcement from "@/schema/Announcement";
import Users from "@/schema/Users";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Utility function to verify user and get their batch codes
async function verifyUserAndGetBatchCodes(req) { // NEW: Renamed function
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

    // NEW: Select batchCodes (plural)
    const user = await Users.findById(decoded.userId).select('batchCodes status'); 

    if (!user) {
      return { success: false, error: 'User not found', status: 404 };
    }

    // NEW: Check if user is approved and has at least one batch code
    if (user.status !== 'approved' || !Array.isArray(user.batchCodes) || user.batchCodes.length === 0) {
      return { success: false, error: 'User not approved or not assigned to any batch. Please contact your administrator.', status: 403 };
    }

    // NEW: Return batchCodes array
    return { success: true, userBatchCodes: user.batchCodes };
  } catch (error) {
    console.error("Detailed Authentication Failed Error in verifyUserAndGetBatchCodes (announcements API):", error);
    return { success: false, error: `Authentication failed: ${error.message || 'Unknown error'}`, status: 500 };
  }
}

// GET method to fetch announcements for the authenticated student's batch
export async function GET(req) {
  try {
    const authResult = await verifyUserAndGetBatchCodes(req); // NEW: Call updated function
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await ConnectToDB();

    const studentBatchCodes = authResult.userBatchCodes; // NEW: Get array of batch codes

    // NEW: Filter announcements by ANY of the authenticated student's batch codes
    const announcements = await Announcement.find({ batchCode: { $in: studentBatchCodes } }).sort({ createdAt: -1 });

    return NextResponse.json({ announcements }, { status: 200 });
  } catch (error) {
    console.error("Error fetching student announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}
