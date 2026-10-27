import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

// Tab 1: Setup, Populations, Teams
export const TabAmpPopulations = () => {
  const { register, watch } = useFormContext();
  const { t } = useTranslation();
  
  // Dynamic calculation preview for Section 4 Total (c+d+e+f = g)[span_1](start_span)[span_1](end_span)
  const c = Number(watch("totalHHChildren")) || 0;
  const d = Number(watch("totalSchoolMadrasaChildren")) || 0;
  const e = Number(watch("expectedFixedPointChildren")) || 0;
  const f = Number(watch("expectedTransitPointChildren")) || 0;
  const g = c + d + e + f;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">{t("ampSection3")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700">{t("vaccinatorName")}</label>
          <input type="text" {...register("vaccinatorName")} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("ampSection4")}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-sm text-gray-700">{t("ampTotalHouseholds")}</label><input type="number" {...register("currentCampaignTotalHH")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">{t("ampBelow5Children")}</label><input type="number" {...register("totalBelow5Years")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">{t("ampHouseholdChildren")}</label><input type="number" {...register("totalHHChildren")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">{t("ampSchoolChildren")}</label><input type="number" {...register("totalSchoolMadrasaChildren")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">{t("ampFixedChildren")}</label><input type="number" {...register("expectedFixedPointChildren")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">{t("ampTransitChildren")}</label><input type="number" {...register("expectedTransitPointChildren")} className="w-full px-3 py-2 border rounded-md" /></div>
        
        <div className="col-span-2 bg-green-50 p-3 rounded flex justify-between items-center border border-green-200">
          <span className="font-medium text-green-800">{t("ampCalculatedTotal")}</span>
          <span className="text-lg font-bold text-green-700">{g}</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("ampSection5")}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className="text-sm text-gray-700">{t("ampTotalMobile")}</label><input type="number" {...register("totalMobileTeams")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">{t("ampTotalFixed")}</label><input type="number" {...register("totalFixedTeams")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">{t("ampTotalTransit")}</label><input type="number" {...register("totalTransitTeams")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">{t("ampSpecialAttention")}</label><input type="number" {...register("teamsRequiringSpecialAttention")} className="w-full px-3 py-2 border rounded-md" /></div>
      </div>
    </div>
  );
};

export const TabAmpLogistics = () => {
  const { register } = useFormContext();
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">{t("ampSection6")}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-gray-700">{t("ampRequired")}</label><input type="number" {...register("vaccineCarrierRequired")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("ampAvailable")}</label><input type="number" {...register("vaccineCarrierAvailable")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("ampSection7")}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-gray-700">{t("ampRedCapsules")}</label><input type="number" {...register("vitaminARed")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("ampBlueCapsules")}</label><input type="number" {...register("vitaminABlue")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("ampSection8")}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className="block text-sm text-gray-700">{t("ampTotalDoses")}</label><input type="number" {...register("totalVaccineDoses")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("ampTotalTallysheets")}</label><input type="number" {...register("totalTallysheets")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("ampTotalChalkBoxes")}</label><input type="number" {...register("totalChalkBoxes")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("ampMarkers")}</label><input type="number" {...register("markers")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("plasticBags")}</label><input type="number" {...register("plasticBags")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("ampPens")}</label><input type="number" {...register("pens")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("ampBadgeCards")}</label><input type="number" {...register("totalBadgeCards")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("ampSection9")}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className="block text-sm text-gray-700">{t("ampTeamsGovt")}</label><input type="number" {...register("mobileGovtPerson")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("ampTeamsFemale")}</label><input type="number" {...register("mobileFemaleMember")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("ampTeamsLocal")}</label><input type="number" {...register("mobileLocalPerson")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div>
          <label className="block text-sm text-gray-700">{t("ampBothAdults")}</label>
          <select {...register("bothAdults")} className="mt-1 w-full px-3 py-2 border rounded-md bg-white">
            <option value="">{t("select")}</option>
            <option value="true">{t("yes")}</option>
            <option value="false">{t("no")}</option>
          </select>
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("ampSection10")}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-gray-700">{t("ampVaccineVial")}</label><input type="number" {...register("vaccineVial")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("dropper")}</label><input type="number" {...register("dropper")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
      </div>
    </div>
  );
};

export const TabAmpSocial = () => {
  const { register } = useFormContext();
  const { t } = useTranslation();
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">{t("ampSection11")}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div><label className="block text-sm text-gray-700">{t("ampRefusalChildren")}</label><input type="number" {...register("totalRefusalChildren")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("ampMadrasas")}</label><input type="number" {...register("totalMadrasas")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("ampMosques")}</label><input type="number" {...register("totalMosques")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("ampHighSchools")}</label><input type="number" {...register("totalHighSchools")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("ampSchoolsBelow5")}</label><input type="number" {...register("totalSchoolsMadrasasBelow5")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("ampSection12")}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-gray-700">{t("ampUnvaccinatedLast")}</label><input type="number" {...register("unvaccinatedLastCampaign")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("ampUnvaccinatedTwoPlus")}</label><input type="number" {...register("unvaccinatedPastTwoCampaigns")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">{t("ampSection13")}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-gray-700">{t("ampUnderDose")}</label><input type="number" {...register("totalUnderDoseChildren")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">{t("ampProtectedAfter")}</label><input type="number" {...register("protectedVaccinationsAfterLast")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
      </div>
    </div>
  );
};
