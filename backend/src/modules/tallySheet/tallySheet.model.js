import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";

// -------------------------------------------------------------
// Sub-Schemas for Data Arrays
// -------------------------------------------------------------

const householdSchema = new mongoose.Schema({
    houseNo: { type: String, required: true, trim: true },
    classification: { 
        type: String, 
        enum: ["Normal", "MMP", "L", "0/0"], 
        default: "Normal" 
    },
    // House Children
    childrenUnder5: { type: Number, default: 0 }, // A
    vacc0to1: { type: Number, default: 0 },
    vacc1to5: { type: Number, default: 0 },
    totalVacc: { type: Number, default: 0 }, // B (Auto-calculated)
    unvacc: { type: Number, default: 0 }, // A - B (Auto-calculated)
    
    // Guest Children
    guestUnder5: { type: Number, default: 0 }, // G
    guestVacc: { type: Number, default: 0 }, // H
    guestUnvacc: { type: Number, default: 0 } // G - H (Auto-calculated)
}, { _id: false });

const schoolMadrasaSchema = new mongoose.Schema({
    schoolNo: { type: String, required: true },
    schoolName: { type: String, required: true },
    childrenUnder5: { type: Number, default: 0 },
    vaccinated: { type: Number, default: 0 } // S
}, { _id: false });

// const unvaccChildSchema = new mongoose.Schema({
//     houseNo: { type: String, required: true },
//     childName: { type: String, required: true },
//     age: { type: String, required: true },
//     fatherName: { type: String, required: true },
//     reason: { type: String, required: true },
//     dateOfReturn: { type: Date },
//     nextVaccinationDate: { type: Date }
// }, { _id: false });

const unvaccChildSchema = new mongoose.Schema({
    houseNo: { type: String, required: true },
    childName: { type: String, required: true },
    ageGroup: { 
        type: String, 
        enum: ["Under 1", "1 to 5"], 
        required: true 
    },
    age: { type: String, required: true }, // Exact age in months/years for display
    fatherName: { type: String, required: true },
    reason: { 
        type: String, 
        enum: ["Not Available", "Refusal"], 
        required: true 
    },
    coveredSameDay: { type: Boolean, default: false },
    dateOfReturn: { type: Date },
    nextVaccinationDate: { type: Date }
}, { _id: false });

const refusedAbsentGuestSchema = new mongoose.Schema({
    houseNo: { type: String, required: true },
    childName: { type: String, required: true },
    age: { type: String, required: true },
    fatherName: { type: String, required: true },
    reason: { type: String, enum: ["Refused", "Absent"], required: true },
    dateOfReturn: { type: Date },
    nextVaccinationDate: { type: Date }
}, { _id: false });

const routineImmSchema = new mongoose.Schema({
    houseNo: { type: String },
    childName: { type: String },
    age: { type: String },
    fatherName: { type: String },
    address: { type: String },
    phoneNo: { type: String }
}, { _id: false });

const weaknessParalysisSchema = new mongoose.Schema({
    houseNo: { type: String },
    childName: { type: String },
    age: { type: String },
    fatherName: { type: String },
    address: { type: String },
    phoneNo: { type: String },
    dateOfDiagnosis: { type: Date }
}, { _id: false });

// -------------------------------------------------------------
// Main Tally Sheet Schema
// -------------------------------------------------------------

