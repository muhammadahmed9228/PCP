import api from "../../../services/api";

export const fixedSheetService = {
  getFixedSheet: async (teamId, day, pointId) => {
    const url = `/fixed-sheets/team/${teamId}/day/${day}` + (pointId ? `?pointId=${pointId}` : "");
    const response = await api.get(url);
    return response.data;
  },
  saveDraft: async (teamId, day, payload) => {
    // payload must include pointId
    const response = await api.post(`/fixed-sheets/team/${teamId}/day/${day}`, payload);
    return response.data;
  },
  finalizeFixedSheet: async (teamId, day) => {
    const response = await api.patch(`/fixed-sheets/team/${teamId}/day/${day}/finalize`);
    return response.data;
  }
};