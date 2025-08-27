import mongoose from "mongoose";

// This schema defines the structure for storing WebRTC signaling messages.
// These messages (offers, answers, ICE candidates) are essential for
// establishing a peer-to-peer connection between users.
const liveClassSignalingSchema = new mongoose.Schema({
  // Associates the signaling message with a specific live class.
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveClass',
    required: true,
  },
  // The ID of the user sending the message.
  senderId: {
    type: String, // Can be a userId or a unique session ID.
    required: true,
  },
  // The ID of the user intended to receive the message.
  receiverId: {
    type: String, // Can be a userId, a session ID, or 'all' for broadcast.
    required: true,
  },
  // The type of WebRTC message.
  messageType: {
    type: String,
    enum: ['offer', 'answer', 'candidate'], // SDP offers, answers, or ICE candidates.
    required: true,
  },
  // The actual content of the signaling message (e.g., the SDP object or ICE candidate).
  payload: {
    type: mongoose.Schema.Types.Mixed, // Can be an object or a string.
    required: true,
  },
  // Automatically sets the creation time for the message.
  createdAt: {
    type: Date,
    default: Date.now,
    // The 'expires' option creates a TTL index in MongoDB, which automatically
    // deletes the document after the specified time. This prevents the
    // database from getting cluttered with old signaling messages.
    expires: '1h',
  },
});

// Ensures the model is not re-compiled on hot reloads.
const LiveClassSignaling = mongoose.models.LiveClassSignaling || mongoose.model('LiveClassSignaling', liveClassSignalingSchema);

export default LiveClassSignaling;