const tallySheetSchema = new mongoose.Schema(
    {
        // Reference Links & State
        campaign: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
        area: { type: mongoose.Schema.Types.ObjectId, ref: "Area", required: true },
        uci: { type: mongoose.Schema.Types.ObjectId, ref: "UCI", required: true },
        aic: { type: mongoose.Schema.Types.ObjectId, ref: "AIC", required: true },
        route: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
        campaignDay: { type: Number, enum: [1, 2, 3], required: true },
        status: { type: String, enum: ["Draft", "Finalized"], default: "Draft" },

        // Sections 1-4: Snapshot Auto-populated Info
        snapshot: {
            campaignName: String, sia: String, uciName: String, uciNo: String,
            aicName: String, aicNo: String, province: String, district: String,
            tehsil: String, ucName: String, ucNo: String, areaName: String,
            areaNo: String, routeName: String, routeNo: String, teamNo: String,
            teamLeaderName: String, teamMemberName: String
        },

        // Section 5: Route Household Information
        headOfFirstHouse: { type: String },
        headOfLastHouse: { type: String },

        // Section 6: Households (Max 119)
        households: {
            type: [householdSchema],
            validate: [arr => arr.length <= 119, "Maximum 119 households allowed"]
        },

        // Section 7: School / Madrasa (Max 4)
        schools: {
            type: [schoolMadrasaSchema],
            validate: [arr => arr.length <= 4, "Maximum 4 schools/madrasas allowed"]
        },

        // Section 8 & 9: Street, AFP, Zero Dose
        streetVaccinated: { type: Number, default: 0 }, // D
        afpCasesNoticed: { type: Number, default: 0 },
        zeroDoseRIRecorded: { type: Number, default: 0 },

        // Section 10 & 11: Unvaccinated Links
        unvaccinatedChildren: [unvaccChildSchema],
        refusedAbsentGuests: [refusedAbsentGuestSchema],

        // Section 12 & 13: Routine Imm & Paralysis
        routineImmunization: {
            type: [routineImmSchema],
            validate: [arr => arr.length <= 5, "Maximum 5 RI entries allowed"]
        },
        weaknessParalysis: {
            type: [weaknessParalysisSchema],
            validate: [arr => arr.length <= 2, "Maximum 2 weakness/paralysis entries allowed"]
        },

        // Section 14: Logistics Record
        logistics: {
            vaccines: {
                received: { sealPacked: { type: Number, default: 0 }, partiallyUsed: { type: Number, default: 0 } },
                returned: { sealPacked: { type: Number, default: 0 }, partiallyUsed: { type: Number, default: 0 } },
                used: { sealPacked: { type: Number, default: 0 }, partiallyUsed: { type: Number, default: 0 } }
            },
            capsules: {
                received: { red: { type: Number, default: 0 }, blue: { type: Number, default: 0 } },
                used: { red: { type: Number, default: 0 }, blue: { type: Number, default: 0 } },
                returned: { red: { type: Number, default: 0 }, blue: { type: Number, default: 0 } }
            },
            markers: {
                received: { type: Number, default: 0 },
                used: { type: Number, default: 0 },
                returned: { type: Number, default: 0 }
            }
        },

        // Auto-Calculated Summary Data (Stored for Form 2A aggregation)
        summary: {
            houseChildrenUnder5: { type: Number, default: 0 }, // Sum of A
            vacc0to1: { type: Number, default: 0 },
            vacc1to5: { type: Number, default: 0 },
            houseVaccTotal: { type: Number, default: 0 }, // Sum of B
            houseUnvaccTotal: { type: Number, default: 0 }, // Sum of A - B
            
            guestUnder5: { type: Number, default: 0 }, // Sum of G
            guestVaccTotal: { type: Number, default: 0 }, // Sum of H
            guestUnvaccTotal: { type: Number, default: 0 }, // Sum of G - H
            
            schoolVaccTotal: { type: Number, default: 0 }, // Sum of S
            streetVaccTotal: { type: Number, default: 0 }, // Sum of D
            grandTotalVacc: { type: Number, default: 0 }, // B + S + D + G(H)
            
            mmpTotalChildren: { type: Number, default: 0 },
            mmpVaccTotal: { type: Number, default: 0 },
            
            zeroHousesTotal: { type: Number, default: 0 },
            lockHousesTotal: { type: Number, default: 0 },

            recordedMissed: {
                notAvailable: { under1: { type: Number, default: 0 }, oneToFive: { type: Number, default: 0 } },
                refusal: { under1: { type: Number, default: 0 }, oneToFive: { type: Number, default: 0 } }
            },
            coveredMissed: {
                notAvailable: { under1: { type: Number, default: 0 }, under5: { type: Number, default: 0 } },
                refusal: { under1: { type: Number, default: 0 }, oneToFive: { type: Number, default: 0 } }
            }

            
        }
    },
    { timestamps: true }
);

