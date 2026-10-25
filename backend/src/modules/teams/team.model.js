import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    cnic: { type: String, required: true, trim: true },
    // G = Govt, L = Local, F = Female (Not mutually exclusive)[cite: 1]
    states: [{ type: String, enum: ["G", "L", "F"] }],
    gender: { type: String, enum: ["Male", "Female"], required: true },
    roleType: { type: String, enum: ["LHW", "Volunteer"], required: true }
});

const teamSchema = new mongoose.Schema(
    {
        teamNo: { type: String, required: true, trim: true },
        teamType: { type: String, enum: ["Mobile", "Fixed", "Transit"], required: true },
        username: { type: String, required: true, unique: true, trim: true, index: true }, // CNIC[cite: 1]
        password: { type: String, required: true },
        
        leader: { type: teamMemberSchema, required: true },
        member: { type: teamMemberSchema, required: true },
        
        // RBAC: Tracks which AIC registered this team[cite: 1]
        registeredBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "AIC",
            required: true,
            index: true
        },
        role: { type: String, default: "FieldTeam", immutable: true },
        refreshToken: { type: String }
    },
    { timestamps: true }
);

teamSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);

});

teamSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export const Team = mongoose.model("Team", teamSchema);