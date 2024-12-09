import ConnectToDB from "@/DB/ConnectToDB";
import { NextResponse } from "next/server";
export async function POST(req, res) {
  const { batchName, batchCreatedAt, batchCode, subjects } = await req.json();
  try {
    ConnectToDB(); // connects to DB
    
    return NextResponse.json({ data: "Sucess" });
  } catch (e) {
    console.log("Something went wrong");
  }
}
