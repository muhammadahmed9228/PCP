import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const aicSchema = new mongoose.Schema(
    {
        aicNo: { type: String, required: true, trim: true },
        aicName: { type: String, required: true, trim: true },
        username: { 
            type: String, 
            required: true, 
            unique: true, 
            trim: true,
            index: true
        }, // CNIC
        password: { type: String, required: [true, "Password is required"] },
        phoneNumber: { type: String, required: true, trim: true },
        gender: { type: String, enum: ["Male", "Female"], required: true },
        isGovtEmployee: { type: Boolean, required: true },
        role: { type: String, default: "AIC", immutable: true }, // Foundation for RBAC
        // Tracks which UCI registered this AIC so they populate in that UCI's selection list
        registeredBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "UCI",
            required: true,
            index: true
        },
        refreshToken: { type: String }
    },
    { timestamps: true }
);

aicSchema.pre("save", async function () {
    if (!this.isModified("password")) return 
    this.password = await bcrypt.hash(this.password, 10);
});

aicSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

aicSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, username: this.username, role: this.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

aicSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export const AIC = mongoose.model("AIC", aicSchema);