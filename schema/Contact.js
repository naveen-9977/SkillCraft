import { Schema, models, model } from "mongoose";
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "first name is required"],
    },
    lastName: {
      type: String,
      required: [true, "last name is required"],
    },
    email: {
        type: String,
        required: [true, "email is required"]
    },
    phone:{
        type: Number
    },
    message: {
        type: String,
        required: [true, "message is required"]
    },
    actionTaken: {
      type: Boolean,
      required: true
    }
  },
  { timestamps: true }
);

const Contact = models.contact || model("contact", userSchema);

export default Contact;
