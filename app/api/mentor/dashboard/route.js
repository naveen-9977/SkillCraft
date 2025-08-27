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
 * Verifies that the logged-in user has the 'mentor' role.
 * @param {Request} req - The incoming request object.
 * @returns {object} An object indicating success and containing user data or an error message.
 */
async function verifyMentor(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('role batchCodes');

    if (!user || user.role !== 'mentor') {
      return { success: false, error: 'Unauthorized access: Mentor role required.' };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

/**
 * Handles GET requests to fetch dashboard statistics for a mentor.
 * It returns batch stats and an overview of content within the mentor's assigned batches.
 */
export async function GET(req) {
  try {
    const authResult = await verifyMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const mentor = authResult.user;
    const mentorBatchCodes = mentor.batchCodes;

    await ConnectToDB();

    // Fetch batch stats (student count per batch)
    let batchStats = [];
    if (mentorBatchCodes && mentorBatchCodes.length > 0) {
      const batches = await Batch1.find({ batchCode: { $in: mentorBatchCodes } }).lean();
      batchStats = await Promise.all(
        batches.map(async (batch) => {
          const studentCount = await Users.countDocuments({
            role: 'student',
            status: 'approved',
            batchCodes: batch.batchCode
          });
          return { ...batch, studentCount };
        })
      );
    }

    // Fetch overview stats (content related to mentor's assigned batches)
    const totalAssignments = await Assignment.countDocuments({ batchCode: { $in: mentorBatchCodes } });
    const totalTests = await Test.countDocuments({ batchCode: { $in: mentorBatchCodes } });

    // For Live Classes, we need to use the batch ObjectIds
    const mentorBatches = await Batch1.find({ batchCode: { $in: mentorBatchCodes } }).select('_id').lean();
    const batchObjectIds = mentorBatches.map(b => b._id);
    const totalLiveClasses = await LiveClass.countDocuments({ batch: { $in: batchObjectIds } });


    const overviewStats = {
      assignments: totalAssignments,
      tests: totalTests,
      liveClasses: totalLiveClasses,
    };

    return NextResponse.json({ batchStats, overviewStats }, { status: 200 });

  } catch (error) {
    console.error("Error fetching mentor dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}