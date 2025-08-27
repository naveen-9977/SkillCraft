import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import StudyMaterial from "@/schema/StudyMaterial";
import Users from "@/schema/Users";
import Batch1 from "@/schema/Batch1";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import fs from 'fs/promises';
import path from 'path';
import Notification from "@/schema/Notification";

async function verifyAdminOrMentor(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (!token) return { success: false, error: 'No token found' };
    
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('name role batchCodes');

    if (!user || (user.role !== 'admin' && user.role !== 'mentor')) {
      return { success: false, error: 'Unauthorized access' };
    }
    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

// GET method remains the same
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
            return NextResponse.json({ batches: [], materials: [] }, { status: 200 });
        }
    }

    const batches = await Batch1.find(batchQuery).sort({ batchName: 1 });
    const materials = await StudyMaterial.find(batchQuery).populate('createdBy', 'name');

    return NextResponse.json({ batches, materials }, { status: 200 });
  } catch (error) {
    console.error("Error fetching study materials:", error);
    return NextResponse.json({ error: "Failed to fetch study materials" }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const formData = await req.formData();
    const type = formData.get('type');
    const title = formData.get('title');
    const description = formData.get('description');
    const thumbnailUrlFile = formData.get('thumbnailUrl');
    const parent = formData.get('parent') || null;
    const batchCode = formData.get('batchCode');
    const resourceFile = formData.get('resourceFile');
    const youtubeUrl = formData.get('youtubeUrl');
    const isPremium = formData.get('isPremium') === 'true';
    const requiredTier = formData.get('requiredTier');
    const dripDate = formData.get('dripDate');


    const mentorName = authResult.user.name; 

    if (!type || !title || !batchCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (authResult.user.role === 'mentor' && !authResult.user.batchCodes.includes(batchCode)) {
        return NextResponse.json({ error: "You do not have permission to add material to this batch." }, { status: 403 });
    }

    await ConnectToDB();
    let newMaterial;
    
    const materialData = {
        title,
        description,
        type,
        parent,
        batchCode,
        mentor: mentorName,
        createdBy: authResult.user._id,
        isPremium,
        requiredTier: isPremium ? requiredTier : undefined,
        dripDate: dripDate ? new Date(dripDate) : undefined,
    };


    if (type === 'folder') {
      newMaterial = await StudyMaterial.create(materialData);
    } else if (type === 'file') {
        if (!resourceFile) {
            return NextResponse.json({ error: "File is required for file type material" }, { status: 400 });
        }
        // Handle the main resource file upload
        const uploadDir = path.join(process.cwd(), 'public', 'study_materials');
        await fs.mkdir(uploadDir, { recursive: true });
        const uniqueFileName = `${Date.now()}-${resourceFile.name.replace(/\s/g, '_')}`;
        const filePath = path.join(uploadDir, uniqueFileName);
        const fileBuffer = Buffer.from(await resourceFile.arrayBuffer());
        await fs.writeFile(filePath, fileBuffer);
        materialData.resourceUrl = `/study_materials/${uniqueFileName}`;
        
        // Handle the thumbnail file upload if it exists
        if (thumbnailUrlFile && thumbnailUrlFile.name) {
            const thumbUploadDir = path.join(process.cwd(), 'public', 'study_thumbnails');
            await fs.mkdir(thumbUploadDir, { recursive: true });
            const thumbUniqueFileName = `${Date.now()}-thumb-${thumbnailUrlFile.name.replace(/\s/g, '_')}`;
            const thumbFilePath = path.join(thumbUploadDir, thumbUniqueFileName);
            const thumbFileBuffer = Buffer.from(await thumbnailUrlFile.arrayBuffer());
            await fs.writeFile(thumbFilePath, thumbFileBuffer);
            materialData.thumbnailUrl = `/study_thumbnails/${thumbUniqueFileName}`;
        }
        
        newMaterial = await StudyMaterial.create(materialData);

    } else if (type === 'youtube_video' || type === 'youtube_playlist') {
        if (!youtubeUrl) {
            return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
        }
        materialData.youtubeUrl = youtubeUrl;
        // For YouTube links, the thumbnailUrl is a string URL from the form data
        materialData.thumbnailUrl = formData.get('thumbnailUrl');
        newMaterial = await StudyMaterial.create(materialData);

    } else {
      return NextResponse.json({ error: "Invalid material type" }, { status: 400 });
    }

    // Notify students
    const usersInBatch = await Users.find({ batchCodes: batchCode, role: 'student', status: 'approved' });
    for (const user of usersInBatch) {
      await Notification.create({
        user: user._id,
        message: `New study material added: "${title}" in batch ${batchCode}.`,
        link: "/dashboard/studymaterial",
        batchCode: batchCode,
        type: "new_studymaterial",
      });
    }

    return NextResponse.json({ message: "Material added successfully", material: newMaterial }, { status: 201 });
  } catch (error) {
    console.error("Error creating study material:", error);
    return NextResponse.json({ error: "Failed to create study material" }, { status: 500 });
  }
}

// DELETE method is unchanged
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
            return NextResponse.json({ error: "Material ID is required" }, { status: 400 });
        }

        const materialToDelete = await StudyMaterial.findById(id);
        if (!materialToDelete) {
            return NextResponse.json({ error: "Material not found" }, { status: 404 });
        }

        if (authResult.user.role === 'mentor' && materialToDelete.createdBy.toString() !== authResult.user._id.toString()) {
            return NextResponse.json({ error: "You do not have permission to delete this material." }, { status: 403 });
        }

        const idsToDelete = [materialToDelete._id];
        const filesToDelete = [];

        if (materialToDelete.resourceUrl) {
            filesToDelete.push(materialToDelete.resourceUrl);
        }
        if (materialToDelete.thumbnailUrl && materialToDelete.thumbnailUrl.startsWith('/study_thumbnails/')) {
            filesToDelete.push(materialToDelete.thumbnailUrl);
        }

        if (materialToDelete.type === 'folder') {
            const children = await StudyMaterial.find({ parent: materialToDelete._id });
            const queue = [...children];
            while (queue.length > 0) {
                const current = queue.shift();
                idsToDelete.push(current._id);
                if (current.resourceUrl) {
                    filesToDelete.push(current.resourceUrl);
                }
                if (current.thumbnailUrl && current.thumbnailUrl.startsWith('/study_thumbnails/')) {
                    filesToDelete.push(current.thumbnailUrl);
                }
                if (current.type === 'folder') {
                    const grandchildren = await StudyMaterial.find({ parent: current._id });
                    queue.push(...grandchildren);
                }
            }
        }
        
        await StudyMaterial.deleteMany({ _id: { $in: idsToDelete } });

        for (const resourceUrl of filesToDelete) {
            const filePath = path.join(process.cwd(), 'public', resourceUrl);
            try { await fs.unlink(filePath); } catch (e) { console.warn(`Could not delete file: ${e.message}`); }
        }

        return NextResponse.json({ message: "Material deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting material:", error);
        return NextResponse.json({ error: "Failed to delete material" }, { status: 500 });
    }
}
