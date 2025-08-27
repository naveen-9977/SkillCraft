import { NextResponse } from "next/server";
import ConnectToDB from "@/DB/ConnectToDB";
import Users from "@/schema/Users";
import bcrypt from "bcrypt";
import Notification from "@/schema/Notification"; // Import Notification schema

export async function POST(req) {
  try {
    await ConnectToDB();
    const { name, email, password, confirmPassword } = await req.json();

    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newMentor = await Users.create({
      name,
      email,
      password: hashedPassword,
      role: 'mentor',
      status: 'pending',
    });

    // UPDATED: Create a notification for all admin users
    if (newMentor) {
        const admins = await Users.find({ role: 'admin' });
        for (const admin of admins) {
            await Notification.create({
                user: admin._id,
                message: `New mentor registration: "${newMentor.name}" is awaiting approval.`,
                link: '/admin/users', // Link to the user management page
                batchCode: 'admin_only', // Special code for admin-level notifications
                type: 'new_submission' // Reusing a general type, can be customized
            });
        }
    }

    return NextResponse.json(
      { success: true, message: "Registration successful! Your account is now pending admin approval." },
      { status: 201 }
    );

  } catch (error) {
    console.error('Mentor registration error:', error);
    return NextResponse.json(
      { error: "Registration failed due to a server error. Please try again later." },
      { status: 500 }
    );
  }
}