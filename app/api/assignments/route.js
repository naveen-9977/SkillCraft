import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Assignment from "@/schema/Assignment";
import Submission from "@/schema/Submission";
import Users from "@/schema/Users";
import Batch1 from "@/schema/Batch1";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import fs from 'fs/promises';
import path from 'path';
import mongoose from "mongoose";
import Notification from "@/schema/Notification";

async function verifyUser(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (!token) return { success: false, error: 'No token found', status: 401 };
    
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return { success: false, error: 'Invalid user ID in token', status: 401 };
    }

    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('name email role batchCodes status').lean();
    if (!user) return { success: false, error: 'User not found', status: 404 };
    
    if (user.status !== 'approved' || !Array.isArray(user.batchCodes) || user.batchCodes.length === 0) {
      return { success: false, error: 'User not approved or not assigned to any batch.', status: 403 };
    }
    return { success: true, user };
  } catch (error) {
    return { success: false, error: `Authentication failed: ${error.message || 'Unknown error'}`, status: 500 };
  }
}

// GET method rewritten to fetch all data needed for the folder UI
export async function GET(req) {
  try {
    const authResult = await verifyUser(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const studentId = authResult.user._id;
    const studentBatchCodes = authResult.user.batchCodes;

    await ConnectToDB();

    const batches = await Batch1.find({ batchCode: { $in: studentBatchCodes } }).sort({ batchName: 1 });
    const assignments = await Assignment.find({ batchCode: { $in: studentBatchCodes } });
    const submissions = await Submission.find({ student: studentId });

    return NextResponse.json({ batches, assignments, submissions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignments for student:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

// POST method for a student to submit an assignment
export async function POST(req) {
  try {
    const authResult = await verifyUser(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const studentId = authResult.user._id;
    const studentName = authResult.user.name;
    const studentBatchCodes = authResult.user.batchCodes;

    const formData = await req.formData();
    const assignmentId = formData.get('assignmentId');
    const submissionText = formData.get('submissionContent');
    const pdfFile = formData.get('pdfFile');

    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
        return NextResponse.json({ error: "Invalid Assignment ID provided" }, { status: 400 });
    }
    if (!submissionText && (!pdfFile || pdfFile.size === 0)) {
      return NextResponse.json({ error: "Submission content or a file is required" }, { status: 400 });
    }

    await ConnectToDB();
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (!studentBatchCodes.includes(assignment.batchCode)) {
        return NextResponse.json({ error: "You are not authorized to submit to this assignment's batch." }, { status: 403 });
    }
    if (new Date() > new Date(assignment.deadline)) {
      return NextResponse.json({ error: "Submission deadline has passed" }, { status: 400 });
    }

    const existingSubmission = await Submission.findOne({ assignment: assignmentId, student: studentId });
    if (existingSubmission) {
      return NextResponse.json({ error: "You have already submitted this assignment" }, { status: 409 });
    }

    let resourceUrl = '';
    if (pdfFile && pdfFile.size > 0) {
        try {
            const uploadDir = path.join(process.cwd(), 'public', 'submissions');
            await fs.mkdir(uploadDir, { recursive: true });
            const uniqueFileName = `${Date.now()}-${studentId}-${pdfFile.name.replace(/\s/g, '_')}`;
            const filePath = path.join(uploadDir, uniqueFileName);
            const fileBuffer = Buffer.from(await pdfFile.arrayBuffer());
            await fs.writeFile(filePath, fileBuffer);
            resourceUrl = `/submissions/${uniqueFileName}`;
        } catch (fileError) {
            console.error("Error handling file upload:", fileError);
            return NextResponse.json({ error: "Could not save the uploaded file." }, { status: 500 });
        }
    }

    const newSubmission = await Submission.create({
      assignment: assignmentId,
      student: studentId,
      submissionContent: submissionText || `[PDF Submission: ${pdfFile.name}]`,
      resourceUrl: resourceUrl,
      status: 'Submitted'
    });

    if (newSubmission) {
        const usersToNotify = await Users.find({
            $or: [
                { role: 'admin' },
                { role: 'mentor', batchCodes: assignment.batchCode }
            ]
        });

        for (const user of usersToNotify) {
            await Notification.create({
                user: user._id,
                message: `New submission by ${studentName} for "${assignment.title}".`,
                link: `/admin/assignments/${assignment._id}/submissions`,
                batchCode: assignment.batchCode,
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
    if (error.name === 'ValidationError') {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "An unexpected error occurred on the server." },
      { status: 500 }
    );
  }
}