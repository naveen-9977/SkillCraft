// app/api/admin/announcements/route.js
import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Announcement from "@/schema/Announcement";
import Users from "@/schema/Users";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import Notification from "@/schema/Notification"; // NEW: Import Notification schema

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

// POST method to create a new announcement
export async function POST(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const { title, mentor, message, batchCode } = await req.json();

    if (!title || !mentor || !message || !batchCode) {
      return NextResponse.json({ error: "All fields including batch code are required" }, { status: 400 });
    }

    await ConnectToDB();

    const newAnnouncement = await Announcement.create({
      title,
      mentor,
      message,
      batchCode,
    });

    // NEW: Create notifications for all users in the specified batch
    if (newAnnouncement) {
      const usersInBatch = await Users.find({
        batchCodes: newAnnouncement.batchCode,
        isAdmin: false,
        status: 'approved',
      });

      for (const user of usersInBatch) {
        await Notification.create({
          user: user._id,
          message: `New announcement: "${newAnnouncement.title}"`,
          link: "/dashboard/announcements", // Link to the announcements page
          batchCode: newAnnouncement.batchCode,
          type: "new_announcement",
        });
      }
    }

    return NextResponse.json(
      { message: "Announcement created successfully", announcement: newAnnouncement },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create announcement" },
      { status: 500 }
    );
  }
}

// GET method to fetch all announcements (admin view)
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

    const { searchParams } = new URL(req.url);
    const batchCodeFilter = searchParams.get('batchCode');

    let query = {};
    if (batchCodeFilter) {
      query.batchCode = batchCodeFilter;
    }

    const announcements = await Announcement.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ announcements }, { status: 200 });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

// PUT method to update an announcement
export async function PUT(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const { _id, title, mentor, message, batchCode } = await req.json();

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return NextResponse.json({ error: "Invalid announcement ID" }, { status: 400 });
    }
    if (!title || !mentor || !message || !batchCode) {
        return NextResponse.json({ error: "All fields including batch code are required for update" }, { status: 400 });
    }

    await ConnectToDB();

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      _id,
      { title, mentor, message, batchCode, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedAnnouncement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Announcement updated successfully", announcement: updatedAnnouncement },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update announcement" },
      { status: 500 }
    );
  }
}

// DELETE method to delete an announcement
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
      return NextResponse.json({ error: "Announcement ID is required and must be valid" }, { status: 400 });
    }

    await ConnectToDB();

    const deletedAnnouncement = await Announcement.findByIdAndDelete(id);

    if (!deletedAnnouncement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Announcement deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete announcement" },
      { status: 500 }
    );
  }
}