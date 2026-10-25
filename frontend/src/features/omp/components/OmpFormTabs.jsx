import React from "react";
import { useFormContext } from "react-hook-form";

export const TabSetupLocation = () => {
  const { register } = useFormContext();
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">Location Details & Sequence</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Village / Sub Area Name</label>
          <input type="text" {...register("villageName")} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Place / Town / School Name</label>
          <input type="text" {...register("placeName")} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Community Vaccination Place</label>
          <input type="text" {...register("communityVaccinationPlace")} placeholder="e.g., Nabeel's House" className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Team's Work Sequence (as per map)</label>
          <input type="text" {...register("workSequence")} placeholder="e.g., Graveyard -> Mosque -> Shops" className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">Coverage Boundary & Category</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Head of First House</label>
          <input type="text" {...register("headOfFirstHouse")} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Head of Last House</label>
          <input type="text" {...register("headOfLastHouse")} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Area Category</label>
          <select {...register("areaCategory")} className="mt-1 w-full px-3 py-2 border rounded-md bg-white">
            <option value="">Select Category</option>
            <option value="G1">G1</option>
            <option value="G2">G2</option>
            <option value="G3">G3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Total Households</label>
          <input type="number" {...register("totalHouseholds")} className="mt-1 w-full px-3 py-2 border rounded-md" />
        </div>
      </div>
    </div>
  );
};

export const TabPopulation = () => {
  const { register, watch } = useFormContext();
  
  // Dynamic calculation for Grand Total Children
  const under1 = Number(watch("totalUnder1Year")) || 0;
  const oneToFive = Number(watch("total1to5Years")) || 0;
  const school = Number(watch("totalSchoolMadrasa")) || 0;
  const grandTotal = under1 + oneToFive + school;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">Children Population</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-gray-700">Under 1 Year (HH)</label><input type="number" {...register("totalUnder1Year")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">1-5 Years (HH)</label><input type="number" {...register("total1to5Years")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">School / Madrasa Children</label><input type="number" {...register("totalSchoolMadrasa")} className="w-full px-3 py-2 border rounded-md" /></div>
        
        <div className="col-span-1 bg-blue-50 p-3 rounded flex justify-between items-center border border-blue-200">
          <span className="font-medium text-blue-800">Grand Total:</span>
          <span className="text-lg font-bold text-blue-700">{grandTotal}</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">Vaccines & Demographics</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div><label className="block text-sm text-gray-700">Total Vaccine Doses Available</label><input type="number" {...register("totalVaccineDoses")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Unvaccinated Past Campaign</label><input type="number" {...register("totalUnvaccinatedPast")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">Migrant & Mobile Children</label><input type="number" {...register("totalMigrantMobile")} className="w-full px-3 py-2 border rounded-md" /></div>
      </div>

      <h3 className="text-lg font-semibold border-b pb-2 mt-6">Vitamin A Capsules</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-sm text-gray-700">🔴 Red Capsules</label><input type="number" {...register("vitaminARed")} className="w-full px-3 py-2 border rounded-md" /></div>
        <div><label className="block text-sm text-gray-700">🔵 Blue Capsules</label><input type="number" {...register("vitaminABlue")} className="w-full px-3 py-2 border rounded-md" /></div>
      </div>
    </div>
  );
};

export const TabMaterials = () => {
  const { register } = useFormContext();
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold border-b pb-2">Material Required</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-700">Marker</label>
          <input type="number" {...register("marker")} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Chalk</label>
          <input type="number" {...register("chalk")} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Dropper</label>
          <input type="number" {...register("dropper")} className="w-full px-3 py-2 border rounded-md" />
        </div>
        <div>
          <label className="block text-sm text-gray-700">Plastic Bags</label>
          <input type="number" {...register("plasticBags")} className="w-full px-3 py-2 border rounded-md" />
        </div>
      </div>
    </div>
  );
};