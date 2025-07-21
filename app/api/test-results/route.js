// app/api/test-results/route.js
import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB"; // Assuming your DB connection utility
import TestResult from "@/schema/TestResult"; // Your new schema
import Test from "@/schema/Tests"; // Your existing Test schema
import Users from "@/schema/Users"; // NEW: Import Users schema
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Notification from "@/schema/Notification"; // NEW: Import Notification schema

export async function POST(req) {
  try {
    // Authenticate user (assuming JWT token in cookies)
    const cookieStore = cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    } catch (jwtError) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const { testId, answers } = await req.json();

    if (!testId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid test data provided" }, { status: 400 });
    }

    await ConnectToDB();

    // Fetch the actual test to verify answers and calculate score
    const test = await Test.findById(testId);
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // NEW: Fetch student details for notification
    const student = await Users.findById(decoded.userId).select('name email');
    if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    let score = 0;
    const formattedAnswers = answers.map((userAnswer, index) => {
      const question = test.questions[index];
      const isCorrect = Number(userAnswer.selectedOptionIndex) === Number(question.correctOption);
      if (isCorrect) {
        score++;
      }
      return {
        questionIndex: index,
        selectedOptionIndex: userAnswer.selectedOptionIndex,
        isCorrect: isCorrect,
      };
    });

    const newTestResult = await TestResult.create({
      student: decoded.userId,
      test: testId,
      score: score,
      totalQuestions: test.questions.length,
      answers: formattedAnswers,
    });

    // NEW: Create a notification for admins about the new test result
    if (newTestResult) {
        const admins = await Users.find({ isAdmin: true });
        for (const admin of admins) {
            await Notification.create({
                user: admin._id,
                message: `New test result from ${student.name} for "${test.title}" (Batch: ${test.batchCode}). Score: ${score}/${test.questions.length}.`,
                link: `/admin/leaderboard?testId=${test._id}`, // Link to the specific test leaderboard
                batchCode: test.batchCode, // Include batchCode
                type: "new_test_result",
            });
        }
    }

    return NextResponse.json(
      { message: "Test results saved successfully", result: newTestResult },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving test results:", error);
    return NextResponse.json(
      { error: "Failed to save test results" },
      { status: 500 }
    );
  }
}

// You might also want a GET route to fetch a student's past test results
export async function GET(req) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get("token");

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
        } catch (jwtError) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
        }

        await ConnectToDB();
        const studentId = decoded.userId;

        const testResults = await TestResult.find({ student: studentId })
            .populate('test', 'title description') // Populate test details
            .sort({ submittedAt: -1 });

        return NextResponse.json({ testResults }, { status: 200 });
    } catch (error) {
        console.error("Error fetching test results:", error);
        return NextResponse.json(
            { error: "Failed to fetch test results" },
            { status: 500 }
        );
    }
}