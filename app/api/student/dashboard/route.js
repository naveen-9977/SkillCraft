import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Users from "@/schema/Users";
import Batch1 from "@/schema/Batch1";
import Test from "@/schema/Tests";
import Assignment from "@/schema/Assignment";
import LiveClass from "@/schema/LiveClass";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

/**
 * Verifies that the logged-in user is an approved student.
 * @param {Request} req - The incoming request object.
 * @returns {object} An object indicating success and containing user data or an error message.
 */
async function verifyStudent(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('role batchCodes status');

    if (!user || user.role !== 'student' || user.status !== 'approved') {
      return { success: false, error: 'Unauthorized access.' };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

/**
 * Handles GET requests to fetch dashboard statistics for a student.
 */
export async function GET(req) {
  try {
    const authResult = await verifyStudent(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const student = authResult.user;
    const studentBatchCodes = student.batchCodes;

    await ConnectToDB();

    // If student has no batches, return zero counts
    if (!studentBatchCodes || studentBatchCodes.length === 0) {
        return NextResponse.json({
            overviewStats: {
                assignments: 0,
                tests: 0,
                liveClasses: 0,
            }
        }, { status: 200 });
    }

    // Fetch overview stats (content related to student's assigned batches)
    const totalAssignments = await Assignment.countDocuments({ batchCode: { $in: studentBatchCodes } });
    const totalTests = await Test.countDocuments({ batchCode: { $in: studentBatchCodes } });

    // For Live Classes, we need to find the batch ObjectIds first
    const studentBatches = await Batch1.find({ batchCode: { $in: studentBatchCodes } }).select('_id').lean();
    const batchObjectIds = studentBatches.map(b => b._id);
    const totalLiveClasses = await LiveClass.countDocuments({ batch: { $in: batchObjectIds } });

    const overviewStats = {
      assignments: totalAssignments,
      tests: totalTests,
      liveClasses: totalLiveClasses,
    };

    return NextResponse.json({ overviewStats }, { status: 200 });

  } catch (error) {
    console.error("Error fetching student dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
