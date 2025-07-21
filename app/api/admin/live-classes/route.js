import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import LiveClass from "@/schema/LiveClass";
import Users from "@/schema/Users";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

// Utility function to verify admin
async function verifyAdmin(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found', status: 401 };
    }

    let decoded;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      console.error("JWT verification failed in verifyAdmin:", error);
      if (error.name === 'TokenExpiredError') {
        return { success: false, error: 'Session expired. Please log in again.', status: 401 };
      }
      return { success: false, error: 'Invalid token', status: 401 };
    }

    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      console.error("Invalid userId format in token for admin:", decoded.userId);
      return { success: false, error: 'Invalid user ID format in token', status: 401 };
    }

    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('isAdmin');

    if (!user || !user.isAdmin) {
      return { success: false, error: 'Unauthorized access: Not an administrator', status: 403 };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Detailed Authentication Failed Error in verifyAdmin (Live Classes API):", error);
    return { success: false, error: `Authentication failed: ${error.message || 'Unknown error'}`, status: 500 };
  }
}

// Helper function to calculate class status
const calculateClassStatus = (liveClass) => {
  const now = new Date();
  const start = new Date(liveClass.startTime);
  const end = new Date(liveClass.endTime);

  if (!liveClass.isActive) {
    return 'Inactive';
  }
  if (now >= start && now <= end) {
    return 'Live Now';
  }
  if (now < start) {
    return 'Upcoming';
  }
  if (now > end) {
    return 'Ended';
  }
  return 'Unknown';
};

// POST method to create a new live class
export async function POST(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { title, description, classLink, mentor, startTime, endTime, batchCodes, isActive } = await req.json();

    if (!title || !description || !classLink || !mentor || !startTime || !endTime || !batchCodes || batchCodes.length === 0) {
      return NextResponse.json({ error: "All fields are required, and at least one batch code must be selected." }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid start or end time format." }, { status: 400 });
    }
    if (start >= end) {
      return NextResponse.json({ error: "Start time must be before end time." }, { status: 400 });
    }

    await ConnectToDB();

    const newLiveClass = await LiveClass.create({
      title,
      description,
      classLink,
      mentor,
      startTime: start,
      endTime: end,
      batchCodes,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json(
      { message: "Live class created successfully", liveClass: newLiveClass },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating live class:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create live class" },
      { status: 500 }
    );
  }
}

// GET method to fetch all live classes (admin view)
export async function GET(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await ConnectToDB();

    const { searchParams } = new URL(req.url);
    const batchCodeFilter = searchParams.get('batchCode');

    let query = {};
    if (batchCodeFilter) {
      query.batchCodes = batchCodeFilter;
    }

    const liveClasses = await LiveClass.find(query).sort({ startTime: -1 });

    // NEW: Map over liveClasses to add calculatedStatus
    const liveClassesWithStatus = liveClasses.map(cls => ({
      ...cls.toObject(),
      calculatedStatus: calculateClassStatus(cls)
    }));

    return NextResponse.json({ liveClasses: liveClassesWithStatus }, { status: 200 });
  } catch (error) {
    console.error("Error fetching live classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch live classes" },
      { status: 500 }
    );
  }
}

// PUT method to update a live class
export async function PUT(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { _id, title, description, classLink, mentor, startTime, endTime, batchCodes, isActive } = await req.json();

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return NextResponse.json({ error: "Invalid Live Class ID" }, { status: 400 });
    }
    if (!title || !description || !classLink || !mentor || !startTime || !endTime || !batchCodes || batchCodes.length === 0) {
        return NextResponse.json({ error: "All fields are required for update, and at least one batch code must be selected." }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid start or end time format." }, { status: 400 });
    }
    if (start >= end) {
      return NextResponse.json({ error: "Start time must be before end time." }, { status: 400 });
    }

    await ConnectToDB();

    const updatedLiveClass = await LiveClass.findByIdAndUpdate(
      _id,
      { title, description, classLink, mentor, startTime: start, endTime: end, batchCodes, isActive, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedLiveClass) {
      return NextResponse.json({ error: "Live class not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Live class updated successfully", liveClass: updatedLiveClass },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating live class:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update live class" },
      { status: 500 }
    );
  }
}

// DELETE method to delete a live class
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
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Live Class ID is required and must be valid" }, { status: 400 });
    }

    await ConnectToDB();

    const deletedLiveClass = await LiveClass.findByIdAndDelete(id);

    if (!deletedLiveClass) {
      return NextResponse.json({ error: "Live class not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Live class deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting live class:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete live class" },
      { status: 500 }
    );
  }
}
