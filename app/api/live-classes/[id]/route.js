import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import LiveClass from "@/schema/LiveClass";
import Users from "@/schema/Users";
import Mentor from "@/schema/Mentor";
import Batch1 from "@/schema/Batch1";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

/**
 * Authenticates the user by verifying the JWT token from cookies.
 */
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
        // Select all necessary fields including role and batchCodes
        const user = await Users.findById(decoded.userId).select('name email role batchCodes status').lean();
        if (!user) {
            return { success: false, error: 'User not found', status: 404 };
        }
        return { success: true, user };
    } catch (error) {
        console.error("Authentication failed within API route:", error);
        return { success: false, error: `Authentication failed: ${error.message}`, status: 500 };
    }
}

/**
 * Handles GET requests to fetch details for a single live class.
 */
export async function GET(req, context) {
    const { id } = context.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, message: "Invalid class ID." }, { status: 400 });
    }

    try {
        await ConnectToDB();

        const authResult = await getAuthenticatedUser();
        if (!authResult.success) {
            return NextResponse.json({ success: false, message: authResult.error }, { status: authResult.status });
        }
        const currentUser = authResult.user;

        const liveClass = await LiveClass.findById(id)
            .populate([
                { path: 'mentor', model: Mentor, select: 'name' },
                { path: 'batch', model: Batch1, select: 'batchName batchCode' } 
            ])
            .lean();

        if (!liveClass) {
            return NextResponse.json({ success: false, message: "Live class not found." }, { status: 404 });
        }
        
        // --- CORRECTED AUTHORIZATION LOGIC ---
        // An admin or mentor should be able to join any class.
        // A student must be part of the specific batch.
        const isUserInBatch = currentUser.batchCodes?.includes(liveClass.batch?.batchCode);

        if (currentUser.role === 'student' && !isUserInBatch) {
             return NextResponse.json({ success: false, message: "You are not authorized to join this class." }, { status: 403 });
        }
        // --- END OF CORRECTION ---

        // Fetch all users who are in the same batch to serve as the participant list.
        const participants = await Users.find({ batchCodes: liveClass.batch?.batchCode }).select('name email _id').lean();

        return NextResponse.json({
            success: true,
            data: {
                classDetails: liveClass,
                participants,
            }
        });

    } catch (error) {
        console.error(`Error fetching live class ${id}:`, error);
        return NextResponse.json({ success: false, message: "Something went wrong! Please try again later." }, { status: 500 });
    }
}
