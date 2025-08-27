import ConnectToDB from "@/DB/ConnectToDB";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Contact from "@/schema/Contact";
import Users from "@/schema/Users";
import mongoose from "mongoose";

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


export async function GET(req, res) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    await ConnectToDB();
    const data = await Contact.find({});
    return NextResponse.json({ data });

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req, res) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
  
    const { id, action } = await req.json();
    await ConnectToDB();

    const data = await Contact.findByIdAndUpdate(new mongoose.Types.ObjectId(id), {
      actionTaken: !action
    });
    return NextResponse.json({ data });

  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}


export async function DELETE(req, res) {
  try {
    const authResult = await verifyAdminOrMentor(req);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { id } = await req.json();
    await ConnectToDB();
    await Contact.findByIdAndDelete(id); // Changed from passing an object to just the id
    return NextResponse.json(
      { message: "Item removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}