import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/schema/Users';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // UPDATED: Security check to ensure only approved users can log in
    if (user.status !== 'approved') {
      return NextResponse.json({ error: "Your account is not yet approved. Please contact an administrator." }, { status: 403 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("JWT_SECRET is not defined in your .env.local file.");
        return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '1h' }
    );

    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      path: '/',
    });

    return NextResponse.json({ success: true, message: "Login successful", user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      batchCodes: user.batchCodes
    }}, { status: 200 });

  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}