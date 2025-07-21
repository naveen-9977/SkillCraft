import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Test from "@/schema/Tests";
import mongoose from "mongoose"; // For ObjectId validation

// Get a specific test (for students to take)
export async function GET(req, { params }) {
  try {
    if (!params || !params.id || !mongoose.Types.ObjectId.isValid(params.id)) {
      console.error("Error: Invalid or missing Test ID provided in request parameters.");
      return NextResponse.json(
        { error: "Invalid or missing Test ID. Please ensure the URL is correct." },
        { status: 400 } 
      );
    }

    await ConnectToDB();
    
    const test = await Test.findById(params.id).select('-questions.correctOption -__v'); 

    if (!test) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ test }, { status: 200 });
  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json(
      { error: "Failed to fetch test" },
      { status: 500 }
    );
  }
}