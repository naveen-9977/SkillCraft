import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import TestResult from "@/schema/TestResult";
import Test from "@/schema/Tests";
import Users from "@/schema/Users";
import Batch1 from "@/schema/Batch1";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

// This function will verify the user and get their assigned batch codes if they are a mentor
async function verifyAdminOrMentor(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('role batchCodes');

    if (!user || (user.role !== 'admin' && user.role !== 'mentor')) {
      return { success: false, error: 'Unauthorized access' };
    }

    return { success: true, user: { _id: decoded.userId, role: user.role, batchCodes: user.batchCodes } };
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
    const batchCode = searchParams.get('batchCode');

    if (testId) {
      // SCENARIO 3: Return leaderboard for a specific test
      if (!mongoose.Types.ObjectId.isValid(testId)) {
        return NextResponse.json({ error: "Invalid Test ID" }, { status: 400 });
      }
      
      const test = await Test.findById(testId);
      if (!test) {
          return NextResponse.json({ error: "Test not found" }, { status: 404 });
      }

      if (authResult.user.role === 'mentor' && !authResult.user.batchCodes.includes(test.batchCode)) {
          return NextResponse.json({ error: "You do not have permission to view this leaderboard." }, { status: 403 });
      }

      const testResults = await TestResult.find({ test: testId })
        .populate('student', 'name email')
        .populate('test', 'title totalQuestions')
        .sort({ score: -1, submittedAt: 1 });

      return NextResponse.json({ testResults }, { status: 200 });

    } else if (batchCode) {
        // SCENARIO 2: Return tests for a specific batch
        if (authResult.user.role === 'mentor' && !authResult.user.batchCodes.includes(batchCode)) {
            return NextResponse.json({ error: "You are not authorized to view tests for this batch." }, { status: 403 });
        }

        const tests = await Test.find({ batchCode: batchCode }).select('title description');

        const testSummary = await Promise.all(tests.map(async (test) => {
            const studentCount = await TestResult.countDocuments({ test: test._id });
            return {
              _id: test._id,
              title: test.title,
              description: test.description,
              totalStudents: studentCount,
            };
        }));
        return NextResponse.json({ testSummary }, { status: 200 });

    } else {
      // SCENARIO 1: Return list of batches
      let query = {};
      
      if (authResult.user.role === 'mentor') {
          if (authResult.user.batchCodes && authResult.user.batchCodes.length > 0) {
              query.batchCode = { $in: authResult.user.batchCodes };
          } else {
              return NextResponse.json({ batches: [] }, { status: 200 });
          }
      }

      const batches = await Batch1.find(query).select('batchName batchCode');
      // **IMPORTANT**: This now returns a `batches` property
      return NextResponse.json({ batches }, { status: 200 });
    }

  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard data" },
      { status: 500 }
    );
  }
}