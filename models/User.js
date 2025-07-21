// models/User.js or similar
import { Schema, models, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    isAdmin: {
      type: Boolean,
      required: [true, "user type is required"],
    },
    batchCodes: { // NEW: Changed to an array of Strings
      type: [String],
      default: [], // Default to an empty array
    },
    status: { // New field for user status
      type: String,
      enum: ['pending', 'approved', 'rejected'], // Possible statuses
      default: 'pending', // Default status for new registrations
    },
  },
  { timestamps: true }
);

const Users = models.Users || model("Users", userSchema);

export default Users;
