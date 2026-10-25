import React from "react";
import { useFormContext, useWatch } from "react-hook-form";

const TallySheetSummary = () => {
  const { control } = useFormContext();
  
  const households = useWatch({ control, name: "households" }) || [];
  const schools = useWatch({ control, name: "schools" }) || [];
  const streetVacc = Number(useWatch({ control, name: "streetVaccinated" })) || 0;

  // Compute Live Totals
  let sumHouseChildren = 0, sumVacc0to1 = 0, sumVacc1to5 = 0, sumHouseVacc = 0, sumHouseUnvacc = 0;
  let sumGuestChildren = 0, sumGuestVacc = 0, sumGuestUnvacc = 0;
  let mmpTotal = 0, mmpVacc = 0;
  let zeroHouses = 0, lockHouses = 0;

  households.forEach(h => {
    if (h.classification === "L") { lockHouses++; return; }
    if (h.classification === "0/0") { zeroHouses++; return; }

    const cUnder5 = Number(h.childrenUnder5) || 0;
    const v01 = Number(h.vacc0to1) || 0;
    const v15 = Number(h.vacc1to5) || 0;
    const tVacc = v01 + v15;
    
    sumHouseChildren += cUnder5;
    sumVacc0to1 += v01;
    sumVacc1to5 += v15;
    sumHouseVacc += tVacc;
    sumHouseUnvacc += Math.max(0, cUnder5 - tVacc);

    const gUnder5 = Number(h.guestUnder5) || 0;
    const gVacc = Number(h.guestVacc) || 0;
    sumGuestChildren += gUnder5;
    sumGuestVacc += gVacc;
    sumGuestUnvacc += Math.max(0, gUnder5 - gVacc);

    if (h.classification === "MMP") {
      mmpTotal += cUnder5;
      mmpVacc += tVacc;
    }
  });

  const sumSchoolVacc = schools.reduce((acc, curr) => acc + (Number(curr.vaccinated) || 0), 0);
  const grandTotal = sumHouseVacc + sumSchoolVacc + streetVacc + sumGuestVacc;

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Live Auto-Calculated Summary</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-gray-500 font-medium">House Vaccinated (B)</p>
          <p className="text-2xl font-bold text-blue-700">{sumHouseVacc}</p>
        </div>
        <div className="bg-indigo-50 p-3 rounded">
          <p className="text-gray-500 font-medium">School Vaccinated (S)</p>
          <p className="text-2xl font-bold text-indigo-700">{sumSchoolVacc}</p>
        </div>
        <div className="bg-teal-50 p-3 rounded">
          <p className="text-gray-500 font-medium">Street/Guest Vacc (D+G)</p>
          <p className="text-2xl font-bold text-teal-700">{streetVacc + sumGuestVacc}</p>
        </div>
        <div className="bg-green-100 p-3 rounded border border-green-300">
          <p className="text-green-800 font-bold">Grand Total Vacc</p>
          <p className="text-3xl font-black text-green-700">{grandTotal}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-4 text-xs">
        <div className="p-2 border rounded"><span className="block text-gray-500">Unvacc Houses</span><strong className="text-red-600 text-lg">{sumHouseUnvacc}</strong></div>
        <div className="p-2 border rounded"><span className="block text-gray-500">Unvacc Guests</span><strong className="text-orange-600 text-lg">{sumGuestUnvacc}</strong></div>
        <div className="p-2 border rounded"><span className="block text-gray-500">MMP Children</span><strong className="text-lg">{mmpTotal}</strong></div>
        <div className="p-2 border rounded"><span className="block text-gray-500">MMP Vacc</span><strong className="text-lg">{mmpVacc}</strong></div>
        <div className="p-2 border rounded"><span className="block text-gray-500">Lock Houses (L)</span><strong className="text-lg">{lockHouses}</strong></div>
        <div className="p-2 border rounded"><span className="block text-gray-500">Zero Houses (0/0)</span><strong className="text-lg">{zeroHouses}</strong></div>
      </div>
    </div>
  );
};

export default TallySheetSummary;