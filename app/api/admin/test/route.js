import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Test from "@/schema/Tests";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Users from "@/schema/Users";
import Batch1 from "@/schema/Batch1"; // Import Batch1 schema
import Notification from "@/schema/Notification";

// UPDATED: This function now returns the full user object for more detailed checks
async function verifyAdminOrMentor(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    await ConnectToDB();
    // Fetch the user's role and their assigned batchCodes
    const user = await Users.findById(decoded.userId).select('role batchCodes');

    if (!user || (user.role !== 'admin' && user.role !== 'mentor')) {
      return { success: false, error: 'Unauthorized access' };
    }

    return { success: true, user }; // Return the full user object
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

// Create a new test
export async function POST(req) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const testData = await req.json();

    if (!testData.batchCode) {
      return NextResponse.json({ error: "Batch code is required for new tests" }, { status: 400 });
    }

    // Permission Check: A mentor can only create a test for a batch they are assigned to.
    if (authResult.user.role === 'mentor' && !authResult.user.batchCodes.includes(testData.batchCode)) {
        return NextResponse.json({ error: "You do not have permission to create a test for this batch." }, { status: 403 });
    }

    await ConnectToDB();

    const test = await Test.create({
        ...testData,
        createdBy: authResult.user._id // Set the creator of the test
    });

    if (test) {
      const usersInBatch = await Users.find({
        batchCodes: test.batchCode,
        role: 'student',
        status: 'approved',
      });

      for (const user of usersInBatch) {
        await Notification.create({
          user: user._id,
          message: `A new test "${test.title}" has been posted for your batch!`,
          link: `/dashboard/tests/${test._id}`,
          batchCode: test.batchCode,
          type: "new_test",
        });
      }
    }

    return NextResponse.json(
      { message: "Test created successfully", test },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating test:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create test" },
      { status: 500 }
    );
  }
}

// Get tests (with role-based filtering by batch)
export async function GET(req) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    await ConnectToDB();
    
    let query = {};

    // UPDATED: If the user is a mentor, show all tests from their assigned batches
    if (authResult.user.role === 'mentor') {
        if (authResult.user.batchCodes && authResult.user.batchCodes.length > 0) {
            query.batchCode = { $in: authResult.user.batchCodes };
        } else {
            // If mentor has no batches, return an empty array
            return NextResponse.json({ tests: [] }, { status: 200 });
        }
    }
    // Admins will have an empty query object, fetching all tests

    const tests = await Test.find(query).sort({ createdAt: -1 });

    // Fetch batch names
    const batchCodes = tests.map(test => test.batchCode);
    const batches = await Batch1.find({ batchCode: { $in: batchCodes } }).select('batchCode batchName').lean();
    const batchCodeToNameMap = batches.reduce((acc, batch) => {
        acc[batch.batchCode] = batch.batchName;
        return acc;
    }, {});
    
    // Add batchName to each test object
    const testsWithBatchNames = tests.map(test => ({
        ...test.toObject(),
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