import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import ConnectToDB from "@/DB/ConnectToDB";
import Notification from "@/schema/Notification";

export async function PUT(req) {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    await ConnectToDB();

    // Mark all unread notifications for this user as read
    await Notification.updateMany(
      { user: decoded.userId, isRead: false },
      { $set: { isRead: true } }
    );

    return NextResponse.json({ message: "Notifications marked as read" }, { status: 200 });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}