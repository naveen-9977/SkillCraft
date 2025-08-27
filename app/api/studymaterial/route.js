import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import StudyMaterial from "@/schema/StudyMaterial";
import Users from "@/schema/Users";
import Batch1 from "@/schema/Batch1";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";

// Helper function to verify student and get their batch codes
async function verifyStudent(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (!token) return { success: false, error: 'No token found', status: 401 };

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('role batchCodes status');

    if (!user || user.role !== 'student' || user.status !== 'approved') {
      return { success: false, error: 'Unauthorized access.' };
    }
    
    if (!Array.isArray(user.batchCodes) || user.batchCodes.length === 0) {
        return { success: false, error: 'You are not assigned to any batch.', status: 403 };
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Invalid token' };
  }
}

// GET method to fetch batches and all study material items for a student
export async function GET(req) {
  try {
    const authResult = await verifyStudent(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    
    await ConnectToDB();

    const studentBatchCodes = authResult.user.batchCodes;
    
    const batches = await Batch1.find({ batchCode: { $in: studentBatchCodes } }).sort({ batchName: 1 });
    const materials = await StudyMaterial.find({ batchCode: { $in: studentBatchCodes } }).populate('createdBy', 'name');

    return NextResponse.json({ batches, materials }, { status: 200 });
  } catch (error) {
    console.error("Error fetching study materials:", error);
    return NextResponse.json({ error: "Failed to fetch study materials" }, { status: 500 });
  }
}