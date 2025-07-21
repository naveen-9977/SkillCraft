import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment', 
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Reference to your Users schema
    required: true
  },
  submissionContent: { // For text-based submissions or a summary/placeholder if file is uploaded
    type: String, 
    required: [true, "Submission content is required"],
  },
  resourceUrl: { // To store the path/URL of the student-uploaded submission file
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  score: {
    type: Number,
    default: null, 
    min: 0
  },
  adminComments: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Submitted', 'Graded'], 
    default: 'Submitted' 
  },
});

const Submission = mongoose.models.Submission || mongoose.model('Submission', submissionSchema);

export default Submission;