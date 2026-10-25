import api from "../../../services/api";

export const campaignActivationService = {
  checkReadiness: async (campaignId) => {
    const response = await api.get(`/campaigns/${campaignId}/readiness`);
    return response.data;
  }
};
