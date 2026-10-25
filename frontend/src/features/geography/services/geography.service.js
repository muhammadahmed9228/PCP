import api from "../../../services/api";

export const geographyService = {
  getGeography: async (areaId) => {
    const response = await api.get(`/geography/area/${areaId}`);
    return response.data;
  },
  addRoute: async (routeData) => {
    const response = await api.post("/geography/routes", routeData);
    return response.data;
  },
  addPoint: async (pointData) => {
    const response = await api.post("/geography/points", pointData);
    return response.data;
  }
};