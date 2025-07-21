// app/api/admin/notifications/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ConnectToDB from "@/DB/ConnectToDB";
import Notification from "@/schema/Notification";
import Users from "@/schema/Users";
import mongoose from "mongoose"; // NEW: Import mongoose for ObjectId validation

// Utility function to verify admin
async function verifyAdmin(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found', status: 401 };
    }

    let decoded;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      console.error("JWT verification failed in verifyAdmin:", error);
      if (error.name === 'TokenExpiredError') {
        return { success: false, error: 'Session expired. Please log in again.', status: 401 };
      }
      return { success: false, error: 'Invalid token', status: 401 };
    }

    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      console.error("Invalid userId format in token for admin:", decoded.userId);
      return { success: false, error: 'Invalid user ID format in token', status: 401 };
    }

    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('isAdmin');

    if (!user || !user.isAdmin) {
      return { success: false, error: 'Unauthorized access: Not an administrator', status: 403 };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Detailed Authentication Failed Error in verifyAdmin (Admin Notifications API):", error);
    return { success: false, error: `Authentication failed: ${error.message || 'Unknown error'}`, status: 500 };
  }
}

// GET method to fetch all notifications for admin (super admin access)
export async function GET(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await ConnectToDB();

    // Fetch all notifications. Admins (super admin) can see everything.
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(50) // Limit to a reasonable number for display
      .populate('user', 'name email'); // Populate user details if needed

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// Optional: PUT method to mark all notifications as read for admin
// You might want to implement a specific way for admins to manage notifications (e.g., mark individual as read)
// For simplicity, this example just provides a GET for all notifications.