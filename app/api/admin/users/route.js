import { NextResponse } from "next/server";
import dbConnect from '@/lib/dbConnect';
import User from '@/schema/Users';
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// UPDATED: Helper function to verify admin or mentor
async function verifyAdminOrMentor(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found', status: 401 };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key-fallback');
    
    await dbConnect(); 
    const user = await User.findById(decoded.userId).select('role');

    // UPDATED: Check for 'admin' or 'mentor' role
    if (!user || (user.role !== 'admin' && user.role !== 'mentor')) {
      return { success: false, error: 'Unauthorized access', status: 403 };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Error in verifyAdminOrMentor:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return { success: false, error: 'Invalid token', status: 401 };
    }
    return { success: false, error: 'Authentication failed', status: 500 };
  }
}

// GET method to fetch all users (for admin/mentor)
export async function GET(req) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await dbConnect(); 

    // UPDATED: Query to exclude admins
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PUT method to update user status and assign batchCodes (for admin/mentor)
export async function PUT(req) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { userId, status, batchCodes } = await req.json();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
    }

    await dbConnect();

    const updateData = {};
    const validStatuses = ['pending', 'approved', 'rejected'];

    if (status) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
      }
      updateData.status = status;
    }

    if (status === 'approved') {
      if (!Array.isArray(batchCodes) || batchCodes.length === 0) {
        return NextResponse.json({ error: "At least one Batch Code is required for approved users" }, { status: 400 });
      }
      updateData.batchCodes = batchCodes;
    } else if (status && status !== 'approved') {
      updateData.batchCodes = [];
    } else if (batchCodes !== undefined) {
      updateData.batchCodes = Array.isArray(batchCodes) ? batchCodes : [];
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE method to delete a user (for admin/mentor)
export async function DELETE(req) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "User ID is required and must be valid" }, { status: 400 });
    }

    await dbConnect();

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}