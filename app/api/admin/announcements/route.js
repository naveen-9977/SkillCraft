import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Announcement from "@/schema/Announcement";
import Users from "@/schema/Users";
import Batch1 from "@/schema/Batch1"; // Import Batch1 schema
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import Notification from "@/schema/Notification";

// UPDATED: This function now returns the full user object for detailed checks
async function verifyAdminOrMentor(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (!token) return { success: false, error: 'No token found' };
    
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

// POST method to create a new announcement
export async function POST(req) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) return NextResponse.json({ error: authResult.error }, { status: 401 });

    const { title, mentor, message, batchCode } = await req.json();
    if (!title || !mentor || !message || !batchCode) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (authResult.user.role === 'mentor' && !authResult.user.batchCodes.includes(batchCode)) {
        return NextResponse.json({ error: "You do not have permission to create an announcement for this batch." }, { status: 403 });
    }

    await ConnectToDB();
    const newAnnouncement = await Announcement.create({ 
        title, 
        mentor, 
        message, 
        batchCode,
        createdBy: authResult.user._id
    });

    if (newAnnouncement) {
      const usersInBatch = await Users.find({ batchCodes: newAnnouncement.batchCode, role: 'student', status: 'approved' });
      for (const user of usersInBatch) {
        await Notification.create({
          user: user._id,
          message: `New announcement: "${newAnnouncement.title}"`,
          link: "/dashboard/announcements",
          batchCode: newAnnouncement.batchCode,
          type: "new_announcement",
        });
      }
    }

    return NextResponse.json({ message: "Announcement created successfully", announcement: newAnnouncement }, { status: 201 });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

// GET method to fetch announcements based on role and batches
export async function GET(req) {
    try {
      const authResult = await verifyAdminOrMentor(req);
      if (!authResult.success) return NextResponse.json({ error: authResult.error }, { status: 401 });
  
      await ConnectToDB();

      let query = {};
      // UPDATED: If the user is a mentor, fetch all announcements from their assigned batches
      if (authResult.user.role === 'mentor') {
          if (authResult.user.batchCodes && authResult.user.batchCodes.length > 0) {
              query.batchCode = { $in: authResult.user.batchCodes };
          } else {
              return NextResponse.json({ announcements: [] }, { status: 200 });
          }
      }
      
      const announcements = await Announcement.find(query).sort({ createdAt: -1 });

      // Fetch batch names
      const batchCodes = announcements.map(announcement => announcement.batchCode);
      const batches = await Batch1.find({ batchCode: { $in: batchCodes } }).select('batchCode batchName').lean();
      const batchCodeToNameMap = batches.reduce((acc, batch) => {
          acc[batch.batchCode] = batch.batchName;
          return acc;
      }, {});

      // Add batchName to each announcement object
      const announcementsWithBatchNames = announcements.map(announcement => ({
          ...announcement.toObject(),
          batchName: batchCodeToNameMap[announcement.batchCode] || 'Unknown Batch'
      }));

      return NextResponse.json({ announcements: announcementsWithBatchNames }, { status: 200 });
    } catch (error) {
      console.error("Error fetching announcements:", error);
      return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
    }
}
  
// PUT method to update an announcement
export async function PUT(req) {
    try {
      const authResult = await verifyAdminOrMentor(req);
      if (!authResult.success) return NextResponse.json({ error: authResult.error }, { status: 401 });
  
      const { _id, title, mentor, message, batchCode } = await req.json();
      if (!_id || !title || !mentor || !message || !batchCode) {
        return NextResponse.json({ error: "All fields are required for update" }, { status: 400 });
      }
  
      await ConnectToDB();

      const announcementToUpdate = await Announcement.findById(_id);
      if (!announcementToUpdate) {
        return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
      }

      if (authResult.user.role === 'mentor' && announcementToUpdate.createdBy.toString() !== authResult.user._id.toString()) {
        return NextResponse.json({ error: "You do not have permission to edit this announcement." }, { status: 403 });
      }

      const updatedAnnouncement = await Announcement.findByIdAndUpdate(_id, { title, mentor, message, batchCode }, { new: true });
  
      return NextResponse.json({ message: "Announcement updated successfully", announcement: updatedAnnouncement }, { status: 200 });
    } catch (error) {
      console.error("Error updating announcement:", error);
      return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
    }
}
  
// DELETE method to delete an announcement
export async function DELETE(req) {
    try {
      const authResult = await verifyAdminOrMentor(req);
      if (!authResult.success) return NextResponse.json({ error: authResult.error }, { status: 401 });
  
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      if (!id) return NextResponse.json({ error: "Announcement ID is required" }, { status: 400 });
  
      await ConnectToDB();

      const announcementToDelete = await Announcement.findById(id);
      if (!announcementToDelete) {
        return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
      }
      
      if (authResult.user.role === 'mentor' && announcementToDelete.createdBy.toString() !== authResult.user._id.toString()) {
        return NextResponse.json({ error: "You do not have permission to delete this announcement." }, { status: 403 });
      }

      await Announcement.findByIdAndDelete(id);
  
      return NextResponse.json({ message: "Announcement deleted successfully" }, { status: 200 });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
    }
}
