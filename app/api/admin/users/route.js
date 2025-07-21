// app/api/admin/users/route.js
import { NextResponse } from "next/server";
import dbConnect from '@/lib/dbConnect';
import User from '@/schema/Users'; // Corrected import path and model name
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// Helper function to verify admin
async function verifyAdmin(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found', status: 401 };
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key-fallback');
    
    await dbConnect(); 
    const user = await User.findById(decoded.userId).select('-password');

    if (!user || !user.isAdmin) {
      return { success: false, error: 'Unauthorized access', status: 403 };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Error in verifyAdmin:", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return { success: false, error: 'Invalid token', status: 401 };
    }
    return { success: false, error: 'Authentication failed', status: 500 };
  }
}

// GET method to fetch all users (for admin)
export async function GET(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await dbConnect(); 

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const batchCodeFilter = searchParams.get('batchCode'); // This filter might become less relevant with multiple batch codes

    let query = {};
    query.isAdmin = false; 

    if (statusFilter) {
      query.status = statusFilter;
    }
    // If you want to search users who are in a specific batch, you'd use $in
    // if (batchCodeFilter) {
    //   query.batchCodes = batchCodeFilter; // This would match if batchCodeFilter is an exact array
    //   query.batchCodes = { $in: [batchCodeFilter] }; // To check if user is in *any* of the batches
    // }

    // Fetch users, exclude password, and sort by creation date descending
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PUT method to update user status and assign batchCodes (for admin)
export async function PUT(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { userId, status, batchCodes } = await req.json(); // NEW: Expect batchCodes array

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

    // NEW: Logic for batchCodes array
    if (status === 'approved') {
      if (!Array.isArray(batchCodes) || batchCodes.length === 0) {
        return NextResponse.json({ error: "At least one Batch Code is required for approved users" }, { status: 400 });
      }
      updateData.batchCodes = batchCodes; // Save the array
    } else if (status && status !== 'approved') {
      // If status is explicitly changed to pending/rejected, clear batchCodes
      updateData.batchCodes = []; // Set to empty array
    } else if (batchCodes !== undefined) {
      // If only batchCodes is provided (status not changed), allow setting/clearing it
      // Ensure it's an array, even if empty
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

// DELETE method to delete a user (for admin)
export async function DELETE(req) {
  try {
    const authResult = await verifyAdmin(req);
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
