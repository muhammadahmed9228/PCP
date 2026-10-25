import mongoose from "mongoose";

const ucmpSchema = new mongoose.Schema(
    {
        // Relational linkages[cite: 1]
        campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true, unique: true },
        uci: { type: mongoose.Schema.Types.ObjectId, ref: "UCI", required: true },
        status: { type: String, enum: ["Draft", "Finalized"], default: "Draft" },

        // Sections 1, 2 & 3: Auto-populated Snapshot (Locked for historical accuracy)[cite: 1]
        sia: { type: String },
        campaignName: { type: String },
        district: { type: String },
        tehsil: { type: String },
        ucName: { type: String },
        uciChargeName: { type: String },
        uciPhoneNo: { type: String },
        
        // Section 3: Manual entries
        ucSecretary: { type: String },
        ucSecretaryPhoneNo: { type: String },
        vaccinatorName: { type: String },

        // Section 4: AIC Stats
        totalAICs: { type: Number },
        totalFemaleAICs: { type: Number },
        totalGovtAICs: { type: Number },
        aicsPastTwoCampaigns: { type: Number },

        // Section 5: Geography & Pre-campaign prep
        totalVillages: { type: Number },
        newRegionsAdded: { type: Number },
        teamsVisitedBefore: { type: Number },
        teamsWithHHInMaps: { type: Number },
        newHRMPRegistered: { type: Number },
        areaListsVerified: { type: Number },

        // Section 6: Current Campaign Planning (Populations)
        currentCampaignTotalHH: { type: Number }, // a
        totalUnder1Year: { type: Number }, // b
        totalBelow5Years: { type: Number }, // c
        totalHHChildren: { type: Number }, // d
        totalSchoolMadrasaChildren: { type: Number }, // e
        expectedFixedPointChildren: { type: Number }, // f
        expectedTransitPointChildren: { type: Number }, // g
        totalChildren: { type: Number }, // h (Calculated server-side)[cite: 1]

        // Section 7: Teams
        totalMobileTeams: { type: Number },
        totalFixedTeams: { type: Number },
        totalTransitTeams: { type: Number },
        teamsRequiringSpecialAttention: { type: Number },

        // Section 8: Capsules
        vitaminARed: { type: Number },
        vitaminABlue: { type: Number },

        // Section 9: Vaccines & Logistics
        totalVaccineDoses: { type: Number },
        totalTallysheets: { type: Number },
        totalChalkBoxes: { type: Number },
        markers: { type: Number },
        plasticBags: { type: Number },
        pens: { type: Number },
        totalBadgeCards: { type: Number },

        // Section 10: Mobile Teams Details
        mobileGovtPerson: { type: Number },
        mobileFemaleMember: { type: Number },
        mobileLocalPerson: { type: Number },
        bothAdults: { type: Boolean },
        highAttentionHRMPTotal: { type: Number },

        // Section 11: Vials
        vaccineVial: { type: Number },
        dropper: { type: Number },

        // Section 12: Social Mobilization
        totalRefusalChildren: { type: Number },
        totalMadrasas: { type: Number },
        totalMosques: { type: Number },
        totalHighSchools: { type: Number },
        totalSchoolsMadrasasBelow5: { type: Number },

        // Section 13: Children left in Past Campaign
        unvaccinatedLastCampaign: { type: Number },
        unvaccinatedPastTwoCampaigns: { type: Number },

        // Section 14: Record of under-dose
        totalUnderDoseChildren: { type: Number },
        protectedVaccinationsAfterLast: { type: Number }
    },
    { timestamps: true }
);

export const UCMP = mongoose.model("UCMP", ucmpSchema);