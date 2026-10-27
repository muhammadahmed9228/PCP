import api from "../../../services/api";

export const profileService = {
  getCurrentUser: async () => (await api.get("/auth/me")).data,
  updateProfile: async (profile) => (await api.patch("/auth/profile", profile)).data,
};
