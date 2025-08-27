import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import StudyMaterial from "@/schema/StudyMaterial";
import Users from "@/schema/Users";
import Batch1 from "@/schema/Batch1";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

async function verifyUserAndGetBatchCodes(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');
    if (!token) return { success: false, error: 'No token found', status: 401 };

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    if (!decoded.userId || !mongoose.Types.ObjectId.isValid(decoded.userId)) {
      return { success: false, error: 'Invalid user ID in token', status: 401 };
    }

    await ConnectToDB();
    const user = await Users.findById(decoded.userId).select('batchCodes status');
    if (!user) return { success: false, error: 'User not found', status: 404 };

    if (user.status !== 'approved' || !Array.isArray(user.batchCodes) || user.batchCodes.length === 0) {
      return { success: false, error: 'User not approved or not in a batch.', status: 403 };
    }

    return { success: true, userBatchCodes: user.batchCodes };
  } catch (error) {
    return { success: false, error: `Authentication failed: ${error.message || 'Unknown error'}`, status: 500 };
  }
}

export async function GET(req) {
  try {
    const authResult = await verifyUserAndGetBatchCodes(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    await ConnectToDB();

    const studentBatchCodes = authResult.userBatchCodes;
    const batchQuery = { batchCode: { $in: studentBatchCodes } };

    const batches = await Batch1.find(batchQuery).sort({ batchName: 1 });
    const materials = await StudyMaterial.find(batchQuery).populate('createdBy', 'name');

    return NextResponse.json({ batches, materials }, { status: 200 });
  } catch (error) {
    console.error("Error fetching student study materials:", error);
    return NextResponse.json({ error: "Failed to fetch study materials" }, { status: 500 });
  }
}