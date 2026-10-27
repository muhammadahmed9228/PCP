import api from "../../../services/api";

export const teamService = {
  listTeams: async (query, signal) => {
    const response = await api.get("/teams", { params: query, signal });
    return response.data;
  },
  getTeams: async () => {
    const response = await api.get("/teams");
    return response.data;
  },
  registerTeam: async (teamData) => {
    const response = await api.post("/teams/register", teamData);
    return response.data;
  },
  assignTeam: async (assignmentData) => {
    const response = await api.post("/teams/assign", assignmentData);
    return response.data;
  },
  updateTeam: async (id, teamData) => {
    const response = await api.patch(`/teams/${id}`, teamData);
    return response.data;
  },
  deleteTeam: async (id) => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  }
};
