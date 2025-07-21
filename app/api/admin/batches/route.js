import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Batch1 from "@/schema/Batch1"; // Using the Batch1 schema
import Users from "@/schema/Users"; // For admin verification
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose"; // For ObjectId validation

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

// POST method to create a new batch
export async function POST(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const { batchName, batchCreatedAt, batchCode, subjects } = await req.json();

    if (!batchName || !batchCreatedAt || !batchCode || !subjects) {
      return NextResponse.json({ error: "All batch fields are required" }, { status: 400 });
    }

    await ConnectToDB();

    // Check if batchCode already exists
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

// GET method to fetch all batches
export async function GET(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    await ConnectToDB();

    const batches = await Batch1.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ batches }, { status: 200 });
  } catch (error) {
    console.error("Error fetching batches:", error);
    return NextResponse.json(
      { error: "Failed to fetch batches" },
      { status: 500 }
    );
  }
}

// PUT method to update a batch
export async function PUT(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const { _id, batchName, batchCreatedAt, batchCode, subjects } = await req.json();

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return NextResponse.json({ error: "Invalid Batch ID" }, { status: 400 });
    }
    if (!batchName || !batchCreatedAt || !batchCode || !subjects) {
        return NextResponse.json({ error: "All batch fields are required for update" }, { status: 400 });
    }

    await ConnectToDB();

    // Check if the new batchCode conflicts with another existing batch
    const existingBatchWithCode = await Batch1.findOne({ batchCode, _id: { $ne: _id } });
    if (existingBatchWithCode) {
        return NextResponse.json({ error: "Batch code already exists for another batch. Please use a unique code." }, { status: 409 });
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

// DELETE method to delete a batch
export async function DELETE(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
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