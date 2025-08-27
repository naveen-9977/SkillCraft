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

// GET method to fetch batches and all assignment items
export async function GET(req) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    await ConnectToDB();

    let batchQuery = {};
    if (authResult.user.role === 'mentor') {
        if (authResult.user.batchCodes && authResult.user.batchCodes.length > 0) {
            batchQuery.batchCode = { $in: authResult.user.batchCodes };
        } else {
            return NextResponse.json({ batches: [], assignments: [] }, { status: 200 });
        }
    }

    const batches = await Batch1.find(batchQuery).sort({ batchName: 1 });
    const assignments = await Assignment.find(batchQuery).populate('createdBy', 'name');

    return NextResponse.json({ batches, assignments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}

// POST method to create a new folder or upload an assignment file
export async function POST(req) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const formData = await req.formData();
    const type = formData.get('type');
    const title = formData.get('title');
    const parent = formData.get('parent') || null;
    const batchCode = formData.get('batchCode');
    const description = formData.get('description');
    const deadline = formData.get('deadline');
    const pdfFile = formData.get('pdfFile'); 

    if (!type || !title || !batchCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (authResult.user.role === 'mentor' && !authResult.user.batchCodes.includes(batchCode)) {
        return NextResponse.json({ error: "You do not have permission to add material to this batch." }, { status: 403 });
    }

    await ConnectToDB();
    let newAssignment;

    if (type === 'folder') {
        newAssignment = await Assignment.create({
            title, type: 'folder', parent, batchCode, createdBy: authResult.user._id
        });
    } else if (type === 'file') {
        if (!pdfFile || !description || !deadline) {
            return NextResponse.json({ error: "File, description, and deadline are required for assignments" }, { status: 400 });
        }
        const uploadDir = path.join(process.cwd(), 'public', 'assignments');
        await fs.mkdir(uploadDir, { recursive: true });
        const uniqueFileName = `${Date.now()}-${pdfFile.name.replace(/\s/g, '_')}`;
        const filePath = path.join(uploadDir, uniqueFileName);
        const fileBuffer = Buffer.from(await pdfFile.arrayBuffer());
        await fs.writeFile(filePath, fileBuffer);
        const resourceUrl = `/assignments/${uniqueFileName}`;

        newAssignment = await Assignment.create({
            title, description, deadline: new Date(deadline), resourceUrl, type: 'file', parent, batchCode, createdBy: authResult.user._id
        });
        
        const usersInBatch = await Users.find({ batchCodes: batchCode, role: 'student', status: 'approved' });
        for (const user of usersInBatch) {
            await Notification.create({
                user: user._id,
                message: `New assignment posted: "${title}" in batch ${batchCode}.`,
                link: "/dashboard/assignments",
                batchCode: batchCode,
                type: "new_assignment",
            });
        }
    } else {
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ message: "Assignment created successfully", assignment: newAssignment }, { status: 201 });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
  }
}

// DELETE method to remove a folder or file
export async function DELETE(req) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    await ConnectToDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const itemToDelete = await Assignment.findById(id);
    if (!itemToDelete) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (authResult.user.role === 'mentor' && itemToDelete.createdBy.toString() !== authResult.user._id.toString()) {
        return NextResponse.json({ error: "You do not have permission to delete this item." }, { status: 403 });
    }
    
    const idsToDelete = [itemToDelete._id];
    const filesToDelete = [];

    if (itemToDelete.type === 'file' && itemToDelete.resourceUrl) {
        filesToDelete.push(itemToDelete.resourceUrl);
    } else if (itemToDelete.type === 'folder') {
        const children = await Assignment.find({ parent: itemToDelete._id });
        const queue = [...children];
        while (queue.length > 0) {
            const current = queue.shift();
            idsToDelete.push(current._id);
            if (current.type === 'file' && current.resourceUrl) {
                filesToDelete.push(current.resourceUrl);
            } else if (current.type === 'folder') {
                const grandchildren = await Assignment.find({ parent: current._id });
                queue.push(...grandchildren);
            }
        }
    }

    await Submission.deleteMany({ assignment: { $in: idsToDelete } });
    await Assignment.deleteMany({ _id: { $in: idsToDelete } });

    for (const resourceUrl of filesToDelete) {
        const filePath = path.join(process.cwd(), 'public', resourceUrl);
        try { await fs.unlink(filePath); } catch (e) { console.warn(`Could not delete file: ${e.message}`); }
    }

    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}