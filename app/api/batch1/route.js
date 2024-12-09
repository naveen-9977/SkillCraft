import ConnectToDB from "@/DB/ConnectToDB";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import Batch1 from "@/schema/Batch1";

export async function GET() {
  try {
    ConnectToDB();
    let allEntries = await Batch1.find({});

    // if all entries 0 then create 3 of them

    if (allEntries.length == 0) {
      await Batch1.create({
        batchName: "Vinayaka Batch 01 Nimcet 2024",
        batchCreatedAt: "20/04/24",
        batchCode: "batchCode",
        subjects:
          "Mathematics, Computer, Quantitative Aptitude, Logical Reasoning, English, Other",
        studyMaterial: [
          {
            title: "Two Digit Number Multiplication",
            mentor: "Ashish Kumar Singh",
            resourceUrl: "/abc.pdf",
            resourceType: "pdf",
          },
          {
            title: "Syllogism Basic 500 Questions",
            mentor: "Ashish Kumar Singh",
            resourceUrl: "/abc.pdf",
            resourceType: "pdf",
          },
        ],
        announcements: [
          {
            title: "Tests Tommorow",
            mentor: "Ashish Kumar Singh",
            message: "their is test tommorow",
          },
          {
            title: "Tests Tommorow",
            mentor: "Ashish Kumar Singh",
            message: "their is test on 12th Feb",
          },
        ],
        assignments: [
          {
            title: "Two Digit Number Multiplication",
            mentor: "Ashish Kumar Singh",
            resourceUrl: "/abc.pdf",
            resourceType: "pdf",
          },
          {
            title: "Syllogism Basic 500 Questions",
            mentor: "Ashish Kumar Singh",
            resourceUrl: "/abc.pdf",
            resourceType: "pdf",
          },
        ],
      });

      let allData = await Batch1.find({});

      return NextResponse.json({ data: allData });
    } else {
      return NextResponse.json({ data: allEntries });
    }
  } catch (err) {
    return NextResponse.json(
      { message: "something went wrong" },
      { status: 500 }
    );
  }
}
