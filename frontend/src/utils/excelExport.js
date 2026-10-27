import api from "../services/api";

const getFilename = (collectionName, disposition) => {
  const match = disposition?.match(/filename="?([^";]+)"?/i);
  if (match?.[1]) return match[1];
  return `${collectionName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
};

export const exportSheetToExcel = async (collectionName, data) => {
  const response = await api.post(
    "/exports/excel",
    { collectionName, data },
    { responseType: "blob" }
  );
  const blobUrl = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = getFilename(collectionName, response.headers["content-disposition"]);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(blobUrl);
};
