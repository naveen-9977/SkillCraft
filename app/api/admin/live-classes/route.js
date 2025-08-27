import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import LiveClass from "@/schema/LiveClass";
import Joi from "joi";
import Users from "@/schema/Users"; 
import Batch1 from "@/schema/Batch1";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
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

const schema = Joi.object({
    _id: Joi.string().optional(),
    topic: Joi.string().required(),
    description: Joi.string().required(),
    mentor: Joi.string().required(),
    batch: Joi.array().items(Joi.string()).min(1).required(),
    startTime: Joi.date().required(),
    classType: Joi.string().valid('webrtc', 'external').required(),
    link: Joi.when('classType', {
        is: 'external',
        then: Joi.string().uri().required(),
        otherwise: Joi.string().allow('').optional()
    }),
}).unknown(true);

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
                const mentorBatches = await Batch1.find({ batchCode: { $in: authResult.user.batchCodes } }).select('_id');
                const mentorBatchIds = mentorBatches.map(b => b._id);
                batchQuery = { batch: { $in: mentorBatchIds } };
            } else {
                return NextResponse.json({ success: true, data: [] });
            }
        }
        const classes = await LiveClass.find(batchQuery)
            .populate([{ path: 'mentor', model: Users, select: 'name' }, { path: 'batch', model: Batch1, select: 'batchName' }])
            .sort({ startTime: -1 });
        return NextResponse.json({ success: true, data: classes });
    } catch (error) {
        console.error("Error fetching live classes:", error);
        return NextResponse.json({ success: false, message: "Something went wrong!" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const authResult = await verifyAdminOrMentor(req);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }

        await ConnectToDB();
        const body = await req.json();
        const { error } = schema.validate(body);
        if (error) {
            return NextResponse.json({ success: false, message: error.details[0].message }, { status: 400 });
        }
        
        const targetBatchDocs = await Batch1.find({ _id: { $in: body.batch } });
        if (targetBatchDocs.length !== body.batch.length) {
            return NextResponse.json({ success: false, message: "One or more selected batches not found." }, { status: 404 });
        }

        if (authResult.user.role === 'mentor') {
            const mentorBatchCodes = authResult.user.batchCodes;
            const selectedBatchCodes = targetBatchDocs.map(doc => doc.batchCode);
            const isAuthorized = selectedBatchCodes.every(code => mentorBatchCodes.includes(code));
            if (!isAuthorized) {
                return NextResponse.json({ success: false, message: "You are not assigned to one or more selected batches." }, { status: 403 });
            }
        }

        const newClass = await LiveClass.create({ ...body, createdBy: authResult.user._id });
        
        if (newClass) {
            const targetBatchCodes = targetBatchDocs.map(doc => doc.batchCode);
            const usersToNotify = await Users.find({
                role: 'student',
                status: 'approved',
                batchCodes: { $in: targetBatchCodes }
            });

            for (const batchDoc of targetBatchDocs) {
                const studentsInBatch = usersToNotify.filter(user => user.batchCodes.includes(batchDoc.batchCode));
                for (const student of studentsInBatch) {
                    await Notification.create({
                        user: student._id,
                        message: `A new live class "${newClass.topic}" has been scheduled for your batch.`,
                        link: "/dashboard/live-classes",
                        batchCode: batchDoc.batchCode,
                        type: "new_announcement"
                    });
                }
            }
        }

        const populatedClass = await LiveClass.findById(newClass._id)
            .populate([{ path: 'mentor', model: Users, select: 'name' }, { path: 'batch', model: Batch1, select: 'batchName' }]);

        return NextResponse.json({ success: true, message: "Live class created and students notified!", data: populatedClass }, { status: 201 });
    } catch (error) {
        console.error("Error creating live class:", error);
        return NextResponse.json({ success: false, message: "Something went wrong!" }, { status: 500 });
    }
}


export async function PUT(req) {
    try {
        const authResult = await verifyAdminOrMentor(req);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }
        await ConnectToDB();
        const body = await req.json();
        const { _id, ...updateData } = body;
        const { error } = schema.validate(body);
        if (error) {
            return NextResponse.json({ success: false, message: error.details[0].message }, { status: 400 });
        }
        if (!_id) {
            return NextResponse.json({ success: false, message: "Class ID is required." }, { status: 400 });
        }
        const classToUpdate = await LiveClass.findById(_id);
        if (!classToUpdate) {
            return NextResponse.json({ success: false, message: "Class not found." }, { status: 404 });
        }
        if (authResult.user.role === 'mentor' && classToUpdate.createdBy.toString() !== authResult.user._id.toString()) {
            return NextResponse.json({ success: false, message: "You do not have permission to edit this class." }, { status: 403 });
        }
        const updatedClass = await LiveClass.findByIdAndUpdate(_id, updateData, { new: true })
            .populate([{ path: 'mentor', model: Users, select: 'name' }, { path: 'batch', model: Batch1, select: 'batchName' }]);
        return NextResponse.json({ success: true, message: "Live class updated successfully!", data: updatedClass });
    } catch (error) {
        console.error("Error updating live class:", error);
        return NextResponse.json({ success: false, message: "Something went wrong!" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const authResult = await verifyAdminOrMentor(req);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: 401 });
        }
        await ConnectToDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ success: false, message: "Class ID is required." }, { status: 400 });
        }
        const classToDelete = await LiveClass.findById(id);
        if (!classToDelete) {
            return NextResponse.json({ success: false, message: "Class not found." }, { status: 404 });
        }
        if (authResult.user.role === 'mentor' && classToDelete.createdBy.toString() !== authResult.user._id.toString()) {
            return NextResponse.json({ success: false, message: "You do not have permission to delete this class." }, { status: 403 });
        }
        await LiveClass.findByIdAndDelete(id);
        return NextResponse.json({ success: true, message: "Live class deleted successfully!" });
    } catch (error) {
        console.error("Error deleting live class:", error);
        return NextResponse.json({ success: false, message: "Something went wrong!" }, { status: 500 });
    }
}