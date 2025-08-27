import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Test from "@/schema/Tests";
import Users from "@/schema/Users";
import Batch1 from "@/schema/Batch1";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Securely verifies the user is an approved student and returns their batch codes
async function verifyStudentAndGetBatchCodes(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'Not authenticated', status: 401 };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return { success: false, error: 'Invalid user token', status: 401 };
    }

    await ConnectToDB(); 

    const user = await Users.findById(decoded.userId).select('role batchCodes status'); 

    if (!user) {
      return { success: false, error: 'User not found', status: 404 };
    }

    // Security Check: Ensure user is a student, is approved, and is in a batch.
    if (user.role !== 'student' || user.status !== 'approved' || !Array.isArray(user.batchCodes) || user.batchCodes.length === 0) {
      return { success: false, error: 'Access denied. Please contact your administrator.', status: 403 };
    }

    return { success: true, userBatchCodes: user.batchCodes };
  } catch (error) {
    console.error("Authentication Error in tests API:", error);
    return { success: false, error: `Authentication failed: ${error.message || 'Unknown error'}`, status: 500 };
  }
}

// GET method to fetch tests for the student's batches
export async function GET(req) {
  try {
    const authResult = await verifyStudentAndGetBatchCodes(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await ConnectToDB();

    const studentBatchCodes = authResult.userBatchCodes;

    // Fetch only the tests where the batchCode is in the student's list of assigned batch codes
    const tests = await Test.find({ 
        batchCode: { $in: studentBatchCodes },
        isActive: true 
      })
      .sort({ createdAt: -1 })
      .select('-questions.correctOption -__v'); // Do not send correct answers to the student

    // Fetch the full batch documents to get the names
    const batches = await Batch1.find({ batchCode: { $in: studentBatchCodes } }).select('batchCode batchName').lean();
    const batchCodeToNameMap = batches.reduce((acc, batch) => {
        acc[batch.batchCode] = batch.batchName;
        return acc;
    }, {});

    // Add batchName to each test object
    const testsWithBatchNames = tests.map(test => ({
        ...test.toObject(), // Convert mongoose doc to plain object
        batchName: batchCodeToNameMap[test.batchCode] || 'Unknown Batch'
    }));

    return NextResponse.json({ tests: testsWithBatchNames }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  }
}