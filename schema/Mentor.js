import mongoose from "mongoose";

/**
 * Defines the schema for a Mentor.
 * This creates a dedicated collection in the database for mentors,
 * allowing for mentor-specific fields in the future (e.g., expertise, bio).
 */
const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Mentor name is required."],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Mentor email is required."],
    unique: true, // Ensures no two mentors can have the same email.
    trim: true,
    lowercase: true,
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields.

const Mentor = mongoose.models.Mentor || mongoose.model('Mentor', mentorSchema);

export default Mentor;
