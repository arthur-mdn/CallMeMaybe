import mongoose from 'mongoose'

const CallSchema = new mongoose.Schema({
    callId: { type: String, required: true, unique: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
    transcript: { type: String },
    audioPath: { type: String },
    participants: [{ type: String }]
})

export default mongoose.model('Call', CallSchema)