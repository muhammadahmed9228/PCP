import { asyncHandler } from "../../utils/asyncHandler.js";
import { buildExcelWorkbook, createExcelFilename } from "../../utils/excelExport.js";
import { ApiError } from "../../utils/ApiError.js";
import { getSheet } from "./sheets/registry.js";

export const exportExcel = asyncHandler(async (req, res) => {
  const { collectionName, data, ...params } = req.body || {};
  if (!collectionName || typeof collectionName !== 'string') throw new ApiError(400, 'collectionName is required');
  const sheet = getSheet(collectionName);
  if (sheet) {
    if (sheet.load && !params.campaignId) throw new ApiError(400, 'campaignId is required');
    if (!sheet.load && !data) throw new ApiError(400, 'data is required');
    const record = sheet.load ? await sheet.load({ ...params, user: req.user, uciId: req.user._id }) : data;
    const workbook = await sheet.build(record);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${sheet.filename(record)}"`);
    await workbook.xlsx.write(res);
    return res.end();
  }
  if (!data) throw new ApiError(400, 'collectionName and data are required');

  const workbook = await buildExcelWorkbook(data, collectionName);
  const filename = createExcelFilename(collectionName);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
});
