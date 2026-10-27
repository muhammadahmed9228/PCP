import api from "../../../services/api";

export const geographyService = {
  getGeography: async (areaId) => {
    const response = await api.get(`/geography/area/${areaId}`);
    return response.data;
  },
  listRoutes: async (areaId, params, signal) => {
    const response = await api.get(`/geography/area/${areaId}/routes`, { params, signal });
    return response.data;
  },
  listPoints: async (areaId, params, signal) => {
    const response = await api.get(`/geography/area/${areaId}/points`, { params, signal });
    return response.data;
  },
  addRoute: async (routeData) => {
    const response = await api.post("/geography/routes", routeData);
    return response.data;
  },
  addPoint: async (pointData) => {
    const response = await api.post("/geography/points", pointData);
    return response.data;
  },
  updateRoute: async (id, data) => {
    const response = await api.patch(`/geography/routes/${id}`, data);
    return response.data;
  },
  deleteRoute: async (id) => {
    const response = await api.delete(`/geography/routes/${id}`);
    return response.data;
  },
  unassignRoute: async (id) => {
    const response = await api.patch(`/geography/routes/${id}/unassign`);
    return response.data;
  },
  assignRoute: async (id, teamId) => {
    const response = await api.patch(`/geography/routes/${id}/assign`, { teamId });
    return response.data;
  },
  updatePoint: async (id, data) => {
    const response = await api.patch(`/geography/points/${id}`, data);
    return response.data;
  },
  deletePoint: async (id) => {
    const response = await api.delete(`/geography/points/${id}`);
    return response.data;
  },
  unassignPoint: async (id) => {
    const response = await api.patch(`/geography/points/${id}/unassign`);
    return response.data;
  },
  assignPoint: async (id, teamId) => {
    const response = await api.patch(`/geography/points/${id}/assign`, { teamId });
    return response.data;
  }
};
