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
import Notification from "@/schema/Notification";

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

// POST method to create a new assignment with PDF upload
export async function POST(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const deadline = formData.get('deadline');
    const batchCode = formData.get('batchCode'); // Get batchCode
    const pdfFile = formData.get('pdfFile'); 

    if (!title || !description || !deadline || !batchCode) { 
      return NextResponse.json({ error: "Title, description, deadline, and batch code are required" }, { status: 400 });
    }

    let resourceUrl = '';
    if (pdfFile && pdfFile.name) {
      const uploadDir = path.join(process.cwd(), 'public', 'assignments');
      await fs.mkdir(uploadDir, { recursive: true });

      const uniqueFileName = `${Date.now()}-${pdfFile.name.replace(/\s/g, '_')}`;
      const filePath = path.join(uploadDir, uniqueFileName);
      const fileBuffer = Buffer.from(await pdfFile.arrayBuffer());

      await fs.writeFile(filePath, fileBuffer);
      resourceUrl = `/assignments/${uniqueFileName}`;
    }

    await ConnectToDB();

    const newAssignment = await Assignment.create({
      title,
      description,
      deadline: new Date(deadline),
      resourceUrl, 
      batchCode, // Save batchCode
    });
    
    if (newAssignment) {
      // Find all users in the specified batch
      const usersInBatch = await Users.find({
        batchCodes: newAssignment.batchCode,
        isAdmin: false,
      });

      // Create a notification for each user
      for (const user of usersInBatch) {
        await Notification.create({
          user: user._id,
          message: `A new assignment "${newAssignment.title}" has been posted.`,
          link: "/dashboard/assignments",
          batchCode: newAssignment.batchCode,
          type: "new_assignment",
        });
      }
    }

    return NextResponse.json(
      { message: "Assignment created successfully", assignment: newAssignment },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating assignment:", error);
    if (error.code === 'ENOENT') {
        return NextResponse.json(
            { error: "Server error: Upload directory not found or accessible." },
            { status: 500 }
        );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create assignment" },
      { status: 500 }
    );
  }
}

// GET method to fetch all assignments, including their submission counts
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

    const assignments = await Assignment.find(query).sort({ createdAt: -1 });

    const assignmentsWithCounts = await Promise.all(assignments.map(async (assignment) => {
      const submissionCount = await Submission.countDocuments({ assignment: assignment._id });
      return {
        ...assignment.toObject(), 
        submissionCount 
      };
    }));

    return NextResponse.json({ assignments: assignmentsWithCounts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// DELETE method to delete an assignment (and its associated PDF and submissions)
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
    const assignmentId = searchParams.get('id'); 

    if (!assignmentId || !mongoose.Types.ObjectId.isValid(assignmentId)) {
      return NextResponse.json({ error: "Assignment ID is required and must be valid" }, { status: 400 });
    }

    await ConnectToDB();

    const assignmentToDelete = await Assignment.findById(assignmentId);

    // Delete associated submissions first
    await Submission.deleteMany({ assignment: assignmentId });

    const deletedAssignment = await Assignment.findByIdAndDelete(assignmentId);

    if (!deletedAssignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    if (assignmentToDelete && assignmentToDelete.resourceUrl) {
      const filePath = path.join(process.cwd(), 'public', assignmentToDelete.resourceUrl);
      try {
        await fs.unlink(filePath); 
        console.log(`Successfully deleted file: ${filePath}`);
      } catch (fileError) {
        console.warn(`Could not delete associated file ${filePath}:`, fileError.message);
      }
    }

    return NextResponse.json(
      { message: "Assignment deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete assignment" },
      { status: 500 }
    );
  }
}