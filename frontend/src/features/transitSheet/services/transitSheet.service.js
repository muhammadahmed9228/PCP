import api from "../../../services/api";

export const transitSheetService = {
  getTransitSheet: async (teamId, day, pointId, campaignId) => {
    const response = await api.get(`/transit-sheets/team/${teamId}/day/${day}`, { params: { pointId, campaignId } });
    return response.data;
  },
  saveDraft: async (teamId, day, payload, campaignId) => {
    // payload must include pointId
    const response = await api.post(`/transit-sheets/team/${teamId}/day/${day}`, { ...payload, campaignId, expectedVersion: payload.__v ?? -1 });
    return response.data;
  },
  finalizeTransitSheet: async (teamId, day, sheet, campaignId, pointId) => {
    const response = await api.patch(`/transit-sheets/team/${teamId}/day/${day}/finalize`, { campaignId, expectedVersion: sheet?.__v, pointId: pointId || sheet?.point });
    return response.data;
  },
  reopenTransitSheet: async (teamId, day, reason) => {
    const response = await api.patch(`/transit-sheets/team/${teamId}/day/${day}/reopen`, { reason });
    return response.data;
  }
};
