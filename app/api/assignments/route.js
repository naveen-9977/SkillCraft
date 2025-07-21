// app/api/assignments/route.js
import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Assignment from "@/schema/Assignment";
import Submission from "@/schema/Submission";
import Users from "@/schema/Users";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from 'fs/promises';
import path from 'path';
import mongoose from "mongoose";
import Notification from "@/schema/Notification"; // NEW: Import Notification schema

// Utility function to verify user and get their details (including batchCodes and status)
async function verifyUser(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found', status: 401 };
    }

    let decoded;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return { success: false, error: 'Invalid token', status: 401 };
    }

    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      console.error("Invalid userId format in token:", decoded.userId);
      return { success: false, error: 'Invalid user ID format in token', status: 401 };
    }

    await ConnectToDB();

    // Select batchCodes (plural)
    const user = await Users.findById(decoded.userId).select('name email isAdmin batchCodes status');

    if (!user) {
      return { success: false, error: 'User not found', status: 404 };
    }

    // Check if user is approved and has at least one batch code
    if (user.status !== 'approved' || !Array.isArray(user.batchCodes) || user.batchCodes.length === 0) {
      return { success: false, error: 'User not approved or not assigned to any batch. Please contact your administrator.', status: 403 };
    }

    // Return batchCodes array as part of the user object
    return { success: true, user: { ...user.toObject(), batchCodes: user.batchCodes } };
  } catch (error) {
    console.error("Detailed Authentication Failed Error:", error);
    return { success: false, error: `Authentication failed: ${error.message || 'Unknown error'}`, status: 500 };
  }
}

// GET method to fetch all assignments for a student, including their submission status
export async function GET(req) {
  try {
    const authResult = await verifyUser(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const studentId = authResult.user._id;
    const studentBatchCodes = authResult.user.batchCodes; // Get array of batch codes

    // Filter assignments by ANY of the student's batch codes
    const assignments = await Assignment.find({ batchCode: { $in: studentBatchCodes } }).sort({ deadline: 1 });

    const submissions = await Submission.find({ student: studentId });

    const assignmentsWithSubmissionStatus = assignments.map(assignment => {
      const studentSubmission = submissions.find(
        sub => sub.assignment.toString() === assignment._id.toString()
      );

      return {
        ...assignment.toObject(),
        hasSubmitted: !!studentSubmission,
        submissionDetails: studentSubmission ? studentSubmission.toObject() : null,
      };
    });

    return NextResponse.json({ assignments: assignmentsWithSubmissionStatus }, { status: 200 });

  } catch (error) {
    console.error("Error fetching assignments for student:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// POST method for a student to submit an assignment, now with PDF file upload
export async function POST(req) {
  try {
    const authResult = await verifyUser(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const studentId = authResult.user._id;
    const studentName = authResult.user.name; // NEW: Get student name for notification
    const studentBatchCodes = authResult.user.batchCodes; // Get array of batch codes

    const formData = await req.formData();
    const assignmentId = formData.get('assignmentId');
    const submissionText = formData.get('submissionContent');
    const pdfFile = formData.get('pdfFile');

    if (!assignmentId || (!submissionText && !pdfFile)) {
      return NextResponse.json({ error: "Assignment ID and either text content or a PDF file are required" }, { status: 400 });
    }
    if (pdfFile && pdfFile.type !== 'application/pdf') {
        return NextResponse.json({ error: "Only PDF files are allowed for submission." }, { status: 400 });
    }

    await ConnectToDB();

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Check if the assignment's batchCode is included in the user's assigned batchCodes
    if (!studentBatchCodes.includes(assignment.batchCode)) {
        return NextResponse.json({ error: "You are not authorized to submit to this assignment's batch." }, { status: 403 });
    }

    if (new Date() > new Date(assignment.deadline)) {
      return NextResponse.json({ error: "Submission deadline has passed" }, { status: 400 });
    }

    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId,
    });

    if (existingSubmission) {
      return NextResponse.json({ error: "You have already submitted this assignment" }, { status: 409 });
    }

    let resourceUrl = '';
    if (pdfFile && pdfFile.name) {
      const uploadDir = path.join(process.cwd(), 'public', 'submissions');
      await fs.mkdir(uploadDir, { recursive: true });

      const uniqueFileName = `${Date.now()}-${studentId}-${pdfFile.name.replace(/\s/g, '_')}`;
      const filePath = path.join(uploadDir, uniqueFileName);
      const fileBuffer = Buffer.from(await pdfFile.arrayBuffer());

      await fs.writeFile(filePath, fileBuffer);
      resourceUrl = `/submissions/${uniqueFileName}`;
    }

    const newSubmission = await Submission.create({
      assignment: assignmentId,
      student: studentId,
      submissionContent: submissionText || (resourceUrl ? `[PDF Submission: ${pdfFile.name}]` : 'No text content provided'),
      resourceUrl: resourceUrl,
      status: 'Submitted'
    });

    // NEW: Create a notification for admins about the new submission
    if (newSubmission) {
        const admins = await Users.find({ isAdmin: true });
        for (const admin of admins) {
            await Notification.create({
                user: admin._id,
                message: `New assignment submission from ${studentName} for "${assignment.title}" (${assignment.batchCode}).`,
                link: `/admin/assignments/${assignment._id}/submissions`, // Link directly to the submissions page
                batchCode: assignment.batchCode, // Include batchCode for filtering by admin side if needed
                type: "new_submission",
            });
        }
    }

    return NextResponse.json(
      { message: "Assignment submitted successfully", submission: newSubmission },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error submitting assignment:", error);
    if (error.code === 'ENOENT') {
        return NextResponse.json(
            { error: "Server error: Submission directory not found or accessible." },
            { status: 500 }
        );
    }
    return NextResponse.json(
      { error: error.message || "Failed to submit assignment" },
      { status: 500 }
    );
  }
}