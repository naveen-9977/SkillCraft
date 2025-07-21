import ConnectToDB from "@/DB/ConnectToDB";
import { NextResponse } from "next/server";
import Batch1 from "@/schema/Batch1";
import Users from "@/schema/Users";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Utility function to verify user and get their details (including batchCodes and status)
async function verifyUser(req) {
  try {
    const cookieStore = cookies();
    
    // Add a defensive check for cookieStore being undefined
    if (!cookieStore) {
      console.error("cookieStore is undefined. Cannot access cookies.");
      return { success: false, error: 'Authentication failed: Cookie store not available.', status: 500 };
    }

    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found', status: 401 };
    }

    let decoded;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return { success: false, error: 'Invalid token', status: 401 };
    }

    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      console.error("Invalid userId format in token:", decoded.userId);
      return { success: false, error: 'Invalid user ID format in token', status: 401 };
    }

    await ConnectToDB(); 

    // Select batchCodes (plural)
    const user = await Users.findById(decoded.userId).select('batchCodes status'); 

    if (!user) {
      return { success: false, error: 'User not found', status: 404 };
    }

    // Check if user is approved and has at least one batch code
    if (user.status !== 'approved' || !Array.isArray(user.batchCodes) || user.batchCodes.length === 0) {
      return { success: false, error: 'User not approved or not assigned to any batch. Please contact your administrator.', status: 403 };
    }

    // Return batchCodes array
    return { success: true, userBatchCodes: user.batchCodes };
  } catch (error) {
    console.error("Detailed Authentication Failed Error in verifyUser (batch1 API):", error);
    return { success: false, error: `Authentication failed: ${error.message || 'Unknown error'}`, status: 500 };
  }
}

export async function GET(req) {
  try {
    const authResult = await verifyUser(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await ConnectToDB();

    const studentBatchCodes = authResult.userBatchCodes; // Get array of batch codes

    // Find ALL batches that match ANY of the student's batch codes
    const studentBatches = await Batch1.find({ batchCode: { $in: studentBatchCodes } });

    if (studentBatches.length === 0) {
      return NextResponse.json(
        { error: `No batch information found for your assigned batches. Please contact your administrator.` },
        { status: 404 }
      );
    }

    // Return an array of batch objects
    return NextResponse.json({ data: studentBatches }, { status: 200 });
  } catch (err) {
    console.error("Error in batch1 GET (student access):", err);
    return NextResponse.json(
      { message: "Something went wrong fetching batch data" },
      { status: 500 }
    );
  }
}
