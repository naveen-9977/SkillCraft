import ConnectToDB from "@/DB/ConnectToDB";
import Users from "@/schema/Users";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const { name, email, password, confirmPassword } = await req.json();

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    try {
      await ConnectToDB();
    } catch (error) {
      console.error('Database connection error:', error);
      return NextResponse.json(
        { error: "Database connection failed. Please try again." },
        { status: 500 }
      );
    }

    // Check for existing user
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new Users({
      name,
      email,
      password: hashedPassword,
      isAdmin: false,
    });

    await user.save();

    return NextResponse.json(
      { success: true, message: "Account created successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
