import api from "../../../services/api";

export const areaService = {
  createAreaAndAssign: async (areaData) => {
    const response = await api.post("/areas", areaData);
    return response.data;
  },
  getAreasForCampaign: async (campaignId) => {
    const response = await api.get(`/areas/campaign/${campaignId}`);
    return response.data;
  },
  updateArea: async (id, areaData) => {
    const response = await api.patch(`/areas/${id}`, areaData);
    return response.data;
  },
  deleteArea: async (id) => {
    const response = await api.delete(`/areas/${id}`);
    return response.data;
  }
};