import React from "react";
import { useFormContext } from "react-hook-form";

// Tab 1: Sections 1-5 (Admin & Pre-campaign)
export const TabAdminPrep = ({ user, campaign }) => {
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">
        Section 1 & 2: Auto-Populated Information
      </h3>
      
      {/* Section 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md border">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase">SIA</label>
          <div className="mt-1 text-sm text-gray-900">{campaign?.nameOfSIA || "N/A"}</div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase">UCI Charge Name</label>
          <div className="mt-1 text-sm text-gray-900">{user?.uciName || user?.username || "N/A"}</div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase">UCI Phone No.</label>
          <div className="mt-1 text-sm text-gray-900">{user?.phoneNumber || "N/A"}</div>
        </div>
      </div>

      {/* Section 2 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-md border mt-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase">Campaign Name</label>
          <div className="mt-1 text-sm text-gray-900">{campaign?.campaignName || "N/A"}</div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase">District / Agency</label>
          <div className="mt-1 text-sm text-gray-900">{user?.district || "N/A"}</div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase">Tehsil / Town</label>
          <div className="mt-1 text-sm text-gray-900">{user?.townTehsil || "N/A"}</div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase">UC Name</label>
          <div className="mt-1 text-sm text-gray-900">{user?.ucName || "N/A"}</div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase">UC Number</label>
          <div className="mt-1 text-sm text-gray-900">{user?.ucNumber || "N/A"}</div>
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">
        Section 3: Administration
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-700">
            UC Secretary Name
          </label>
          <input
            type="text"
            {...register("ucSecretary")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">
            UC Secretary Phone
          </label>
          <input
            type="text"
            {...register("ucSecretaryPhoneNo")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Vaccinator Name</label>
          <input
            type="text"
            {...register("vaccinatorName")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">
        Section 4: AIC Stats
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-700">Total AICs</label>
          <input
            type="number"
            {...register("totalAICs")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Female AICs</label>
          <input
            type="number"
            {...register("totalFemaleAICs")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Govt AICs</label>
          <input
            type="number"
            {...register("totalGovtAICs")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">
            AICs (2+ Campaigns)
          </label>
          <input
            type="number"
            {...register("aicsPastTwoCampaigns")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      {/* Add Section 5 fields here following the same grid pattern */}
    </div>
  );
};

// Tab 2: Sections 6-7 (Populations & Teams)
export const TabPopulationsTeams = () => {
  const { register, watch } = useFormContext();

  // Dynamic client-side calculation preview (backend remains authoritative[span_1](start_span)[span_1](end_span))
  const b = Number(watch("totalUnder1Year")) || 0;
  const c = Number(watch("totalBelow5Years")) || 0;
  const d = Number(watch("totalHHChildren")) || 0;
  const e = Number(watch("totalSchoolMadrasaChildren")) || 0;
  const f = Number(watch("expectedFixedPointChildren")) || 0;
  const g = Number(watch("expectedTransitPointChildren")) || 0;
  const h = b + c + d + e + f + g;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">
        Section 6: Current Campaign Planning
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-700">a) Total Households</label>
          <input
            type="number"
            {...register("currentCampaignTotalHH")}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">b) Under 1 Year</label>
          <input
            type="number"
            {...register("totalUnder1Year")}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">c) Below 5 Years</label>
          <input
            type="number"
            {...register("totalBelow5Years")}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">d) Household Children</label>
          <input
            type="number"
            {...register("totalHHChildren")}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">
            e) School/Madrasa Children
          </label>
          <input
            type="number"
            {...register("totalSchoolMadrasaChildren")}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">
            f) Fixed Point Children
          </label>
          <input
            type="number"
            {...register("expectedFixedPointChildren")}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">
            g) Transit Point Children
          </label>
          <input
            type="number"
            {...register("expectedTransitPointChildren")}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="col-span-2 bg-gray-50 p-3 rounded flex justify-between items-center border">
          <span className="font-medium text-gray-700">
            h) Total (Calculated Preview):
          </span>
          <span className="text-lg font-bold text-blue-600">{h}</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">
        Section 7: Teams
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-gray-700">Total Mobile</label>
          <input
            type="number"
            {...register("totalMobileTeams")}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">Total Fixed</label>
          <input
            type="number"
            {...register("totalFixedTeams")}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="text-sm text-gray-700">Total Transit</label>
          <input
            type="number"
            {...register("totalTransitTeams")}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

// Tab 3: TabLogistics (Sec 8-11)
export const TabLogistics = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">
        Section 8: Capsules
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700">
            Vitamin A Red Capsules
          </label>
          <input
            type="number"
            {...register("vitaminARed")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">
            Vitamin A Blue Capsules
          </label>
          <input
            type="number"
            {...register("vitaminABlue")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">
        Section 9: Vaccines & Logistics
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-700">
            Total Vaccine Doses
          </label>
          <input
            type="number"
            {...register("totalVaccineDoses")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">
            Total Tallysheets
          </label>
          <input
            type="number"
            {...register("totalTallysheets")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">
            Total Chalk Boxes
          </label>
          <input
            type="number"
            {...register("totalChalkBoxes")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Markers</label>
          <input
            type="number"
            {...register("markers")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Plastic Bags</label>
          <input
            type="number"
            {...register("plasticBags")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Pens</label>
          <input
            type="number"
            {...register("pens")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">
            Total Badge Cards (DDM)
          </label>
          <input
            type="number"
            {...register("totalBadgeCards")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">
        Section 10: Mobile Teams Attributes
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-700">
            Teams w/ Govt Person
          </label>
          <input
            type="number"
            {...register("mobileGovtPerson")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">
            Teams w/ Female Member
          </label>
          <input
            type="number"
            {...register("mobileFemaleMember")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">
            Teams w/ Local Person
          </label>
          <input
            type="number"
            {...register("mobileLocalPerson")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">
            High Attention (HRMP) Total
          </label>
          <input
            type="number"
            {...register("highAttentionHRMPTotal")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">
            Both Members Adult?
          </label>
          <select
            {...register("bothAdults")}
            className="mt-1 w-full px-3 py-2 border rounded-md bg-white"
          >
            <option value="">Select</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">
        Section 11: Vials
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700">Vaccine Vial</label>
          <input
            type="number"
            {...register("vaccineVial")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Dropper</label>
          <input
            type="number"
            {...register("dropper")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

// Tab 4: TabSocial (Sec 12-14)
export const TabSocial = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">
        Section 12: Social Mobilization
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-700">
            Total Refusal Houses Children
          </label>
          <input
            type="number"
            {...register("totalRefusalChildren")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Total Madrasas</label>
          <input
            type="number"
            {...register("totalMadrasas")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Total Mosques</label>
          <input
            type="number"
            {...register("totalMosques")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">
            High/Higher Secondary Schools
          </label>
          <input
            type="number"
            {...register("totalHighSchools")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">
            Schools/Madrasas (Below 5y)
          </label>
          <input
            type="number"
            {...register("totalSchoolsMadrasasBelow5")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">
        Section 13: Left in Past Campaign
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700">
            Unvaccinated Last Campaign
          </label>
          <input
            type="number"
            {...register("unvaccinatedLastCampaign")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">
            Unvaccinated (2+ Campaigns)
          </label>
          <input
            type="number"
            {...register("unvaccinatedPastTwoCampaigns")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">
        Section 14: Under-dose Records
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700">
            Total Under-dose Children
          </label>
          <input
            type="number"
            {...register("totalUnderDoseChildren")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700">
            Protected After Last Campaign
          </label>
          <input
            type="number"
            {...register("protectedVaccinationsAfterLast")}
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
    </div>
  );
};
