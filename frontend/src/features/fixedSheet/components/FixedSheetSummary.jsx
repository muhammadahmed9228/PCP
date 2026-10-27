import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

const FixedSheetSummary = () => {
  const { control } = useFormContext();
  const { t } = useTranslation();
  const vaccinatedChildren = useWatch({ control, name: "vaccinatedChildren" }) || [];
  const unvaccinatedChildren = useWatch({ control, name: "unvaccinatedChildren" }) || [];

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">{t("liveSummary")}</h3>
      <div className="grid grid-cols-2 gap-4 text-sm max-w-md">
        <div className="bg-green-100 p-3 rounded border border-green-300 flex flex-col items-center">
          <p className="text-green-800 font-bold">{t("totalVaccinated")}</p>
          <p className="text-3xl font-black text-green-700">{vaccinatedChildren.length}</p>
        </div>
        <div className="bg-red-50 p-3 rounded border border-red-200 flex flex-col items-center">
          <p className="text-red-800 font-bold">{t("totalUnvaccinated")}</p>
          <p className="text-3xl font-black text-red-600">{unvaccinatedChildren.length}</p>
        </div>
      </div>
    </div>
  );
};

export default FixedSheetSummary;
