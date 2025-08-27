import ConnectToDB from "@/DB/ConnectToDB";
import { NextResponse } from "next/server";
import Batch1 from "@/schema/Batch1";
import Users from "@/schema/Users";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Utility function to securely verify the user and get their batch codes
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
    } catch (jwtError) {
      return { success: false, error: 'Invalid token', status: 401 };
    }

    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return { success: false, error: 'Invalid user ID in token', status: 401 };
    }

    await ConnectToDB(); 

    const user = await Users.findById(decoded.userId).select('batchCodes status'); 

    if (!user) {
      return { success: false, error: 'User not found', status: 404 };
    }

    if (user.status !== 'approved' || !Array.isArray(user.batchCodes) || user.batchCodes.length === 0) {
      return { success: false, error: 'User not approved or not assigned to any batch.', status: 403 };
    }

    return { success: true, userBatchCodes: user.batchCodes };
  } catch (error) {
    console.error("Authentication Error in batch1 API:", error);
    return { success: false, error: `Authentication failed: ${error.message || 'Unknown error'}`, status: 500 };
  }
}

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

    // Find all batch documents that match the student's assigned batch codes
    const studentBatches = await Batch1.find({ batchCode: { $in: studentBatchCodes } });

    if (studentBatches.length === 0) {
      // This is not an error, but the user may not be assigned to any existing batches.
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    return NextResponse.json({ data: studentBatches }, { status: 200 });
  } catch (err) {
    console.error("Error in batch1 GET route:", err);
    return NextResponse.json(
      { message: "Something went wrong fetching batch data" },
      { status: 500 }
    );
  }
}