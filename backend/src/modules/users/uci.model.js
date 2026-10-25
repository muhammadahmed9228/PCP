// backend/src/modules/users/uci.model.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const uciSchema = new mongoose.Schema(
  {
    uciNo: { type: String, required: true, trim: true },
    uciName: { type: String, required: true, trim: true },
    username: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      index: true // Indexed for faster auth queries
    }, // CNIC
    password: { type: String, required: [true, "Password is required"] },
    phoneNumber: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    isGovtEmployee: { type: Boolean, required: true },
    ucNumber: { type: String, required: true, trim: true },
    ucName: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    townTehsil: { type: String, required: true, trim: true },
    role: { type: String, default: "UCI", immutable: true }, // Foundation for RBAC[cite: 1]
    refreshToken: { type: String }
  },
  { timestamps: true }
);

// Secure password handling using a strong hashing mechanism[cite: 1]
uciSchema.pre("save", async function () {
  if (!this.isModified("password")) return 
  this.password = await bcrypt.hash(this.password, 10);
});

uciSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

uciSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, username: this.username, role: this.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

uciSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const UCI = mongoose.model("UCI", uciSchema);