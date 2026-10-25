import React from "react";
import { useFormContext } from "react-hook-form";

// Tab 1: Setup, Populations, Teams
export const TabAmpPopulations = () => {
  const { register, watch } = useFormContext();
  
  // Dynamic calculation preview for Section 4 Total (c+d+e+f = g)[span_1](start_span)[span_1](end_span)
  const c = Number(watch("totalHHChildren")) || 0;
  const d = Number(watch("totalSchoolMadrasaChildren")) || 0;
  const e = Number(watch("expectedFixedPointChildren")) || 0;
  const f = Number(watch("expectedTransitPointChildren")) || 0;
  const g = c + d + e + f;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">Section 3: Administration (Manual Entry)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700">Vaccinator Name</label>
          <input type="text" {...register("vaccinatorName")} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">Section 4: Current Campaign Planning</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-sm text-gray-700">a) Total Households</label><input type="number" {...register("currentCampaignTotalHH")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">b) Below 5 Years Children</label><input type="number" {...register("totalBelow5Years")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">c) Household Children</label><input type="number" {...register("totalHHChildren")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">d) School/Madrasa Children</label><input type="number" {...register("totalSchoolMadrasaChildren")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">e) Expected Fixed Point Children</label><input type="number" {...register("expectedFixedPointChildren")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">f) Expected Transit Point Children</label><input type="number" {...register("expectedTransitPointChildren")} className="w-full px-3 py-2 border rounded-md" /></div>
        
        <div className="col-span-2 bg-green-50 p-3 rounded flex justify-between items-center border border-green-200">
          <span className="font-medium text-green-800">g) Total (Calculated Preview):</span>
          <span className="text-lg font-bold text-green-700">{g}</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">Section 5: Teams</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className="text-sm text-gray-700">Total Mobile</label><input type="number" {...register("totalMobileTeams")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">Total Fixed</label><input type="number" {...register("totalFixedTeams")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">Total Transit</label><input type="number" {...register("totalTransitTeams")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="text-sm text-gray-700">Teams Req. Special Attention</label><input type="number" {...register("teamsRequiringSpecialAttention")} className="w-full px-3 py-2 border rounded-md" /></div>
      </div>
    </div>
  );
};

export const TabAmpLogistics = () => {
  const { register } = useFormContext();
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">Section 6: Vaccine Carrier</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-gray-700">Required</label><input type="number" {...register("vaccineCarrierRequired")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Available</label><input type="number" {...register("vaccineCarrierAvailable")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">Section 7: Capsules</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-gray-700">Vitamin A Red Capsules</label><input type="number" {...register("vitaminARed")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Vitamin A Blue Capsules</label><input type="number" {...register("vitaminABlue")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">Section 8: Vaccines</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className="block text-sm text-gray-700">Total Vaccine Doses</label><input type="number" {...register("totalVaccineDoses")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Total Tallysheets</label><input type="number" {...register("totalTallysheets")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Total Chalk Boxes</label><input type="number" {...register("totalChalkBoxes")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Markers</label><input type="number" {...register("markers")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Plastic Bags</label><input type="number" {...register("plasticBags")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Pens</label><input type="number" {...register("pens")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Total Badge Cards (DDM)</label><input type="number" {...register("totalBadgeCards")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">Section 9: Mobile Teams Attributes</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className="block text-sm text-gray-700">Teams w/ Govt Person</label><input type="number" {...register("mobileGovtPerson")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Teams w/ Female Member</label><input type="number" {...register("mobileFemaleMember")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Teams w/ Local Person</label><input type="number" {...register("mobileLocalPerson")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div>
          <label className="block text-sm text-gray-700">Both Members Adult?</label>
          <select {...register("bothAdults")} className="mt-1 w-full px-3 py-2 border rounded-md bg-white">
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">Section 10: Vials</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-gray-700">Vaccine Vial</label><input type="number" {...register("vaccineVial")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Dropper</label><input type="number" {...register("dropper")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
      </div>
    </div>
  );
};

export const TabAmpSocial = () => {
  const { register } = useFormContext();
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">Section 11: Social Mobilization</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div><label className="block text-sm text-gray-700">Total Refusal Houses Children</label><input type="number" {...register("totalRefusalChildren")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Total Madrasas</label><input type="number" {...register("totalMadrasas")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Total Mosques</label><input type="number" {...register("totalMosques")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">High & Higher Sec. Schools</label><input type="number" {...register("totalHighSchools")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Schools/Madrasas (Below 5y)</label><input type="number" {...register("totalSchoolsMadrasasBelow5")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">Section 12: Left in Past Campaign</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-gray-700">Unvaccinated Last Campaign</label><input type="number" {...register("unvaccinatedLastCampaign")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Unvaccinated (2+ Campaigns)</label><input type="number" {...register("unvaccinatedPastTwoCampaigns")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">Section 13: Under-dose Records</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-gray-700">Total Under-dose Children</label><input type="number" {...register("totalUnderDoseChildren")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Protected After Last Campaign</label><input type="number" {...register("protectedVaccinationsAfterLast")} className="mt-1 w-full px-3 py-2 border rounded-md" /></div>
      </div>
    </div>
  );
};