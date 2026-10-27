import api from "../../../services/api";

export const form2aService = {
  // Using GET as defined in our routes, since it automatically generates or updates the draft
  fetchOrGenerateDraft: async (areaId, day) => {
    const response = await api.get(`/form2a/area/${areaId}/day/${day}`);
    return response.data;
  },
  finalizeForm2A: async (areaId, day) => {
    const response = await api.patch(`/form2a/area/${areaId}/day/${day}/finalize`);
    return response.data;
  },
  reopenForm2A: async (areaId, day, reason) => {
    const response = await api.patch(`/form2a/area/${areaId}/day/${day}/reopen`, { reason });
    return response.data;
  }
};
