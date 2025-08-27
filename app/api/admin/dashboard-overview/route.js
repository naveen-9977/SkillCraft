import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Users from "@/schema/Users";
import Batch1 from "@/schema/Batch1";
import Test from "@/schema/Tests";
import Assignment from "@/schema/Assignment";
import StudyMaterial from "@/schema/StudyMaterial";
import Announcement from "@/schema/Announcement";
import Submission from "@/schema/Submission";
import TestResult from "@/schema/TestResult";
import LiveClass from "@/schema/LiveClass";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Utility function to verify admin
async function verifyAdmin(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('role');

    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Unauthorized access' };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

export async function GET(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    await ConnectToDB();

    // Correctly count all pending users (students and mentors)
    const totalPendingUsers = await Users.countDocuments({ status: 'pending', role: { $in: ['student', 'mentor'] } });
    const totalMentors = await Users.countDocuments({ role: 'mentor' });
    const approvedStudents = await Users.countDocuments({ status: 'approved', role: 'student' });
    
    const totalBatches = await Batch1.countDocuments({});
    const totalTests = await Test.countDocuments({});
    const totalAssignments = await Assignment.countDocuments({});
    const totalLiveClasses = await LiveClass.countDocuments({});

    return NextResponse.json(
      {
        stats: {
          totalMentors,
          approvedStudents,
          totalPendingUsers, // Use the corrected count
          totalBatches,
          totalTests,
          totalAssignments,
          totalLiveClasses,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dashboard overview stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard overview data" },
      { status: 500 }
    );
  }
}
