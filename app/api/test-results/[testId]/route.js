import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import TestResult from "@/schema/TestResult";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// GET a specific test result for the logged-in user
export async function GET(req, { params }) { // The 'params' object is correctly passed here by Next.js
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // CORRECTED: Access the testId directly from the params object
    const { testId } = params;
    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return NextResponse.json({ error: "Invalid Test ID provided" }, { status: 400 });
    }
    
    await ConnectToDB();
    const studentId = decoded.userId;

    const testResult = await TestResult.findOne({ student: studentId, test: testId })
      .populate({
          path: 'test',
          select: 'title description questions'
      })
      .sort({ submittedAt: -1 });

    if (!testResult) {
        return NextResponse.json({ error: "Test result not found for this user." }, { status: 404 });
    }

    return NextResponse.json({ testResult }, { status: 200 });
  } catch (error) {
    console.error("Error fetching specific test result:", error);
    return NextResponse.json(
      { error: "Failed to fetch test result" },
      { status: 500 }
    );
  }
}