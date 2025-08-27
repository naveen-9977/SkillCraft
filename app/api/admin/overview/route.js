import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import ConnectToDB from "@/DB/ConnectToDB";
import Batch1 from "@/schema/Batch1";
import Users from "@/schema/Users"; // Import Users schema for verification

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

export async function POST(req, res) {
  try {
    // UPDATED: Use the new verification function
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { id, batchName, batchCreatedAt, batchCode, subjects } = await req.json();

    if (!id || !batchName || !batchCreatedAt || !batchCode || !subjects) {
      return NextResponse.json({ error: "All fields are required to update the batch" }, { status: 400 });
    }

    await ConnectToDB();
    
    await Batch1.findByIdAndUpdate(id, {
        batchName: batchName,
        batchCreatedAt: batchCreatedAt,
        batchCode: batchCode,
        subjects: subjects
    });

    return NextResponse.json({ message: "Update Successful" }, { status: 200 });

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}