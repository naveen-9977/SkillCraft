import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Blog from "@/schema/Blogs";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Users from "@/schema/Users";
import fs from 'fs/promises'; // NEW: Import file system module for file operations
import path from 'path';     // NEW: Import path module for path manipulation

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

// Create a new blog post
export async function POST(req) {
  try {
    // Verify if user is admin
    const authResult = await verifyAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // NEW: Parse request body as FormData for file uploads
    const formData = await req.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const paragraphOne = formData.get('paragraphOne');
    const paragraphTwo = formData.get('paragraphTwo');
    const paragraphThree = formData.get('paragraphThree');
    const coverImageFile = formData.get('coverImage'); // The actual file object
    const existingCoverImage = formData.get('existingCoverImage'); // Not strictly needed for POST, but good to get all form fields

    if (!title || !description || !paragraphOne || !paragraphTwo || !paragraphThree) {
      return NextResponse.json({ error: "All text fields are required" }, { status: 400 });
    }

    let coverImageUrl = '';

    // NEW: Handle file upload if a new file is provided
    if (coverImageFile && coverImageFile.name) {
      const uploadDir = path.join(process.cwd(), 'public', 'blog_images'); // Define upload directory
      await fs.mkdir(uploadDir, { recursive: true }); // Create directory if it doesn't exist

      const uniqueFileName = `${Date.now()}-${coverImageFile.name.replace(/\s/g, '_')}`;
      const filePath = path.join(uploadDir, uniqueFileName);
      const fileBuffer = Buffer.from(await coverImageFile.arrayBuffer());

      await fs.writeFile(filePath, fileBuffer); // Save the file
      coverImageUrl = `/blog_images/${uniqueFileName}`; // Store the public path
    } else {
      // If no file is uploaded, and it's a new post, then cover image is missing
      return NextResponse.json({ error: "Cover image file is required for new blog posts" }, { status: 400 });
    }

    // Connect to database
    await ConnectToDB();

    // Create new blog post with the image URL
    const blog = await Blog.create({
      title,
      description,
      paragraphOne,
      paragraphTwo,
      paragraphThree,
      coverImage: coverImageUrl // Use the new URL
    });

    return NextResponse.json(
      { message: "Blog created successfully", blog },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blog:", error);
    // NEW: More specific error handling for file system issues
    if (error.code === 'ENOENT') {
        return NextResponse.json(
            { error: "Server error: Upload directory for images not found or accessible." },
            { status: 500 }
        );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create blog" },
      { status: 500 }
    );
  }
}

// Get all blog posts
export async function GET(req) {
  try {
    // Connect to database
    await ConnectToDB();

    // Get all blogs, sorted by creation date
    const blogs = await Blog.find({})
      .sort({ createdAt: -1 })
      .select('-__v'); // Exclude version key

    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}