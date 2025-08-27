import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import LiveClass from "@/schema/LiveClass";
import Users from "@/schema/Users";
import Batch1 from "@/schema/Batch1"; // Import the Batch1 model
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

/**
 * Handles GET requests to fetch live classes for the authenticated user.
 * It filters classes based on the batches the user is enrolled in.
 */
export async function GET(req) {
    try {
        await ConnectToDB();

        const cookieStore = cookies();
        const token = cookieStore.get('token');

        if (!token) {
            return NextResponse.json({ success: false, message: "Authentication token not found." }, { status: 401 });
        }

        const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
        const userId = decoded.userId;

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json({ success: false, message: "Invalid user ID in token." }, { status: 401 });
        }

        const user = await Users.findById(userId).lean();
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
        }

        // FIX: Use the correct property 'batchCodes' which is an array of strings
        const userBatchCodes = user.batchCodes;

        if (!userBatchCodes || userBatchCodes.length === 0) {
            // If user has no batch codes, they have no classes. Return empty array.
            return NextResponse.json({ success: true, data: [] });
        }

        // FIX: Find the batch documents that match the user's batch codes
        const userBatches = await Batch1.find({ batchCode: { $in: userBatchCodes } }).select('_id').lean();

        // Extract the _id's from the found batch documents
        const userBatchIds = userBatches.map(batch => batch._id);
        
        // Find all live classes where the class's batch ID is in the user's list of batch IDs.
        const classes = await LiveClass.find({ batch: { $in: userBatchIds } })
            .populate([
                { path: 'mentor', model: Users, select: 'name' },
                { path: 'batch', model: Batch1, select: 'batchName' }
            ])
            .sort({ startTime: -1 }); // Show the newest classes first

        return NextResponse.json({
            success: true,
            data: classes
        });

    } catch (error) {
        console.error("Error fetching live classes:", error);
        if (error.name === 'JsonWebTokenError') {
            return NextResponse.json({ success: false, message: "Invalid token." }, { status: 401 });
        }
        return NextResponse.json({ success: false, message: "Something went wrong! Please try again later." }, { status: 500 });
    }
}