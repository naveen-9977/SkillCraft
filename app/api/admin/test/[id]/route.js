import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Test from "@/schema/Tests";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Users from "@/schema/Users";
import mongoose from "mongoose";

// UPDATED: This function now returns the user's role and ID for permission checks
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

    return { success: true, role: user.role, userId: decoded.userId };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

// Get a specific test
export async function GET(req, { params }) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

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
    
    // Ownership check for mentors
    if (authResult.role === 'mentor' && test.createdBy.toString() !== authResult.userId) {
        return NextResponse.json({ error: "You do not have permission to view this test's details." }, { status: 403 });
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
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    if (!params || !params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid or missing Test ID provided" }, { status: 400 });
    }

    await ConnectToDB();
    
    const testToUpdate = await Test.findById(params.id);
    if (!testToUpdate) {
        return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Ownership check for mentors
    if (authResult.role === 'mentor' && testToUpdate.createdBy.toString() !== authResult.userId) {
        return NextResponse.json({ error: "You do not have permission to edit this test." }, { status: 403 });
    }

    const testData = await req.json();
    if (!testData.batchCode) {
      return NextResponse.json({ error: "Batch code is required for tests" }, { status: 400 });
    }

    const updatedTest = await Test.findByIdAndUpdate(
      params.id,
      { ...testData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { message: "Test updated successfully", test: updatedTest },
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
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    if (!params || !params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid or missing Test ID provided" }, { status: 400 });
    }

    await ConnectToDB();

    const testToDelete = await Test.findById(params.id);
    if (!testToDelete) {
        return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Ownership check for mentors
    if (authResult.role === 'mentor' && testToDelete.createdBy.toString() !== authResult.userId) {
        return NextResponse.json({ error: "You do not have permission to delete this test." }, { status: 403 });
    }

    await Test.findByIdAndDelete(params.id);

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