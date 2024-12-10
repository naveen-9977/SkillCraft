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
        batchName: "Mastering React In 1 Months",
        batchCreatedAt: "10/12/24",
        batchCode: "#cqhef",
        subjects: "Programming Fundamentals, Java Script, React JS, Express JS",
        studyMaterial: [
          {
            title: "50+ ReactJS Interview Questions",
            mentor: "Kunal Rajput",
            resourceUrl: "/SM-pdf1.pdf",
            resourceType: "pdf",
          },
          {
            title: "React interview questions",
            mentor: "Kunal Rajput",
            resourceUrl: "/SM-pdf2.pdf",
            resourceType: "pdf",
          },
          {
            title: "Top 70 ReactJS Interview Questions and Answers",
            mentor: "Kunal Rajput",
            resourceUrl: "/SM-pdf3.pdf",
            resourceType: "pdf",
          },
        ],
        announcements: [
          {
            title: "Mock Test Updates Now Live!",
            mentor: "Pooja Kanetkar",
            message: "Our mock tests just got better! New exam simulations, improved feedback, and detailed performance analysis are now live. Test your skills and enhance your preparation today.",
          },
          {
            title: "SkillCrafters Launching Mobile App!",
            mentor: "Pooja Kanetkar",
            message: "Great news! SkillCrafters is now available on mobile. Download our app to study on the go, access mock tests, and track your progress anytime, anywhere.",
          },
        ],
        assignments: [
          {
            title: "Simple JavaScript Assignments",
            mentor: "Roma Singh",
            resourceUrl: "/A-pdf1.pdf",
            resourceType: "pdf",
          },
          {
            title: "JavaScript Parctice PDF",
            mentor: "Roma Singh",
            resourceUrl: "/A-pdf2.pdf",
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
