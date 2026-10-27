import api from "../../../services/api";

export const aicService = {
  listAICs: async (query, signal) => {
    const response = await api.get("/aics", { params: query, signal });
    return response.data;
  },
  getAICsForUCI: async () => {
    const response = await api.get("/aics");
    return response.data;
  },
  registerAIC: async (aicData) => {
    const response = await api.post("/aics/register", aicData);
    return response.data;
  },
  updateAIC: async (id, aicData) => {
    const response = await api.patch(`/aics/${id}`, aicData);
    return response.data;
  },
  deleteAIC: async (id) => {
    const response = await api.delete(`/aics/${id}`);
    return response.data;
  },
  assignAicToCampaign: async (assignmentData) => {
    const response = await api.post("/aics/assign", assignmentData);
    return response.data;
  },
  unassignAicFromCampaign: async (unassignmentData) => {
    const response = await api.post("/aics/unassign", unassignmentData);
    return response.data;
  }
};
