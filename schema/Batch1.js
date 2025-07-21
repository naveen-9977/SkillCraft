import { Schema, models, model } from "mongoose";
const bstch1Schema = new Schema(
  {
    batchName: {
      type: String,
      required: true,
    },
    batchCreatedAt: {
      type: String,
      required: true,
    },
    batchCode: {
      type: String,
      required: true,
      unique: true, // Ensure batch codes are unique
    },
    subjects: {
      type: String,
      required: true,
    },
    // Removed tests, studyMaterial, announcements, and assignments arrays
    // These will now be managed by their own schemas with a batchCode reference
  },
  { timestamps: true }
);

const Batch1 = models.batch1 || model("batch1", bstch1Schema);

export default Batch1;