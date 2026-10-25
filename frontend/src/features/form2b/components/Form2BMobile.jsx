import React from "react";

const Form2BMobile = ({ data }) => {
  const rows = data?.aicMobilePerformances || [];
  const totals = data?.ucMobileTotals || {};

  if (rows.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 border rounded bg-gray-50">
        No finalized Form 2A Mobile Team records found for this day.
      </div>
    );
  }

  const renderRowCells = (r, isTotal = false) => (
    <>
      <td className="border p-2 font-bold">{isTotal ? "-" : r.aicNo}</td>
      <td className="border p-2 text-left font-medium whitespace-nowrap">
        {r.aicName}
        {!isTotal && r.areaName && <span className="block text-xs text-gray-500">{r.areaName}</span>}
      </td>
      {/* 3. Total Households */}
      <td className="border p-2">{r.targetHouseholds || 0}</td>
      <td className="border p-2">{r.visitedHouseholds || 0}</td>
      {/* 4. Target Children from AMP */}
      <td className="border p-2">{r.targetUnder1 || 0}</td>
      <td className="border p-2">{r.target1to5 || 0}</td>
      <td className="border p-2 font-semibold">{r.targetTotalUnder5 || 0}</td>
      {/* 5. Vaccinated Households First Visit */}
      <td className="border p-2 bg-green-50/40">{r.vaccUnder1 || 0}</td>
      <td className="border p-2 bg-green-50/40">{r.vacc1to5 || 0}</td>
      {/* 6. Recorded Missed Children */}
      <td className="border p-2">{r.recordedMissed?.notAvailable?.under1 || 0}</td>
      <td className="border p-2">{r.recordedMissed?.notAvailable?.oneToFive || 0}</td>
      <td className="border p-2">{r.recordedMissed?.refusal?.under1 || 0}</td>
      <td className="border p-2">{r.recordedMissed?.refusal?.oneToFive || 0}</td>
      {/* 7. Covered Missed Children (Same Day Catch-up) */}
      <td className="border p-2">{r.coveredMissed?.notAvailable?.under1 || 0}</td>
      <td className="border p-2">{r.coveredMissed?.notAvailable?.under5 || 0}</td>
      <td className="border p-2">{r.coveredMissed?.refusal?.under1 || 0}</td>
      <td className="border p-2">{r.coveredMissed?.refusal?.oneToFive || 0}</td>
      {/* 8 - 10. School, Guest, Street */}
      <td className="border p-2">{r.schoolVaccinated || 0}</td>
      <td className="border p-2">{r.guestVaccinated || 0}</td>
      <td className="border p-2">{r.streetVaccinated || 0}</td>
      {/* 11. MMP */}
      <td className="border p-2">{r.mmpTotal || 0}</td>
      <td className="border p-2">{r.mmpVaccinated || 0}</td>
      {/* 12 & 13. Zero & Locked Houses */}
      <td className="border p-2">{r.zeroHouses || 0}</td>
      <td className="border p-2">{r.lockHouses || 0}</td>
      {/* 14. Vaccine Doses */}
      <td className="border p-2">{r.vaccines?.received || 0}</td>
      <td className="border p-2">{r.vaccines?.used || 0}</td>
      <td className="border p-2">{r.vaccines?.returned || 0}</td>
      {/* 15. Finger Markers */}
      <td className="border p-2">{r.markers?.received || 0}</td>
      <td className="border p-2">{r.markers?.used || 0}</td>
      <td className="border p-2">{r.markers?.returned || 0}</td>
      {/* 16 & 17. AFP & Zero Dose */}
      <td className="border p-2">{r.afpCases || 0}</td>
      <td className="border p-2">{r.zeroDoseRI || 0}</td>
      {/* 18. Vitamin A Capsules */}
      <td className="border p-2">{r.vitaminA?.received?.red || 0}</td>
      <td className="border p-2">{r.vitaminA?.received?.blue || 0}</td>
      <td className="border p-2">{r.vitaminA?.used?.red || 0}</td>
      <td className="border p-2">{r.vitaminA?.used?.blue || 0}</td>
      <td className="border p-2">{r.vitaminA?.returned?.red || 0}</td>
      <td className="border p-2">{r.vitaminA?.returned?.blue || 0}</td>
    </>
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800">
        Section 5: Mobile Teams Daily Performance & Vaccination Report (All AICs)
      </h3>
      <div className="overflow-x-auto border rounded">
        <table className="min-w-max w-full text-xs text-center border-collapse">
          <thead className="bg-blue-50 text-blue-900">
            <tr>
              <th className="border p-2" rowSpan="3">1. AIC No</th>
              <th className="border p-2" rowSpan="3">2. AIC Name</th>
              <th className="border p-2" colSpan="2">3. Total Households</th>
              <th className="border p-2" colSpan="3">4. Target Children (AMP)</th>
              <th className="border p-2" colSpan="2">5. Vaccinated HH (1st Visit)</th>
              <th className="border p-2" colSpan="4">6. Recorded Missed Children</th>
              <th className="border p-2" colSpan="4">7. Covered Missed (Same Day)</th>
              <th className="border p-2" rowSpan="3">8. School Vacc</th>
              <th className="border p-2" rowSpan="3">9. Guest Vacc</th>
              <th className="border p-2" rowSpan="3">10. Street Vacc</th>
              <th className="border p-2" colSpan="2">11. MMP Children</th>
              <th className="border p-2" rowSpan="3">12. (0/0) Houses</th>
              <th className="border p-2" rowSpan="3">13. Lock (L)</th>
              <th className="border p-2" colSpan="3">14. Vaccine Doses</th>
              <th className="border p-2" colSpan="3">15. Finger Markers</th>
              <th className="border p-2" rowSpan="3">16. AFP</th>
              <th className="border p-2" rowSpan="3">17. Zero Dose RI</th>
              <th className="border p-2" colSpan="6">18. Vitamin A Capsules</th>
            </tr>
            <tr className="bg-blue-100">
              <th className="border p-1" rowSpan="2">3.1 Target</th>
              <th className="border p-1" rowSpan="2">3.2 Visited</th>
              <th className="border p-1" rowSpan="2">4.1 &lt;1y</th>
              <th className="border p-1" rowSpan="2">4.2 1-5y</th>
              <th className="border p-1" rowSpan="2">4.3 &lt;5y Total</th>
              <th className="border p-1" rowSpan="2">5.1 0-1y</th>
              <th className="border p-1" rowSpan="2">5.2 1-5y</th>
              <th className="border p-1" colSpan="2">6.1 Not Avail</th>
              <th className="border p-1" colSpan="2">6.2 Refusal</th>
              <th className="border p-1" colSpan="2">7.1 Not Avail</th>
              <th className="border p-1" colSpan="2">7.2 Refusal</th>
              <th className="border p-1" rowSpan="2">11.1 Total</th>
              <th className="border p-1" rowSpan="2">11.2 Vacc</th>
              <th className="border p-1" rowSpan="2">Rec</th>
              <th className="border p-1" rowSpan="2">Used</th>
              <th className="border p-1" rowSpan="2">Ret</th>
              <th className="border p-1" rowSpan="2">Rec</th>
              <th className="border p-1" rowSpan="2">Used</th>
              <th className="border p-1" rowSpan="2">Ret</th>
              <th className="border p-1" colSpan="2">Received</th>
              <th className="border p-1" colSpan="2">Used</th>
              <th className="border p-1" colSpan="2">Returned</th>
            </tr>
            <tr className="bg-blue-50">
              <th className="border p-1">&lt;1y</th>
              <th className="border p-1">1-5y</th>
              <th className="border p-1">&lt;1y</th>
              <th className="border p-1">1-5y</th>
              <th className="border p-1">&lt;1y</th>
              <th className="border p-1">&lt;5y</th>
              <th className="border p-1">&lt;1y</th>
              <th className="border p-1">1-5y</th>
              <th className="border p-1 text-red-600">Red</th>
              <th className="border p-1 text-blue-600">Blue</th>
              <th className="border p-1 text-red-600">Red</th>
              <th className="border p-1 text-blue-600">Blue</th>
              <th className="border p-1 text-red-600">Red</th>
              <th className="border p-1 text-blue-600">Blue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {renderRowCells(r, false)}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-blue-800 text-white font-bold">
            <tr>{renderRowCells(totals, true)}</tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Form2BMobile;