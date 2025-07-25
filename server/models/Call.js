import mongoose from "mongoose";

const CallSchema = new mongoose.Schema({
  callId: { type: String, required: true, unique: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  audioPath: { type: String },
  useAI: { type: Boolean, default: true },
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
    },
        info: {
            title: { type: String, default: '' },
            icon: { type: String, default: '' },
            description: { type: String, default: '' }
        }
  },
  fiche: [{
    pdfPath: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    metadata: {
      type: Object,
      default: {}
    }
  }],
  participants: [{ type: String }],
  chat: [{
    role: { type: String, enum: ['user', 'ai'], required: true },
    content: { type: String, required: true },
    error: { type: String },
    date: { type: Date, default: Date.now }
  }],
  chatRetranscription: [{
    role: { type: String, enum: ['user', 'ai'], required: true },
    content: { type: String, required: true },
    error: { type: String },
    date: { type: Date, default: Date.now }
  }]
});

export default mongoose.model("Call", CallSchema);
