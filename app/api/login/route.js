// app/api/login/route.js (or similar authentication route)
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/schema/Users';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Removed direct import of cookies here to ensure it's called only within the function
// import { cookies } from 'next/headers'; 

export async function POST(request) {
  // NEW: Import cookies directly inside the function to ensure server-side context
  const { cookies } = await import('next/headers'); 

  await dbConnect();

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin, batchCodes: user.batchCodes, status: user.status },
      process.env.JWT_SECRET || 'your-secret-key-fallback',
      { expiresIn: '1h' }
    );

    // Set the token in a httpOnly cookie
    cookies().set('token', token, { // cookies() is now available from the import inside the function
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });

    return NextResponse.json({ success: true, message: "Login successful", user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      status: user.status,
      batchCodes: user.batchCodes
    }}, { status: 200 });

  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
