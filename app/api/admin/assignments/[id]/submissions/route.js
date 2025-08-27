import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Assignment from "@/schema/Assignment";
import Submission from "@/schema/Submission";
import Users from "@/schema/Users";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Notification from "@/schema/Notification";

async function verifyAdminOrMentor(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (!token) return { success: false, error: 'No token found' };

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('role');

    if (!user || (user.role !== 'admin' && user.role !== 'mentor')) {
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
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const assignmentId = params.id;
    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      return NextResponse.json({ error: "Invalid Assignment ID" }, { status: 400 });
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
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

// PUT method to grade a submission (add score and comments)
export async function PUT(req, { params }) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { submissionId, score, adminComments } = await req.json();
    if (!submissionId || !mongoose.Types.ObjectId.isValid(submissionId)) {
      return NextResponse.json({ error: "Invalid Submission ID" }, { status: 400 });
    }

    await ConnectToDB();
    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      { score, adminComments, status: 'Graded' },
      { new: true, runValidators: true }
    ).populate('assignment', 'title batchCode');

    if (!updatedSubmission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Create a notification for the student
    await Notification.create({
      user: updatedSubmission.student,
      message: `Your assignment "${updatedSubmission.assignment.title}" has been graded! Score: ${score}.`,
      link: "/dashboard/assignments",
      batchCode: updatedSubmission.assignment.batchCode,
      type: "graded_submission",
    });

    return NextResponse.json({ message: "Submission graded successfully", submission: updatedSubmission }, { status: 200 });
  } catch (error) {
    console.error("Error updating submission:", error);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}