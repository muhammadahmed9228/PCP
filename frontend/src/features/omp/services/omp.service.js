import api from "../../../services/api";

export const ompService = {
  getOMP: async (teamId, day, routeId) => {
    const url = `/omp/team/${teamId}/day/${day}` + (routeId ? `?routeId=${routeId}` : "");
    const response = await api.get(url);
    return response.data;
  },
  saveDraft: async (teamId, day, ompData) => {
    // ompData must include routeId mapping
    const response = await api.post(`/omp/team/${teamId}/day/${day}`, ompData);
    return response.data;
  },
  finalizeOMP: async (teamId, day) => {
    const response = await api.patch(`/omp/team/${teamId}/day/${day}/finalize`);
    return response.data;
  }
};