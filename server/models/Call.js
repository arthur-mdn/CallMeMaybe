import mongoose from "mongoose";

const CallSchema = new mongoose.Schema({
  callId: { type: String, required: true, unique: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  audioPath: { type: String },
  transcript: {
    status: {
      type: String,
      enum: ['waiting', 'started', 'success', 'error'],
    },
    txtContent: {
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: ''
    }
  },
  participants: [{ type: String }],
});

export default mongoose.model("Call", CallSchema);
