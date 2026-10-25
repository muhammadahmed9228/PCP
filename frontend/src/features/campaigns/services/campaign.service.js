import api from "../../../services/api";

export const campaignService = {
  getAllCampaigns: async () => {
    const response = await api.get("/campaigns");
    return response.data;
  },
  createCampaign: async (campaignData) => {
    const response = await api.post("/campaigns", campaignData);
    return response.data;
  },
  updateCampaign: async (id, campaignData) => {
    const response = await api.patch(`/campaigns/${id}`, campaignData);
    return response.data;
  },
  deleteCampaign: async (id) => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  },
  updateCampaignStatus: async (id, status) => {
    const response = await api.patch(`/campaigns/${id}/status`, { status });
    return response.data;
  },
};