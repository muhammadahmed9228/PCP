import mongoose from "mongoose";

const ampSchema = new mongoose.Schema(
    {
        // Relational linkages enforcing hierarchical access[cite: 1]
        campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
        area: { type: mongoose.Schema.Types.ObjectId, ref: "Area", required: true, unique: true },
        uci: { type: mongoose.Schema.Types.ObjectId, ref: "UCI", required: true },
        aic: { type: mongoose.Schema.Types.ObjectId, ref: "AIC", required: true },
        status: { type: String, enum: ["Draft", "Finalized"], default: "Draft" },

        // Section 1: Auto-populated Snapshot Configuration
        sia: { type: String },
        areaNo: { type: String },
        areaName: { type: String },
        uciName: { type: String },
        uciNo: { type: String },

        // Section 2: Auto-populated Snapshot Configuration
        campaignName: { type: String },
        district: { type: String },
        tehsil: { type: String },
        ucName: { type: String },
        ucNumber: { type: String },

        // Section 3: Auto-populated & Manual
        aicName: { type: String },
        aicPhoneNo: { type: String },
        isGovtEmployee: { type: Boolean },
        aicGender: { type: String },
        vaccinatorName: { type: String }, // Manual entry

        // Section 4: Current Campaign Planning
        currentCampaignTotalHH: { type: Number }, // a
        totalBelow5Years: { type: Number }, // b
        totalHHChildren: { type: Number }, // c
        totalSchoolMadrasaChildren: { type: Number }, // d
        expectedFixedPointChildren: { type: Number }, // e
        expectedTransitPointChildren: { type: Number }, // f
        totalChildren: { type: Number }, // g (Calculated server-side: c+d+e+f)[cite: 1]

        // Section 5: Teams
        totalMobileTeams: { type: Number },
        totalFixedTeams: { type: Number },
        totalTransitTeams: { type: Number },
        teamsRequiringSpecialAttention: { type: Number },

        // Section 6: Vaccine Carrier
        vaccineCarrierRequired: { type: Number },
        vaccineCarrierAvailable: { type: Number },

        // Section 7: Capsules
        vitaminARed: { type: Number },
        vitaminABlue: { type: Number },

        // Section 8: Vaccines
        totalVaccineDoses: { type: Number },
        totalTallysheets: { type: Number },
        totalChalkBoxes: { type: Number },
        markers: { type: Number },
        plasticBags: { type: Number },
        pens: { type: Number },
        totalBadgeCards: { type: Number },

        // Section 9: Mobile Teams Attributes
        mobileGovtPerson: { type: Number },
        mobileFemaleMember: { type: Number },
        mobileLocalPerson: { type: Number },
        bothAdults: { type: Boolean },

        // Section 10: Vials
        vaccineVial: { type: Number },
        dropper: { type: Number },

        // Section 11: Social Mobilization
        totalRefusalChildren: { type: Number },
        totalMadrasas: { type: Number },
        totalMosques: { type: Number },
        totalHighSchools: { type: Number },
        totalSchoolsMadrasasBelow5: { type: Number },

        // Section 12: Children left in Past Campaign
        unvaccinatedLastCampaign: { type: Number },
        unvaccinatedPastTwoCampaigns: { type: Number },

        // Section 13: Under-dose
        totalUnderDoseChildren: { type: Number },
        protectedVaccinationsAfterLast: { type: Number }
    },
    { timestamps: true }
);

export const AMP = mongoose.model("AMP", ampSchema);