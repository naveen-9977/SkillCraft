import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Blog from "@/schema/Blogs";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Users from "@/schema/Users";
import mongoose from "mongoose"; // NEW: Import mongoose for ObjectId validation
import fs from 'fs/promises';     // NEW: Import file system module for file operations
import path from 'path';         // NEW: Import path module for path manipulation

// Verify admin authentication
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

// Get a specific blog post
export async function GET(req, { params }) {
  try {
    // NEW: Validate params.id
    if (!params || !params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid or missing Blog ID provided" },
        { status: 400 }
      );
    }

    await ConnectToDB();
    
    const blog = await Blog.findById(params.id).select('-__v');
    
    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ blog }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

// Update a blog post
export async function PUT(req, { params }) {
  try {
    // Verify if user is admin
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // NEW: Validate params.id
    if (!params || !params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid or missing Blog ID provided" },
        { status: 400 }
      );
    }

    // NEW: Parse request body as FormData for file uploads
    const formData = await req.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const paragraphOne = formData.get('paragraphOne');
    const paragraphTwo = formData.get('paragraphTwo');
    const paragraphThree = formData.get('paragraphThree');
    const coverImageFile = formData.get('coverImage'); // The new file object
    const existingCoverImage = formData.get('existingCoverImage'); // The URL of the current image

    await ConnectToDB();

    const currentBlog = await Blog.findById(params.id);
    if (!currentBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    let updatedCoverImageUrl = currentBlog.coverImage; // Default to existing image

    // NEW: Handle new file upload
    if (coverImageFile && coverImageFile.name) {
      const uploadDir = path.join(process.cwd(), 'public', 'blog_images');
      await fs.mkdir(uploadDir, { recursive: true });

      const uniqueFileName = `${Date.now()}-${coverImageFile.name.replace(/\s/g, '_')}`;
      const filePath = path.join(uploadDir, uniqueFileName);
      const fileBuffer = Buffer.from(await coverImageFile.arrayBuffer());

      await fs.writeFile(filePath, fileBuffer);
      updatedCoverImageUrl = `/blog_images/${uniqueFileName}`;

      // Optional: Delete old file if it exists and is not an external URL
      if (currentBlog.coverImage && currentBlog.coverImage.startsWith('/blog_images/')) {
        const oldFilePath = path.join(process.cwd(), 'public', currentBlog.coverImage);
        try {
          await fs.unlink(oldFilePath);
          console.log(`Successfully deleted old blog image: ${oldFilePath}`);
        } catch (fileError) {
          console.warn(`Could not delete old blog image ${oldFilePath}:`, fileError.message);
        }
      }
    } else if (existingCoverImage) {
      // If no new file is uploaded but existing URL is provided, keep it
      updatedCoverImageUrl = existingCoverImage;
    } else {
      // If no new file and no existing URL, clear the cover image (optional, depends on desired behavior)
      updatedCoverImageUrl = ''; // Or handle as an error if image is mandatory
    }


    const updatedBlog = await Blog.findByIdAndUpdate(
      params.id,
      {
        title,
        description,
        paragraphOne,
        paragraphTwo,
        paragraphThree,
        coverImage: updatedCoverImageUrl, // Use the determined image URL
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Blog updated successfully", blog: updatedBlog },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating blog:", error);
    // NEW: More specific error handling for file system issues
    if (error.code === 'ENOENT') {
        return NextResponse.json(
            { error: "Server error: Upload directory for images not found or accessible." },
            { status: 500 }
        );
    }
    return NextResponse.json(
      { error: error.message || "Failed to update blog" },
      { status: 500 }
    );
  }
}

// Delete a blog post
export async function DELETE(req, { params }) {
  try {
    // Verify if user is admin
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // NEW: Validate params.id
    if (!params || !params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "Invalid or missing Blog ID provided" },
        { status: 400 }
      );
    }

    await ConnectToDB();

    const blogToDelete = await Blog.findById(params.id); // Get blog to find image URL

    const deletedBlog = await Blog.findByIdAndDelete(params.id);

    if (!deletedBlog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 }
      );
    }

    // NEW: Delete the associated physical file
    if (blogToDelete && blogToDelete.coverImage && blogToDelete.coverImage.startsWith('/blog_images/')) {
      const filePath = path.join(process.cwd(), 'public', blogToDelete.coverImage);
      try {
        await fs.unlink(filePath);
        console.log(`Successfully deleted blog image file: ${filePath}`);
      } catch (fileError) {
        console.warn(`Could not delete associated blog image file ${filePath}:`, fileError.message);
      }
    }

    return NextResponse.json(
      { message: "Blog deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}