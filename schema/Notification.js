// schema/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  batchCode: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      "new_assignment",
      "new_test",
      "new_studymaterial",
      "new_announcement",
      "graded_submission",
      "new_submission",
      "new_test_result",
    ],
    required: true,
  },
}, { timestamps: true });

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;