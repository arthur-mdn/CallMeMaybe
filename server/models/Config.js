// models/Config.js
import mongoose from "mongoose";

const ConfigSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: mongoose.Schema.Types.Mixed
});

export default mongoose.model("Config", ConfigSchema);