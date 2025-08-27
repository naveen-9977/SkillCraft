import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import LiveClassSignaling from "@/schema/LiveClassSignaling";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import Users from "@/schema/Users";

/**
 * A robust, self-contained function to get the authenticated user's ID.
 * This is used by both GET and POST methods in this route.
 * @returns {object} An object containing success status and userId or an error.
 */
async function getAuthenticatedUserId() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return { success: false, error: 'Authentication token not found', status: 401 };
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');

        if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
            return { success: false, error: 'Invalid user ID format in token', status: 401 };
        }
        
        const userExists = await Users.findById(decoded.userId).lean();
        if (!userExists) {
            return { success: false, error: 'User not found', status: 404 };
        }

        return { success: true, userId: decoded.userId };

    } catch (error) {
        console.error("Authentication failed within signaling API:", error);
        return { success: false, error: 'Invalid or expired token', status: 401 };
    }
}


/**
 * Handles POST requests to send a signaling message.
 */
export async function POST(req) {
  try {
    await ConnectToDB();
    const authResult = await getAuthenticatedUserId();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const senderId = authResult.userId;

    const { classId, receiverId, messageType, payload } = await req.json();

    if (!classId || !mongoose.Types.ObjectId.isValid(classId) || !receiverId || !messageType || !payload) {
      return NextResponse.json({ error: "Missing or invalid required signaling data" }, { status: 400 });
    }

    const signalingMessage = await LiveClassSignaling.create({
      classId,
      senderId,
      receiverId,
      messageType,
      payload,
    });

    return NextResponse.json(
      { message: "Signaling message sent successfully", signalingMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending signaling message:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

/**
 * Handles GET requests to poll for new signaling messages.
 */
export async function GET(req) {
  try {
    await ConnectToDB();
    const authResult = await getAuthenticatedUserId();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const receiverId = authResult.userId;

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('classId');
    
    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      return NextResponse.json({ error: "Missing or invalid classId parameter" }, { status: 400 });
    }

    // Fetch messages intended for the current user, excluding their own.
    const messages = await LiveClassSignaling.find({
        classId,
        receiverId,
        senderId: { $ne: receiverId },
    }).sort({ createdAt: 1 }).lean();

    // Delete the fetched messages to ensure they are processed only once.
    if (messages.length > 0) {
        const messageIds = messages.map(m => m._id);
        await LiveClassSignaling.deleteMany({ _id: { $in: messageIds } });
    }

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching signaling messages:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
