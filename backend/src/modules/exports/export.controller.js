import { asyncHandler } from "../../utils/asyncHandler.js";
import { buildExcelWorkbook, createExcelFilename } from "../../utils/excelExport.js";

export const exportExcel = asyncHandler(async (req, res) => {
  const { collectionName, data } = req.body;
  if (!collectionName || !data) {
    return res.status(400).json({ success: false, message: "collectionName and data are required" });
  }

  const workbook = await buildExcelWorkbook(data, collectionName);
  const filename = createExcelFilename(collectionName);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
});
