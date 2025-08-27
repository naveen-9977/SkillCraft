import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ConnectToDB from "@/DB/ConnectToDB";
import Notification from "@/schema/Notification";
import Users from "@/schema/Users";
import mongoose from "mongoose";

// Utility function to verify the user is an admin or mentor
async function verifyAdminOrMentor(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (!token) return { success: false, error: 'No token found' };

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return { success: false, error: 'Invalid token' };
    }
    
    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('role');

    if (!user || (user.role !== 'admin' && user.role !== 'mentor')) {
      return { success: false, error: 'Unauthorized access' };
    }
    return { success: true, userId: decoded.userId };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

export async function PUT(req) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    await ConnectToDB();

    // Mark all unread notifications for this specific admin/mentor as read
    await Notification.updateMany(
      { user: authResult.userId, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ message: "Notifications marked as read" }, { status: 200 });
  } catch (error) {
    console.error("Error marking admin notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}