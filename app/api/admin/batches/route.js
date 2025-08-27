import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Batch1 from "@/schema/Batch1";
import Users from "@/schema/Users";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

// New, stricter function to verify ADMIN ONLY
async function verifyAdmin(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found' };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('role');

    if (!user || user.role !== 'admin') { // Check for 'admin' role specifically
      return { success: false, error: 'Unauthorized access: Administrator role required.' };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

// Existing function to allow both admins and mentors (for viewing)
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

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

// POST method to create a new batch (ADMIN ONLY)
export async function POST(req) {
  try {
    const authResult = await verifyAdmin(req); // USE STRICT VERIFICATION
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const { batchName, batchCreatedAt, batchCode, subjects } = await req.json();

    if (!batchName || !batchCreatedAt || !batchCode || !subjects) {
      return NextResponse.json({ error: "All batch fields are required" }, { status: 400 });
    }

    await ConnectToDB();

    const existingBatch = await Batch1.findOne({ batchCode });
    if (existingBatch) {
      return NextResponse.json({ error: "Batch code already exists. Please use a unique code." }, { status: 409 });
    }

    const newBatch = await Batch1.create({
      batchName,
      batchCreatedAt,
      batchCode,
      subjects,
    });

    return NextResponse.json(
      { message: "Batch created successfully", batch: newBatch },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating batch:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create batch" },
      { status: 500 }
    );
  }
}

// GET method to fetch batches (Admins see all, Mentors see their assigned batches)
export async function GET(req) {
  try {
    const authResult = await verifyAdminOrMentor(req); // Allow mentors to view
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    await ConnectToDB();

    let query = {};

    if (authResult.user.role === 'mentor') {
      if (authResult.user.batchCodes && authResult.user.batchCodes.length > 0) {
        query.batchCode = { $in: authResult.user.batchCodes };
      } else {
        return NextResponse.json({ batches: [] }, { status: 200 });
      }
    }

    const batches = await Batch1.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ batches }, { status: 200 });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json(
      { error: "Failed to fetch batches" },
      { status: 500 }
    );
  }
}

// PUT method to update a batch (ADMIN ONLY)
export async function PUT(req) {
  try {
    const authResult = await verifyAdmin(req); // USE STRICT VERIFICATION
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const { _id, batchName, batchCreatedAt, batchCode, subjects } = await req.json();

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return NextResponse.json({ error: "Invalid Batch ID" }, { status: 400 });
    }
    if (!batchName || !batchCreatedAt || !batchCode || !subjects) {
        return NextResponse.json({ error: "All batch fields are required for update" }, { status: 400 });
    }

    await ConnectToDB();

    const existingBatchWithCode = await Batch1.findOne({ batchCode, _id: { $ne: _id } });
    if (existingBatchWithCode) {
        return NextResponse.json({ error: "Batch code already exists for another batch." }, { status: 409 });
    }

    const updatedBatch = await Batch1.findByIdAndUpdate(
      _id,
      { batchName, batchCreatedAt, batchCode, subjects, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedBatch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Batch updated successfully", batch: updatedBatch },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating batch:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update batch" },
      { status: 500 }
    );
  }
}

// DELETE method to delete a batch (ADMIN ONLY)
export async function DELETE(req) {
  try {
    const authResult = await verifyAdmin(req); // USE STRICT VERIFICATION
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Batch ID is required and must be valid" }, { status: 400 });
    }

    await ConnectToDB();

    const deletedBatch = await Batch1.findByIdAndDelete(id);

    if (!deletedBatch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Batch deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting batch:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete batch" },
      { status: 500 }
    );
  }
}