// Prevent duplicate Tally Sheets for the same team on the same day in the same campaign
tallySheetSchema.index({ campaign: 1, team: 1, campaignDay: 1 }, { unique: true });

// -------------------------------------------------------------
// Pre-Save Middleware: Enforcement Engine & Auto-Calculations
// -------------------------------------------------------------
tallySheetSchema.pre("save", function (next) {
    let sumHouseChildren = 0, sumVacc0to1 = 0, sumVacc1to5 = 0, sumHouseVacc = 0, sumHouseUnvacc = 0;
    let sumGuestChildren = 0, sumGuestVacc = 0, sumGuestUnvacc = 0;
    let sumSchoolVacc = 0, sumMmpChildren = 0, sumMmpVacc = 0;
    let zeroHouses = 0, lockHouses = 0;

    // Track linked requirements
    const requiredUnvaccRows = {};
    const requiredGuestRows = {};

    // 1. Process Section 6 (Households)
    if (this.households && this.households.length > 0) {
        this.households.forEach((house) => {
            // Lock or 0/0 Logic override
            if (house.classification === "L" || house.classification === "0/0") {
                house.childrenUnder5 = 0; house.vacc0to1 = 0; house.vacc1to5 = 0;
                house.guestUnder5 = 0; house.guestVacc = 0;
                
                if (house.classification === "L") lockHouses++;
                if (house.classification === "0/0") zeroHouses++;
            }

            // Calculations per row
            house.totalVacc = (house.vacc0to1 || 0) + (house.vacc1to5 || 0);
            house.unvacc = Math.max(0, (house.childrenUnder5 || 0) - house.totalVacc);
            house.guestUnvacc = Math.max(0, (house.guestUnder5 || 0) - (house.guestVacc || 0));

            // Data Validation Check
            if (house.totalVacc > house.childrenUnder5) {
                throw new ApiError(400, `House ${house.houseNo}: Vaccinated children cannot exceed total children under 5.`);
            }
            if (house.guestVacc > house.guestUnder5) {
                throw new ApiError(400, `House ${house.houseNo}: Vaccinated guests cannot exceed total guests under 5.`);
            }

            // Linking Requirments mapping
            if (house.unvacc > 0) requiredUnvaccRows[house.houseNo] = house.unvacc;
            if (house.guestUnvacc > 0) requiredGuestRows[house.houseNo] = house.guestUnvacc;

            // Aggregating for Summary
            sumHouseChildren += house.childrenUnder5;
            sumVacc0to1 += house.vacc0to1;
            sumVacc1to5 += house.vacc1to5;
            sumHouseVacc += house.totalVacc;
            sumHouseUnvacc += house.unvacc;

            sumGuestChildren += house.guestUnder5;
            sumGuestVacc += house.guestVacc;
            sumGuestUnvacc += house.guestUnvacc;

            if (house.classification === "MMP") {
                sumMmpChildren += house.childrenUnder5;
                sumMmpVacc += house.totalVacc;
            }
        });
    }

    // 2. Process Section 7 (Schools)
    if (this.schools && this.schools.length > 0) {
        this.schools.forEach(school => {
            sumSchoolVacc += (school.vaccinated || 0);
        });
    }

    // Process Section 10 (Unvaccinated Children -> Recorded & Covered Missed Breakdown)
    const recordedMissed = {
        notAvailable: { under1: 0, oneToFive: 0 },
        refusal: { under1: 0, oneToFive: 0 }
    };
    const coveredMissed = {
        notAvailable: { under1: 0, under5: 0 },
        refusal: { under1: 0, oneToFive: 0 }
    };

    if (this.unvaccinatedChildren && this.unvaccinatedChildren.length > 0) {
        this.unvaccinatedChildren.forEach((child) => {
            const isUnder1 = child.ageGroup === "Under 1";
            const isNA = child.reason === "Not Available";
            const isRefusal = child.reason === "Refusal";

            // Field 6: Recorded Missed
            if (isNA) {
                if (isUnder1) recordedMissed.notAvailable.under1++;
                else recordedMissed.notAvailable.oneToFive++;
            } else if (isRefusal) {
                if (isUnder1) recordedMissed.refusal.under1++;
                else recordedMissed.refusal.oneToFive++;
            }

            // Field 7: Covered Missed (Same-Day Catch-Up)
            if (child.coveredSameDay) {
                if (isNA) {
                    if (isUnder1) coveredMissed.notAvailable.under1++;
                    else coveredMissed.notAvailable.under5++; // 7.1.2 Under 5 (1-5y bucket)
                } else if (isRefusal) {
                    if (isUnder1) coveredMissed.refusal.under1++;
                    else coveredMissed.refusal.oneToFive++;
                }
            }
        });
    }

    // 3. Construct Summary Object
    this.summary = {
        houseChildrenUnder5: sumHouseChildren,
        vacc0to1: sumVacc0to1,
        vacc1to5: sumVacc1to5,
        houseVaccTotal: sumHouseVacc,
        houseUnvaccTotal: sumHouseUnvacc,
        guestUnder5: sumGuestChildren,
        guestVaccTotal: sumGuestVacc,
        guestUnvaccTotal: sumGuestUnvacc,
        schoolVaccTotal: sumSchoolVacc,
        streetVaccTotal: this.streetVaccinated || 0,
        // Grand Total: House Vacc + School Vacc + Street Vacc + Guest Vacc
        grandTotalVacc: sumHouseVacc + sumSchoolVacc + (this.streetVaccinated || 0) + sumGuestVacc,
        mmpTotalChildren: sumMmpChildren,
        mmpVaccTotal: sumMmpVacc,
        zeroHousesTotal: zeroHouses,
        lockHousesTotal: lockHouses,
        recordedMissed: recordedMissed,
        coveredMissed: coveredMissed
        
    };

    // 4. Strict Validation on Finalize (Linking Logic & Row enforcement)
    if (this.status === "Finalized") {
        // Unvaccinated Children Verification (Section 6 -> 10)
        const actualUnvaccRows = {};
        if (this.unvaccinatedChildren) {
            this.unvaccinatedChildren.forEach(child => {
                actualUnvaccRows[child.houseNo] = (actualUnvaccRows[child.houseNo] || 0) + 1;
            });
        }

        for (const houseNo in requiredUnvaccRows) {
            if ((actualUnvaccRows[houseNo] || 0) !== requiredUnvaccRows[houseNo]) {
                throw new ApiError(400, `Linking Rule Failed: House ${houseNo} has ${requiredUnvaccRows[houseNo]} unvaccinated children, but Section 10 has ${actualUnvaccRows[houseNo] || 0} rows.`);
            }
        }
        // Ensure no extra rows in Section 10 for houses that don't need them
        for (const houseNo in actualUnvaccRows) {
            if (!requiredUnvaccRows[houseNo]) {
                throw new ApiError(400, `Linking Rule Failed: House ${houseNo} has 0 unvaccinated children, but a row exists in Section 10.`);
            }
        }

        // Refused/Absent Guests Verification (Section 6 -> 11)
        const actualGuestRows = {};
        if (this.refusedAbsentGuests) {
            this.refusedAbsentGuests.forEach(guest => {
                actualGuestRows[guest.houseNo] = (actualGuestRows[guest.houseNo] || 0) + 1;
            });
        }

        for (const houseNo in requiredGuestRows) {
            if ((actualGuestRows[houseNo] || 0) !== requiredGuestRows[houseNo]) {
                throw new ApiError(400, `Linking Rule Failed: House ${houseNo} has ${requiredGuestRows[houseNo]} unvacc guests, but Section 11 has ${actualGuestRows[houseNo] || 0} rows.`);
            }
        }
        for (const houseNo in actualGuestRows) {
            if (!requiredGuestRows[houseNo]) {
                throw new ApiError(400, `Linking Rule Failed: House ${houseNo} has 0 unvacc guests, but a row exists in Section 11.`);
            }
        }
    }

    if (typeof next === "function") next();
});

export const TallySheet = mongoose.model("TallySheet", tallySheetSchema);