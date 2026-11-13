// One interpretation for bootstrap, write guards and AIC management, including legacy areas.
export const getTeamDayState = (area, teamId, teamType) => {
    const state = area.fieldDay || {};
    if (state.teamControlVersion === 1) {
        const teamState = state.teams?.find(item => String(item.team) === String(teamId));
        return { enabledDay: teamState?.enabledDay ?? null, lastDay: teamState?.lastDay ?? null };
    }
    const maxDay = teamType === "Mobile" ? 3 : 7;
    return {
        enabledDay: state.enabledDay != null && state.enabledDay <= maxDay ? state.enabledDay : null,
        lastDay: state.lastDay == null ? null : Math.min(state.lastDay, maxDay)
    };
};

export const teamDayActionAllowed = (row, day, action) => {
    if (row.assignmentCount !== 1) return false;
    if (action === "enable") return row.planningReady && row.enabledDay == null && (row.lastDay == null || day === row.lastDay + 1);
    return row.enabledDay === day && row.status === "Finalized" && !row.unfinishedSheets;
};
