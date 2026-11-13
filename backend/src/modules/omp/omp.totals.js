export const OMP_TOTAL_FIELDS = Object.freeze([
    'totalHouseholds', 'totalUnder1Year', 'total1to5Years', 'totalSchoolMadrasa', 'grandTotalChildren',
    'totalVaccineDoses', 'totalUnvaccinatedPast', 'totalMigrantMobile', 'vitaminARed', 'vitaminABlue',
    'marker', 'chalk', 'dropper', 'plasticBags'
]);

const numberOrNull = value => typeof value === 'number' && Number.isFinite(value) ? value : null;
const addPresent = values => {
    const present = values.filter(value => value !== null);
    return present.length ? present.reduce((sum, value) => sum + value, 0) : null;
};

// Pure calculation shared by the API and future team-specific exports.
export function calculateTeamOmpTotals(records) {
    const days = [1, 2, 3].map(day => {
        const record = records.find(item => item.campaignDay === day);
        const values = Object.fromEntries(OMP_TOTAL_FIELDS.filter(key => key !== 'grandTotalChildren').map(key => [key, numberOrNull(record?.[key])]));
        values.grandTotalChildren = addPresent([values.totalUnder1Year, values.total1to5Years, values.totalSchoolMadrasa]);
        return { day, status: record?.status ?? null, values };
    });
    const totals = Object.fromEntries(OMP_TOTAL_FIELDS.map(key => [key, addPresent(days.map(day => day.values[key]))]));
    return { days, totals };
}
