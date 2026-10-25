import api from "../../../services/api";

export const contextService = {
  getOperationalContext: async () => {
    const response = await api.get("/context/bootstrap");
    return response.data;
  }
};