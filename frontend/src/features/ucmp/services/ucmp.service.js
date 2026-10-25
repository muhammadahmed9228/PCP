import api from "../../../services/api";

export const ucmpService = {
  getUCMP: async (campaignId) => {
    const response = await api.get(`/ucmp/campaign/${campaignId}`);
    return response.data;
  },
  saveDraft: async (campaignId, ucmpData) => {
    const response = await api.post(`/ucmp/campaign/${campaignId}`, ucmpData);
    return response.data;
  },
  finalizeUCMP: async (campaignId) => {
    const response = await api.patch(`/ucmp/campaign/${campaignId}/finalize`);
    return response.data;
  }
};