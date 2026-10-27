import ExcelJS from "exceljs";

const printableValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return value;
};

const collectScalarRows = (value, prefix = "", rows = []) => {
  if (Array.isArray(value)) return rows;
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) => {
      collectScalarRows(child, prefix ? `${prefix}.${key}` : key, rows);
    });
  } else if (prefix) {
    rows.push({ Field: prefix, Value: printableValue(value) });
  }
  return rows;
};

const addArraySheet = (workbook, name, values) => {
  const worksheet = workbook.addWorksheet(name.slice(0, 31) || "Data");
  const rows = values.map((value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, printableValue(item)]));
    }
    return { Value: printableValue(value) };
  });

  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  worksheet.columns = (columns.length ? columns : ["Value"]).map((key) => ({ header: key, key }));
  rows.forEach((row) => worksheet.addRow(row));
  return worksheet;
};

const formatWorksheet = (worksheet) => {
  const header = worksheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
  header.alignment = { vertical: "middle" };
  worksheet.views = [{ state: "frozen", ySplit: 1 }];

  worksheet.columns.forEach((column) => {
    let width = String(column.header || "").length + 2;
    column.eachCell({ includeEmpty: true }, (cell) => {
      width = Math.max(width, String(cell.value ?? "").length + 2);
    });
    column.width = Math.min(Math.max(width, 12), 45);
  });
};

export const buildExcelWorkbook = async (data, collectionName = "sheet") => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AIC Dashboard";
  workbook.created = new Date();

  const summary = workbook.addWorksheet("Summary");
  summary.columns = [
    { header: "Field", key: "Field" },
    { header: "Value", key: "Value" },
  ];
  collectScalarRows(data).forEach((row) => summary.addRow(row));

  if (data && typeof data === "object") {
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) addArraySheet(workbook, key, value);
    });
  }

  workbook.worksheets.forEach(formatWorksheet);
  return workbook;
};

export const createExcelFilename = (collectionName = "sheet") => {
  const safeName = String(collectionName).replace(/[^a-z0-9_-]+/gi, "_");
  const date = new Date().toISOString().slice(0, 10);
  return `${safeName}_${date}.xlsx`;
};
