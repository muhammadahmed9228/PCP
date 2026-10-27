import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

export const TabSetupLocation = () => {
  const { register } = useFormContext();
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">{t("ompLocationDetails")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("villageName")}</label>
          <input type="text" {...register("villageName")} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("placeName")}</label>
          <input type="text" {...register("placeName")} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("communityVaccinationPlace")}</label>
          <input type="text" {...register("communityVaccinationPlace")} placeholder={t("ompHouseExample")} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("workSequence")}</label>
          <input type="text" {...register("workSequence")} placeholder={t("ompRouteExample")} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("coverageBoundary")}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("headFirstHouse")}</label>
          <input type="text" {...register("headOfFirstHouse")} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("headLastHouse")}</label>
          <input type="text" {...register("headOfLastHouse")} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("areaCategory")}</label>
          <select {...register("areaCategory")} className="mt-1 w-full px-3 py-2 border rounded-md bg-white">
            <option value="">{t("selectCategory")}</option>
            <option value="G1">G1</option>
            <option value="G2">G2</option>
            <option value="G3">G3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t("totalHouseholds")}</label>
          <input type="number" {...register("totalHouseholds")} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
      </div>
    </div>
  );
};

export const TabPopulation = () => {
  const { register, watch } = useFormContext();
  const { t } = useTranslation();
  
  // Dynamic calculation for Grand Total Children
  const under1 = Number(watch("totalUnder1Year")) || 0;
  const oneToFive = Number(watch("total1to5Years")) || 0;
  const school = Number(watch("totalSchoolMadrasa")) || 0;
  const grandTotal = under1 + oneToFive + school;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">{t("ompChildrenPopulation")}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-gray-700">{t("under1Household")}</label><input type="number" {...register("totalUnder1Year")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("oneToFiveHousehold")}</label><input type="number" {...register("total1to5Years")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("schoolMadrasaChildren")}</label><input type="number" {...register("totalSchoolMadrasa")} className="w-full px-3 py-2 border rounded-md" /></div>
        
        <div className="col-span-1 bg-blue-50 p-3 rounded flex justify-between items-center border border-blue-200">
          <span className="font-medium text-blue-800">{t("grandTotal")}</span>
          <span className="text-lg font-bold text-blue-700">{grandTotal}</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("ompVaccinesDemographics")}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div><label className="block text-sm text-gray-700">{t("totalVaccineDosesAvailable")}</label><input type="number" {...register("totalVaccineDoses")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("unvaccinatedPastCampaign")}</label><input type="number" {...register("totalUnvaccinatedPast")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("migrantMobileChildren")}</label><input type="number" {...register("totalMigrantMobile")} className="w-full px-3 py-2 border rounded-md" /></div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("vitaminCapsulesPlain")}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-gray-700">{t("redCapsules")}</label><input type="number" {...register("vitaminARed")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("blueCapsules")}</label><input type="number" {...register("vitaminABlue")} className="w-full px-3 py-2 border rounded-md" /></div>
      </div>
    </div>
  );
};

export const TabMaterials = () => {
  const { register } = useFormContext();
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">{t("materialRequired")}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-700">{t("marker")}</label>
          <input type="number" {...register("marker")} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">{t("chalk")}</label>
          <input type="number" {...register("chalk")} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">{t("dropper")}</label>
          <input type="number" {...register("dropper")} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">{t("plasticBags")}</label>
          <input type="number" {...register("plasticBags")} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>
    </div>
  );
};
