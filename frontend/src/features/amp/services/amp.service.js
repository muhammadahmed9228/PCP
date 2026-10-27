import api from "../../../services/api";

export const ampService = {
  getAMP: async (areaId) => {
    const response = await api.get(`/amp/area/${areaId}`);
    return response.data;
  },
  saveDraft: async (areaId, ampData) => {
    const response = await api.post(`/amp/area/${areaId}`, ampData);
    return response.data;
  },
  finalizeAMP: async (areaId) => {
    const response = await api.patch(`/amp/area/${areaId}/finalize`);
    return response.data;
  },
  getReviewList: async (campaignId) => {
    const response = await api.get(`/amp/reviews/campaign/${campaignId}`);
    return response.data;
  },
  getReview: async (areaId) => {
    const response = await api.get(`/amp/reviews/area/${areaId}`);
    return response.data;
  },
  approveAMP: async (areaId) => {
    const response = await api.patch(`/amp/reviews/area/${areaId}/approve`);
    return response.data;
  },
  reopenAMP: async (areaId, reason) => {
    const response = await api.patch(`/amp/reviews/area/${areaId}/reopen`, { reason });
    return response.data;
  }
};
