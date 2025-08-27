import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Blog from "@/schema/Blogs";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Users from "@/schema/Users";
import fs from 'fs/promises';
import path from 'path';

// UPDATED: Utility function to verify admin or mentor
async function verifyAdminOrMentor(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found' };
    }

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

// Create a new blog post
export async function POST(req) {
  try {
    // UPDATED: Use new verification function
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const paragraphOne = formData.get('paragraphOne');
    const paragraphTwo = formData.get('paragraphTwo');
    const paragraphThree = formData.get('paragraphThree');
    const coverImageFile = formData.get('coverImage');

    if (!title || !description || !paragraphOne || !paragraphTwo || !paragraphThree) {
      return NextResponse.json({ error: "All text fields are required" }, { status: 400 });
    }

    let coverImageUrl = '';

    if (coverImageFile && coverImageFile.name) {
      const uploadDir = path.join(process.cwd(), 'public', 'blog_images');
      await fs.mkdir(uploadDir, { recursive: true });

      const uniqueFileName = `${Date.now()}-${coverImageFile.name.replace(/\s/g, '_')}`;
      const filePath = path.join(uploadDir, uniqueFileName);
      const fileBuffer = Buffer.from(await coverImageFile.arrayBuffer());

      await fs.writeFile(filePath, fileBuffer);
      coverImageUrl = `/blog_images/${uniqueFileName}`;
    } else {
      return NextResponse.json({ error: "Cover image file is required for new blog posts" }, { status: 400 });
    }

    await ConnectToDB();

    const blog = await Blog.create({
      title,
      description,
      paragraphOne,
      paragraphTwo,
      paragraphThree,
      coverImage: coverImageUrl
    });

    return NextResponse.json(
      { message: "Blog created successfully", blog },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create blog" },
      { status: 500 }
    );
  }
}

// Get all blog posts
export async function GET(req) {
  try {
    await ConnectToDB();

    const blogs = await Blog.find({})
      .sort({ createdAt: -1 })
      .select('-__v');

    return NextResponse.json({ blogs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}