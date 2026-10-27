import mongoose from "mongoose";

export const imageAssetSchema = new mongoose.Schema({
  url: { type: String, required: true },
  fileId: { type: String, required: true },
  fileName: { type: String },
  width: { type: Number },
  height: { type: Number },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });
