import mongoose from "mongoose";

const ompSchema = new mongoose.Schema(
    {
        // Relational linkages enforcing constraints[cite: 1]
        campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
        area: { type: mongoose.Schema.Types.ObjectId, ref: "Area", required: true },
        uci: { type: mongoose.Schema.Types.ObjectId, ref: "UCI", required: true },
        aic: { type: mongoose.Schema.Types.ObjectId, ref: "AIC", required: true },
        route: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
        campaignDay: { type: Number, enum: [1, 2, 3], required: true },
        status: { type: String, enum: ["Draft", "Finalized"], default: "Draft" },

        // Section 0: Snapshot Auto-populated Configuration
        campaignName: { type: String },
        sia: { type: String },
        uciNo: { type: String },
        uciName: { type: String },
        ucNumber: { type: String },
        ucName: { type: String },
        province: { type: String },
        district: { type: String },
        tehsil: { type: String },
        aicName: { type: String },
        aicNo: { type: String },
        areaNo: { type: String },
        areaName: { type: String },
        routeNo: { type: String },
        routeName: { type: String },

        // Section 1: Team Information (Auto-populated Snapshot)
        teamNo: { type: String },
        teamLeader: {
            name: { type: String },
            position: { type: String },
            cnic: { type: String },
            states: [{ type: String }]
        },
        teamMember: {
            name: { type: String },
            position: { type: String },
            cnic: { type: String },
            states: [{ type: String }]
        },

        // Section 2: Campaign Information (Manual Entry)
        villageName: { type: String },
        placeName: { type: String },
        communityVaccinationPlace: { type: String },
        workSequence: { type: String },
        headOfFirstHouse: { type: String },
        headOfLastHouse: { type: String },
        areaCategory: { type: String, enum: ["G1", "G2", "G3"] },
        totalHouseholds: { type: Number },
        
        // Children Population
        totalUnder1Year: { type: Number },
        total1to5Years: { type: Number },
        totalSchoolMadrasa: { type: Number },
        grandTotalChildren: { type: Number }, // Auto-calculated server-side
        
        totalVaccineDoses: { type: Number },
        totalUnvaccinatedPast: { type: Number },
        totalMigrantMobile: { type: Number },
        
        // Vitamin A
        vitaminARed: { type: Number },
        vitaminABlue: { type: Number },

        // Section 3: Material Required
        marker: { type: Number },
        chalk: { type: Number },
        dropper: { type: Number },
        plasticBags: { type: Number }
    },
    { timestamps: true }
);

// Prevent duplicate OMPs for the same team on the same day in the same campaign[cite: 1]
ompSchema.index({ campaign: 1, team: 1, campaignDay: 1 }, { unique: true });

export const OMP = mongoose.model("OMP", ompSchema);