import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { exportSheetToExcel } from "../../utils/excelExport";

const ExportExcelButton = ({ collectionName, data, disabled = false }) => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!data || isExporting) return;
    setIsExporting(true);
    try {
      await exportSheetToExcel(collectionName, data);
    } catch (error) {
      toast.error(error.response?.data?.message || t("exportFailed"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled || isExporting}
      className="inline-flex items-center rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isExporting ? t("exporting") : t("exportToExcel")}
    </button>
  );
};

export default ExportExcelButton;
