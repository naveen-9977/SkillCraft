import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import TestResult from "@/schema/TestResult";
import Test from "@/schema/Tests";
import Users from "@/schema/Users";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Notification from "@/schema/Notification";

// POST a new test result (This part remains the same)
export async function POST(req) {
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

    const { testId, answers } = await req.json();

    if (!testId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid test data provided" }, { status: 400 });
    }

    await ConnectToDB();

    const test = await Test.findById(testId);
    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

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

    if (newTestResult) {
        const adminsAndMentors = await Users.find({ role: { $in: ['admin', 'mentor'] } });
        for (const adminOrMentor of adminsAndMentors) {
            await Notification.create({
                user: adminOrMentor._id,
                message: `New test result from ${student.name} for "${test.title}". Score: ${score}/${test.questions.length}.`,
                link: `/admin/leaderboard?testId=${test._id}`,
                batchCode: test.batchCode,
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

// CORRECTED: GET all test results for the logged-in student
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

        // This query correctly fetches all results for the student and does not use `params`.
        const testResults = await TestResult.find({ student: studentId })
            .populate('test', 'title description')
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