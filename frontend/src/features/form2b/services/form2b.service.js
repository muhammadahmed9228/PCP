import api from "../../../services/api";

export const form2bService = {
  fetchOrGenerateDraft: async (campaignId, day) => {
    const response = await api.get(`/form2b/campaign/${campaignId}/day/${day}`);
    return response.data;
  },
  finalizeForm2B: async (campaignId, day) => {
    const response = await api.patch(`/form2b/campaign/${campaignId}/day/${day}/finalize`);
    return response.data;
  },
  reopenForm2B: async (campaignId, day, reason) => {
    const response = await api.patch(`/form2b/campaign/${campaignId}/day/${day}/reopen`, { reason });
    return response.data;
  }
};