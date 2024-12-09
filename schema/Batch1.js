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
    },
    subjects: {
      type: String,
      required: true,
    },
    tests: {
      type: Array,
    },
    studyMaterial: {
      type: Array,
    },
    announcements: {
      type: Array,
    },
    assignments: {
      type: Array,
    },
  },
  { timestamps: true }
);

const Batch1 = models.batch1 || model("batch1", bstch1Schema);

export default Batch1;
