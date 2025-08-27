import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ConnectToDB from "@/DB/ConnectToDB";
import Notification from "@/schema/Notification";
import Users from "@/schema/Users";
import mongoose from "mongoose";

// This function now returns the full user object for detailed permission checks
async function verifyAdminOrMentor(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found', status: 401 };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return { success: false, error: 'Invalid user ID in token', status: 401 };
    }

    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('role batchCodes');

    if (!user || (user.role !== 'admin' && user.role !== 'mentor')) {
      return { success: false, error: 'Unauthorized access', status: 403 };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: `Authentication failed: ${error.message || 'Unknown error'}`, status: 500 };
  }
}

// GET method to fetch notifications based on user role
export async function GET(req) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { user } = authResult;
    await ConnectToDB();

    let query = {};

    // UPDATED: Role-based notification filtering logic
    if (user.role === 'admin') {
      // Admins see notifications for new submissions, test results, and new user approvals
      query = {
        type: { $in: ['new_submission', 'new_test_result'] }
      };
    } else if (user.role === 'mentor') {
      // Mentors only see notifications for submissions and test results in their assigned batches
      if (user.batchCodes && user.batchCodes.length > 0) {
        query = {
          type: { $in: ['new_submission', 'new_test_result'] },
          batchCode: { $in: user.batchCodes } // The key filter for mentors
        };
      } else {
        // If a mentor has no batches, they have no relevant notifications
        return NextResponse.json({ notifications: [] }, { status: 200 });
      }
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20) // Limit to the last 20 relevant notifications
      .populate('user', 'name email');

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin/mentor notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}