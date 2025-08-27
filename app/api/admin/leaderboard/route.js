import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import TestResult from "@/schema/TestResult";
import Test from "@/schema/Tests";
import Users from "@/schema/Users";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

// UPDATED: This function now returns the full user object for permission checks
async function verifyAdminOrMentor(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('role');

    if (!user || (user.role !== 'admin' && user.role !== 'mentor')) {
      return { success: false, error: 'Unauthorized access' };
    }

    // Return the user's role and ID for more granular checks
    return { success: true, user: { _id: decoded.userId, role: user.role } };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

export async function GET(req) {
  try {
    const authResult = await verifyAdminOrMentor(req);
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
      // Logic for fetching scores for a specific test
      if (!mongoose.Types.ObjectId.isValid(testId)) {
        return NextResponse.json({ error: "Invalid Test ID" }, { status: 400 });
      }
      
      const test = await Test.findById(testId);
      if (!test) {
          return NextResponse.json({ error: "Test not found" }, { status: 404 });
      }

      // Permission Check: Mentors can only view leaderboards for tests they created
      if (authResult.user.role === 'mentor' && test.createdBy.toString() !== authResult.user._id) {
          return NextResponse.json({ error: "You do not have permission to view this leaderboard." }, { status: 403 });
      }

      const testResults = await TestResult.find({ test: testId })
        .populate('student', 'name email')
        .populate('test', 'title totalQuestions')
        .sort({ score: -1, submittedAt: 1 });

      return NextResponse.json({ testResults }, { status: 200 });

    } else {
      // Logic for fetching the list of all available leaderboards (tests)
      let query = {};
      
      // If the user is a mentor, only show tests created by them
      if (authResult.user.role === 'mentor') {
          query.createdBy = authResult.user._id;
      }

      const tests = await Test.find(query).select('title description');

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