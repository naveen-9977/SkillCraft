import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Users from "@/schema/Users";

// Helper function to get authenticated user from JWT token
async function getAuthenticatedUser() {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return { success: false, error: 'Authentication token not found', status: 401 };
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');

        if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
            return { success: false, error: 'Invalid user ID in token', status: 401 };
        }
        
        const user = await Users.findById(decoded.userId).lean();
        if (!user) {
            return { success: false, error: 'User not found', status: 404 };
        }

        return { success: true, user };

    } catch (error) {
        return { success: false, error: 'Invalid or expired token', status: 401 };
    }
}


export async function GET(req) {
  try {
    const authResult = await getAuthenticatedUser();
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
    const user = authResult.user;
    const { searchParams } = new URL(req.url);
    const room = searchParams.get('room');

    if (!room) {
      return NextResponse.json({ error: "Missing 'room' query parameter" }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.LIVEKIT_WS_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ error: "Server configuration error: LiveKit credentials not set" }, { status: 500 });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: user._id.toString(),
      name: user.name,
    });

    at.addGrant({ 
        room, 
        roomJoin: true, 
        canPublish: true, 
        canSubscribe: true 
    });

    const token = at.toJwt();

    return NextResponse.json({ token: token });

  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}