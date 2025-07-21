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
    const user = await Users.findById(decoded.userId).select('-password');

    if (!user || !user.isAdmin) {
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

    const totalUsers = await Users.countDocuments({});
    const totalAdmins = await Users.countDocuments({ isAdmin: true });
    const totalStudents = totalUsers - totalAdmins;
    const pendingStudents = await Users.countDocuments({ status: 'pending', isAdmin: false });
    const approvedStudents = await Users.countDocuments({ status: 'approved', isAdmin: false });

    const totalBatches = await Batch1.countDocuments({});
    const totalTests = await Test.countDocuments({});
    const totalAssignments = await Assignment.countDocuments({});
    const totalStudyMaterials = await StudyMaterial.countDocuments({});
    const totalAnnouncements = await Announcement.countDocuments({});

    const totalSubmissions = await Submission.countDocuments({});
    const totalTestResults = await TestResult.countDocuments({});

    // You can add more specific stats if needed, e.g., submissions per assignment, average scores etc.

    return NextResponse.json(
      {
        stats: {
          totalUsers,
          totalStudents,
          totalAdmins,
          pendingStudents,
          approvedStudents,
          totalBatches,
          totalTests,
          totalAssignments,
          totalStudyMaterials,
          totalAnnouncements,
          totalSubmissions,
          totalTestResults,
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