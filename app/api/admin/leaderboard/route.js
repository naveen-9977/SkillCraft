import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import TestResult from "@/schema/TestResult"; // Assuming you have this schema
import Test from "@/schema/Tests"; // Assuming you have this schema
import Users from "@/schema/Users"; // Assuming you have this schema
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

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
    // Verify if user is admin
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    await ConnectToDB();

    const { searchParams } = new URL(req.url);
    const testId = searchParams.get('testId');

    if (testId) {
      // Fetch scores for a specific test
      if (!mongoose.Types.ObjectId.isValid(testId)) {
        return NextResponse.json({ error: "Invalid Test ID" }, { status: 400 });
      }

      const testResults = await TestResult.find({ test: testId })
        .populate('student', 'name email') // Populate student name and email
        .populate('test', 'title totalQuestions') // Populate test title and total questions
        .sort({ score: -1, submittedAt: 1 }); // Sort by score highest first, then by submission time

      return NextResponse.json({ testResults }, { status: 200 });

    } else {
      // Fetch all tests with their participant counts
      const tests = await Test.find({}).select('title description');

      const leaderboardSummary = await Promise.all(tests.map(async (test) => {
        const studentCount = await TestResult.countDocuments({ test: test._id });
        return {
          _id: test._id,
          title: test.title,
          description: test.description,
          totalStudents: studentCount,
        };
      }));

      return NextResponse.json({ leaderboardSummary }, { status: 200 });
    }

  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}