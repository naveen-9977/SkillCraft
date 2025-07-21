// app/api/admin/test/route.js
import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Test from "@/schema/Tests";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Users from "@/schema/Users";
import Notification from "@/schema/Notification"; // NEW: Import Notification schema

// Verify admin authentication
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

// Create a new test
export async function POST(req) {
  try {
    // Verify if user is admin
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const testData = await req.json();

    // NEW: Validate batchCode for new test creation
    if (!testData.batchCode) {
      return NextResponse.json({ error: "Batch code is required for new tests" }, { status: 400 });
    }

    // Connect to database
    await ConnectToDB();

    // Create new test (Mongoose will handle the deadline field if it's present in testData)
    const test = await Test.create(testData);

    // NEW: Create notifications for all users in the specified batch
    if (test) {
      const usersInBatch = await Users.find({
        batchCodes: test.batchCode,
        isAdmin: false, // Only notify regular users
        status: 'approved', // Only notify approved users
      });

      for (const user of usersInBatch) {
        await Notification.create({
          user: user._id,
          message: `A new test "${test.title}" has been posted for your batch!`,
          link: `/dashboard/tests/${test._id}`, // Link to the specific test page
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

// Get all tests (Admin view)
export async function GET(req) {
  try {
    // Verify if user is admin (added for consistency, though it was missing in the original GET)
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // Connect to database
    await ConnectToDB();

    // Get all tests, sorted by creation date, including the deadline
    const tests = await Test.find({})
      .sort({ createdAt: -1 });
      // .select('-questions.correctOption'); // Removed this line to show correctOption for admin view as per existing logic

    return NextResponse.json({ tests }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  }
}