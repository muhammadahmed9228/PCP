import { ApiError } from "../../utils/ApiError.js";

const asNumber = (value, field) => {
    const number = Number(value ?? 0);
    if (!Number.isFinite(number) || number < 0) {
        throw new ApiError(400, `${field} must be a non-negative number.`);
    }
    return number;
};

const sumObjectValues = (value) => Object.values(value || {}).reduce((sum, item) => sum + asNumber(item, "Logistics value"), 0);

export const validateLogisticsConservation = (logistics, label = "Sheet") => {
    const vaccines = logistics?.vaccines || {};
    const vaccineReceived = sumObjectValues(vaccines.received);
    const vaccineUsed = sumObjectValues(vaccines.used);
    const vaccineReturned = sumObjectValues(vaccines.returned);
    if (vaccineReceived !== vaccineUsed + vaccineReturned) {
        throw new ApiError(400, `${label}: vaccine received must equal used plus returned.`);
    }

    const capsules = logistics?.capsules || {};
    for (const color of ["red", "blue"]) {
        const received = asNumber(capsules.received?.[color], `${label} Vitamin A ${color} received`);
        const used = asNumber(capsules.used?.[color], `${label} Vitamin A ${color} used`);
        const returned = asNumber(capsules.returned?.[color], `${label} Vitamin A ${color} returned`);
        if (received !== used + returned) {
            throw new ApiError(400, `${label}: Vitamin A ${color} received must equal used plus returned.`);
        }
    }

    const markers = logistics?.markers || {};
    const markerReceived = asNumber(markers.received, `${label} markers received`);
    const markerUsed = asNumber(markers.used, `${label} markers used`);
    const markerReturned = asNumber(markers.returned, `${label} markers returned`);
    if (markerReceived !== markerUsed + markerReturned) {
        throw new ApiError(400, `${label}: markers received must equal used plus returned.`);
    }
};

export const validateTallySheetPayload = (payload) => {
    for (const [index, household] of (payload.households || []).entries()) {
        const childrenUnder5 = household.classification === "L" || household.classification === "0/0"
            ? 0
            : asNumber(household.childrenUnder5, `Household ${index + 1} children under 5`);
        const vaccinated = household.classification === "L" || household.classification === "0/0"
            ? 0
            : asNumber(household.vacc0to1, `Household ${index + 1} vaccinated under 1`) + asNumber(household.vacc1to5, `Household ${index + 1} vaccinated 1 to 5`);
        const guestUnder5 = household.classification === "L" || household.classification === "0/0"
            ? 0
            : asNumber(household.guestUnder5, `Household ${index + 1} guests under 5`);
        const guestVacc = household.classification === "L" || household.classification === "0/0"
            ? 0
            : asNumber(household.guestVacc, `Household ${index + 1} vaccinated guests`);

        if (vaccinated > childrenUnder5) {
            throw new ApiError(400, `Household ${index + 1}: vaccinated children cannot exceed children under 5.`);
        }
        if (guestVacc > guestUnder5) {
            throw new ApiError(400, `Household ${index + 1}: vaccinated guests cannot exceed guests under 5.`);
        }
    }

    for (const [index, school] of (payload.schools || []).entries()) {
        const childrenUnder5 = asNumber(school.childrenUnder5, `School ${index + 1} children under 5`);
        const vaccinated = asNumber(school.vaccinated, `School ${index + 1} vaccinated children`);
        if (vaccinated > childrenUnder5) {
            throw new ApiError(400, `School ${index + 1}: vaccinated children cannot exceed children under 5.`);
        }
    }

    validateLogisticsConservation(payload.logistics, "Tally Sheet");
};

export const validateFixedSheetPayload = (payload) => {
    validateLogisticsConservation(payload.logistics, "Fixed Sheet");
};

export const validateTransitSheetPayload = (payload) => {
    asNumber(payload.vaccinatedChildrenCount, "Transit Sheet vaccinated children");
    validateLogisticsConservation(payload.logistics, "Transit Sheet");
};
