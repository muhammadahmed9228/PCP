import api from "../../../services/api";

export const teamService = {
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
  }
};