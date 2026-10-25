import api from "../../../services/api"; // Your configured Axios instance

export const authService = {
  registerUCI: async (userData) => {
    const response = await api.post("/auth/uci/register", userData);
    return response.data;
  },
  loginUCI: async (credentials) => {
    const response = await api.post("/auth/uci/login", credentials);
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/auth/uci/logout");
    return response.data;
  },

  // Add to your existing authService
  loginAIC: async (credentials) => {
    const response = await api.post("/auth/aic/login", credentials);
    return response.data;
  },
  logout: async (role) => {
    // Proper logout/token invalidation strategy based on RBAC
    const endpoint = role === "AIC" ? "/auth/aic/logout" : "/auth/uci/logout";
    const response = await api.post(endpoint);
    return response.data;
  },

//TEAM AUTH
  loginTeam: async (credentials) => {
    const response = await api.post("/auth/team/login", credentials);
    return response.data;
  },
  logout: async (role) => {
    // Dynamic routing based on role
    let endpoint = "/auth/uci/logout";
    if (role === "AIC") endpoint = "/auth/aic/logout";
    if (role === "FieldTeam") endpoint = "/auth/team/logout";
    const response = await api.post(endpoint);
    return response.data;
  }

};
