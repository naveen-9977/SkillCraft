import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import ConnectToDB from "@/DB/ConnectToDB";
import Users from "@/schema/Users";

export async function PUT(req) {
  try {
    // Get the token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify the token to get the user's ID
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'your-secret-key');
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Get the request body
    const { name, email, currentPassword, newPassword, confirmPassword } = await req.json();

    // Connect to the database
    await ConnectToDB();

    // Find the user in the database
    const user = await Users.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // If the email is being changed, check if the new email is already taken
    if (email && email !== user.email) {
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already taken" },
          { status: 400 }
        );
      }
    }

    // Update basic user information
    user.name = name || user.name;
    user.email = email || user.email;

    // Handle password change if all required fields are provided
    if (currentPassword && newPassword && confirmPassword) {
      // Verify the user's current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      // Validate that the new passwords match
      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: "New passwords do not match" },
          { status: 400 }
        );
      }

      // Hash and set the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    // Save the updated user document
    await user.save();

    // Return a success response with the updated user info
    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role // UPDATED: Return 'role' instead of 'isAdmin'
      }
    });

  } catch (error) {
    console.error("Profile update error:", error);

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}