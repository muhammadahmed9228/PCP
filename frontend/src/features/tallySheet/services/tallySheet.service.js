import api from "../../../services/api";

export const tallySheetService = {
  getTallySheet: async (teamId, day) => {
    const response = await api.get(`/tally-sheets/team/${teamId}/day/${day}`);
    return response.data;
  },
  saveDraft: async (teamId, day, payload) => {
    const response = await api.post(`/tally-sheets/team/${teamId}/day/${day}`, payload);
    return response.data;
  },
  finalizeTallySheet: async (teamId, day) => {
    const response = await api.patch(`/tally-sheets/team/${teamId}/day/${day}/finalize`);
    return response.data;
  }
};