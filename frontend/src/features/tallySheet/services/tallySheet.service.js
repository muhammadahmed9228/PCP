import api from "../../../services/api";

export const tallySheetService = {
  getTallySheet: async (teamId, day, routeId, campaignId) => {
    const response = await api.get(`/tally-sheets/team/${teamId}/day/${day}`, { params: { routeId, campaignId } });
    return response.data;
  },
  saveDraft: async (teamId, day, payload, campaignId) => {
    const response = await api.post(`/tally-sheets/team/${teamId}/day/${day}`, { ...payload, campaignId, expectedVersion: payload.__v ?? -1 });
    return response.data;
  },
  finalizeTallySheet: async (teamId, day, sheet, campaignId, routeId) => {
    const response = await api.patch(`/tally-sheets/team/${teamId}/day/${day}/finalize`, { campaignId, routeId: routeId || sheet?.route, expectedVersion: sheet?.__v });
    return response.data;
  },
  reopenTallySheet: async (teamId, day, reason) => {
    const response = await api.patch(`/tally-sheets/team/${teamId}/day/${day}/reopen`, { reason });
    return response.data;
  }
};
