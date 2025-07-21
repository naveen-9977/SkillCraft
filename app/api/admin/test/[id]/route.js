import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Test from "@/schema/Tests";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Users from "@/schema/Users";
import mongoose from "mongoose"; // NEW: Import mongoose for ObjectId validation

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

// Get a specific test
export async function GET(req, { params }) {
  try {
    // NEW: Validate params.id
    if (!params || !params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid or missing Test ID provided" },
        { status: 400 }
      );
    }

    await ConnectToDB();

    const test = await Test.findById(params.id);

    if (!test) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ test }, { status: 200 });
  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json(
      { error: "Failed to fetch test" },
      { status: 500 }
    );
  }
}

// Update a test
export async function PUT(req, { params }) {
  try {
    // Verify if user is admin
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // NEW: Validate params.id
    if (!params || !params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid or missing Test ID provided" },
        { status: 400 }
      );
    }

    const testData = await req.json();

    // NEW: Validate batchCode if it's being updated
    if (testData.batchCode === undefined || testData.batchCode === null || testData.batchCode === '') {
      return NextResponse.json({ error: "Batch code is required for tests" }, { status: 400 });
    }


    await ConnectToDB();

    const test = await Test.findByIdAndUpdate(
      params.id,
      {
        ...testData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!test) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Test updated successfully", test },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating test:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update test" },
      { status: 500 }
    );
  }
}

// Delete a test
export async function DELETE(req, { params }) {
  try {
    // Verify if user is admin
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // NEW: Validate params.id
    if (!params || !params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid or missing Test ID provided" },
        { status: 400 }
      );
    }

    await ConnectToDB();

    const test = await Test.findByIdAndDelete(params.id);

    if (!test) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Test deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting test:", error);
    return NextResponse.json(
      { error: "Failed to delete test" },
      { status: 500 }
    );
  }
}
