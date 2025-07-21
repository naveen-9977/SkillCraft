// app/api/admin/studymaterial/route.js
import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import StudyMaterial from "@/schema/StudyMaterial";
import Users from "@/schema/Users";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import fs from 'fs/promises';
import path from 'path';
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

// POST method to create a new study material with file upload
export async function POST(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // NEW: Parse FormData for file upload
    const formData = await req.formData();
    const title = formData.get('title');
    const mentor = formData.get('mentor');
    const resourceType = formData.get('resourceType');
    const batchCode = formData.get('batchCode');
    const resourceFile = formData.get('resourceFile'); // The actual file object

    if (!title || !mentor || !resourceType || !batchCode) {
      return NextResponse.json({ error: "Title, mentor, resource type, and batch code are required" }, { status: 400 });
    }

    let resourceUrl = '';
    if (resourceFile && resourceFile.name) {
      const uploadDir = path.join(process.cwd(), 'public', 'study_materials'); // Dedicated folder for study materials
      await fs.mkdir(uploadDir, { recursive: true });

      const uniqueFileName = `${Date.now()}-${resourceFile.name.replace(/\s/g, '_')}`;
      const filePath = path.join(uploadDir, uniqueFileName);
      const fileBuffer = Buffer.from(await resourceFile.arrayBuffer());

      await fs.writeFile(filePath, fileBuffer);
      resourceUrl = `/study_materials/${uniqueFileName}`; // Store the public path
    } else {
      return NextResponse.json({ error: "A resource file is required" }, { status: 400 });
    }

    await ConnectToDB();

    const newStudyMaterial = await StudyMaterial.create({
      title,
      mentor,
      resourceUrl,
      resourceType,
      batchCode,
    });

    // NEW: Create notifications for all users in the specified batch
    if (newStudyMaterial) {
      const usersInBatch = await Users.find({
        batchCodes: newStudyMaterial.batchCode,
        isAdmin: false,
        status: 'approved',
      });

      for (const user of usersInBatch) {
        await Notification.create({
          user: user._id,
          message: `New study material "${newStudyMaterial.title}" (${newStudyMaterial.resourceType}) available!`,
          link: "/dashboard/studymaterial", // Link to the study material page
          batchCode: newStudyMaterial.batchCode,
          type: "new_studymaterial",
        });
      }
    }

    return NextResponse.json(
      { message: "Study material created successfully", studyMaterial: newStudyMaterial },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating study material:", error);
    if (error.code === 'ENOENT') {
        return NextResponse.json(
            { error: "Server error: Upload directory not found or accessible." },
            { status: 500 }
        );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create study material" },
      { status: 500 }
    );
  }
}

// GET method to fetch all study materials (admin view)
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

    const studyMaterials = await StudyMaterial.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ studyMaterials }, { status: 200 });
  } catch (error) {
    console.error("Error fetching study materials:", error);
    return NextResponse.json(
      { error: "Failed to fetch study materials" },
      { status: 500 }
    );
  }
}

// PUT method to update a study material with optional file upload
export async function PUT(req) {
  try {
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // NEW: Parse FormData for file upload
    const formData = await req.formData();
    const _id = formData.get('_id'); // Get the ID for update
    const title = formData.get('title');
    const mentor = formData.get('mentor');
    const resourceType = formData.get('resourceType');
    const batchCode = formData.get('batchCode');
    const resourceFile = formData.get('resourceFile'); // New file if uploaded
    const existingResourceUrl = formData.get('resourceUrl'); // Existing URL if no new file

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return NextResponse.json({ error: "Invalid study material ID" }, { status: 400 });
    }
    if (!title || !mentor || !resourceType || !batchCode) {
        return NextResponse.json({ error: "Title, mentor, resource type, and batch code are required for update" }, { status: 400 });
    }

    await ConnectToDB();

    let newResourceUrl = existingResourceUrl; // Start with the existing URL

    // Handle new file upload
    if (resourceFile && resourceFile.name) {
      const uploadDir = path.join(process.cwd(), 'public', 'study_materials');
      await fs.mkdir(uploadDir, { recursive: true });

      const uniqueFileName = `${Date.now()}-${resourceFile.name.replace(/\s/g, '_')}`;
      const filePath = path.join(uploadDir, uniqueFileName);
      const fileBuffer = Buffer.from(await resourceFile.arrayBuffer());

      await fs.writeFile(filePath, fileBuffer);
      newResourceUrl = `/study_materials/${uniqueFileName}`;

      // Optional: Delete old file if it exists and a new one is uploaded
      const oldMaterial = await StudyMaterial.findById(_id);
      if (oldMaterial && oldMaterial.resourceUrl && oldMaterial.resourceUrl.startsWith('/study_materials/')) {
        const oldFilePath = path.join(process.cwd(), 'public', oldMaterial.resourceUrl);
        try {
          await fs.unlink(oldFilePath);
          console.log(`Successfully deleted old file: ${oldFilePath}`);
        } catch (fileError) {
          console.warn(`Could not delete old file ${oldFilePath}:`, fileError.message);
        }
      }
    } else if (!existingResourceUrl) {
        // If it's an update and no new file is provided AND no existing URL is provided
        return NextResponse.json({ error: "Resource URL or a new file is required for update." }, { status: 400 });
    }


    const updatedStudyMaterial = await StudyMaterial.findByIdAndUpdate(
      _id,
      { title, mentor, resourceUrl: newResourceUrl, resourceType, batchCode, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedStudyMaterial) {
      return NextResponse.json({ error: "Study material not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Study material updated successfully", studyMaterial: updatedStudyMaterial },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating study material:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update study material" },
      { status: 500 }
    );
  }
}

// DELETE method to delete a study material and its associated file
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
      return NextResponse.json({ error: "Study material ID is required and must be valid" }, { status: 400 });
    }

    await ConnectToDB();

    const studyMaterialToDelete = await StudyMaterial.findById(id);

    const deletedStudyMaterial = await StudyMaterial.findByIdAndDelete(id);

    if (!deletedStudyMaterial) {
      return NextResponse.json({ error: "Study material not found" }, { status: 404 });
    }

    // NEW: Delete the associated physical file
    if (studyMaterialToDelete && studyMaterialToDelete.resourceUrl && studyMaterialToDelete.resourceUrl.startsWith('/study_materials/')) {
      const filePath = path.join(process.cwd(), 'public', studyMaterialToDelete.resourceUrl);
      try {
        await fs.unlink(filePath);
        console.log(`Successfully deleted file: ${filePath}`);
      } catch (fileError) {
        console.warn(`Could not delete associated file ${filePath}:`, fileError.message);
      }
    }

    return NextResponse.json(
      { message: "Study material deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting study material:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete study material" },
      { status: 500 }
    );
  }
}