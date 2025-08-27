import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Users from "@/schema/Users";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

/**
 * Verifies that the logged-in user is a mentor and is authorized to access the requested batch.
 * @param {Request} req - The incoming request object.
 * @param {string} batchCode - The batch code to check authorization for.
 * @returns {object} An object indicating success or an error message.
 */
async function verifyMentorAndBatchAccess(req, batchCode) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found', status: 401 };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
        return { success: false, error: 'Invalid token', status: 401 };
    }

    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('role batchCodes');

    if (!user || user.role !== 'mentor') {
      return { success: false, error: 'Unauthorized access: Mentor role required.', status: 403 };
    }

    // Security Check: Ensure the mentor is assigned to the batch they are trying to access.
    if (!user.batchCodes.includes(batchCode)) {
        return { success: false, error: 'You are not authorized to view students in this batch.', status: 403 };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Authentication failed', status: 500 };
  }
}

/**
 * Handles GET requests to fetch the list of students in a specific batch using a dynamic route.
 */
export async function GET(req, { params }) {
  try {
    const { batchCode } = params;

    if (!batchCode) {
      return NextResponse.json({ error: "Batch code is required." }, { status: 400 });
    }

    const authResult = await verifyMentorAndBatchAccess(req, batchCode);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await ConnectToDB();

    // Fetch all approved students assigned to the specified batch code.
    const students = await Users.find({
      role: 'student',
      status: 'approved',
      batchCodes: batchCode
    }).select('name email createdAt'); // Select only the necessary fields

    return NextResponse.json({ students }, { status: 200 });

  } catch (error) {
    console.error("Error fetching students by batch:", error);
    return NextResponse.json(
      { error: "Failed to fetch student data" },
      { status: 500 }
    );
  }
}