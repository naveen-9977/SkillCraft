import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Test from "@/schema/Tests";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Users from "@/schema/Users";
import Batch1 from "@/schema/Batch1";
import Notification from "@/schema/Notification";

async function verifyAdminOrMentor(req) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return { success: false, error: 'No token found' };
    }

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

export async function POST(req) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const testData = await req.json();

    if (!testData.batchCode) {
      return NextResponse.json({ error: "Batch code is required for new tests" }, { status: 400 });
    }

    if (authResult.user.role === 'mentor' && !authResult.user.batchCodes.includes(testData.batchCode)) {
        return NextResponse.json({ error: "You do not have permission to create a test for this batch." }, { status: 403 });
    }

    await ConnectToDB();

    const test = await Test.create({
        ...testData,
        createdBy: authResult.user._id
    });

    if (test) {
      const usersInBatch = await Users.find({
        batchCodes: test.batchCode,
        role: 'student',
        status: 'approved',
      });

      for (const user of usersInBatch) {
        await Notification.create({
          user: user._id,
          message: `A new test "${test.title}" has been posted for your batch!`,
          link: `/dashboard/tests/${test._id}`,
          batchCode: test.batchCode,
          type: "new_test",
        });
      }
    }

    return NextResponse.json(
      { message: "Test created successfully", test },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating test:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create test" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    await ConnectToDB();
    
    const { searchParams } = new URL(req.url);
    const batchCode = searchParams.get('batchCode');

    if (batchCode) {
        // Return tests for a specific batch
        if (authResult.user.role === 'mentor' && !authResult.user.batchCodes.includes(batchCode)) {
            return NextResponse.json({ error: "You are not authorized to view tests for this batch." }, { status: 403 });
        }

        const tests = await Test.find({ batchCode }).sort({ createdAt: -1 });
        const batch = await Batch1.findOne({ batchCode }).select('batchName').lean();
        const testsWithBatchNames = tests.map(test => ({
            ...test.toObject(),
            batchName: batch ? batch.batchName : 'Unknown Batch'
        }));
        return NextResponse.json({ tests: testsWithBatchNames }, { status: 200 });

    } else {
        // Return batches
        let query = {};
        if (authResult.user.role === 'mentor') {
            if (authResult.user.batchCodes && authResult.user.batchCodes.length > 0) {
                query.batchCode = { $in: authResult.user.batchCodes };
            } else {
                return NextResponse.json({ batches: [] }, { status: 200 });
            }
        }

        const batches = await Batch1.find(query).sort({ createdAt: -1 });
        return NextResponse.json({ batches }, { status: 200 });
    }

  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}