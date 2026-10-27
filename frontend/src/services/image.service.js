import api from "./api";

export const imageService = {
  uploadUciImage: async (image, fileName) => (await api.post("/images/uci", { image, fileName })).data,
  uploadAreaImage: async (areaId, image, fileName) => (await api.post(`/images/area/${areaId}`, { image, fileName })).data,
  uploadGeographyImage: async (kind, id, image, fileName) => (await api.post(`/images/geography/${kind}/${id}`, { image, fileName })).data,
};
