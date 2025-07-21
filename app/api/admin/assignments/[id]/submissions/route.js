// app/api/admin/assignments/[id]/submissions/route.js
import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Assignment from "@/schema/Assignment";
import Submission from "@/schema/Submission";
import Users from "@/schema/Users";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
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

// GET method to fetch all submissions for a specific assignment
export async function GET(req, { params }) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const assignmentId = params.id;

    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      return NextResponse.json({ error: "Invalid Assignment ID provided" }, { status: 400 });
    }

    await ConnectToDB();

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'name email')
      .sort({ submittedAt: 1 });

    return NextResponse.json({ assignment, submissions }, { status: 200 });

  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

// PUT method to update a specific submission (e.g., add score and comments)
export async function PUT(req, { params }) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const assignmentId = params.id;
    const { submissionId, score, adminComments } = await req.json();

    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      return NextResponse.json({ error: "Invalid Assignment ID" }, { status: 400 });
    }
    if (!submissionId || !mongoose.Types.ObjectId.isValid(submissionId)) {
      return NextResponse.json({ error: "Invalid Submission ID" }, { status: 400 });
    }

    await ConnectToDB();

    const updatedSubmission = await Submission.findOneAndUpdate(
      { _id: submissionId, assignment: assignmentId },
      {
        score: score,
        adminComments: adminComments,
        status: 'Graded',
      },
      { new: true, runValidators: true }
    ).populate('student', 'name email').populate('assignment', 'title batchCode'); // NEW: Populate assignment details for notification

    if (!updatedSubmission) {
      return NextResponse.json({ error: "Submission not found or does not belong to this assignment" }, { status: 404 });
    }

    // NEW: Create a notification for the student when their submission is graded
    if (updatedSubmission) {
      await Notification.create({
        user: updatedSubmission.student._id,
        message: `Your assignment "${updatedSubmission.assignment.title}" has been graded! Score: ${updatedSubmission.score}.`,
        link: "/dashboard/assignments", // Link to assignments page
        batchCode: updatedSubmission.assignment.batchCode,
        type: "graded_submission",
      });
    }

    return NextResponse.json(
      { message: "Submission updated successfully", submission: updatedSubmission },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update submission" },
      { status: 500 }
    );
  }
}