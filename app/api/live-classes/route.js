import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import LiveClass from "@/schema/LiveClass";
import Users from "@/schema/Users";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

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
    } catch (error) { // Changed jwtError to error for generic catch
      console.error("JWT verification failed:", error);
      if (error.name === 'TokenExpiredError') {
        return { success: false, error: 'Session expired. Please log in again.', status: 401 };
      }
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

    return { success: true, userBatchCodes: user.batchCodes };
  } catch (error) {
    console.error("Detailed Authentication Failed Error in verifyUserAndGetBatchCodes (Live Classes API):", error);
    return { success: false, error: `Authentication failed: ${error.message || 'Unknown error'}`, status: 500 };
  }
}

// Helper function to calculate class status
const calculateClassStatus = (liveClass) => {
  const now = new Date();
  const start = new Date(liveClass.startTime);
  const end = new Date(liveClass.endTime);

  if (!liveClass.isActive) {
    return 'Inactive';
  }
  if (now >= start && now <= end) {
    return 'Live Now';
  }
  if (now < start) {
    return 'Upcoming';
  }
  if (now > end) {
    return 'Ended';
  }
  return 'Unknown';
};

// GET method to fetch live classes for students based on their batch codes
export async function GET(req) {
  try {
    const authResult = await verifyUserAndGetBatchCodes(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await ConnectToDB();

    const studentBatchCodes = authResult.userBatchCodes;

    // Find active live classes that are assigned to any of the student's batches
    // Removed endTime filter here, as we want to show 'Ended' classes too
    const liveClasses = await LiveClass.find({
      batchCodes: { $in: studentBatchCodes }, // Match any of the student's batch codes
    }).sort({ startTime: 1 }); // Sort by upcoming classes

    // NEW: Map over liveClasses to add calculatedStatus
    const liveClassesWithStatus = liveClasses.map(cls => ({
      ...cls.toObject(),
      calculatedStatus: calculateClassStatus(cls)
    }));

    return NextResponse.json({ liveClasses: liveClassesWithStatus }, { status: 200 });
  } catch (error) {
    console.error("Error fetching student live classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch live classes" },
      { status: 500 }
    );
  }
}
