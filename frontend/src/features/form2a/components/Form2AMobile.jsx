import React from "react";

const Form2AMobile = ({ data }) => {
  const perfs = data.mobilePerformances || [];
  const totals = data.aggregatedMobileTotals || {};

  if (perfs.length === 0) {
    return <div className="p-6 text-center text-gray-500">No Mobile Teams reported for this day.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800">Section 5: Mobile Teams Daily Performance</h3>
      <div className="overflow-x-auto pb-4 border border-gray-200 rounded-sm">
        <table className="min-w-max w-full text-xs text-center border-collapse">
          <thead className="bg-blue-50 text-blue-900 sticky top-0">
            <tr>
              <th className="border p-2" rowSpan="3">Team No</th>
              <th className="border p-2" rowSpan="3">Members</th>
              <th className="border p-2" colSpan="2" rowSpan="2">3. Households</th>
              <th className="border p-2" colSpan="2" rowSpan="2">4. Target Child (OMP)</th>
              <th className="border p-2" colSpan="2" rowSpan="2">5. Vaccinated HH</th>
              <th className="border p-2 bg-red-50" colSpan="4">6. Recorded Missed Children</th>
              <th className="border p-2 bg-green-50" colSpan="4">7. Covered Missed (Same-Day)</th>
              <th className="border p-2" colSpan="3" rowSpan="2">8-10. Other Vacc</th>
              <th className="border p-2" colSpan="2" rowSpan="2">11. MMP</th>
              <th className="border p-2" colSpan="2" rowSpan="2">12-13. Houses</th>
              <th className="border p-2" colSpan="3" rowSpan="2">14. Vaccines</th>
              <th className="border p-2" colSpan="2" rowSpan="2">16-17. Cases</th>
            </tr>
            <tr className="bg-blue-100">
              <th className="border p-1 bg-red-100" colSpan="2">6.1 Not Avail</th>
              <th className="border p-1 bg-red-100" colSpan="2">6.2 Refusal</th>
              <th className="border p-1 bg-green-100" colSpan="2">7.1 Not Avail</th>
              <th className="border p-1 bg-green-100" colSpan="2">7.2 Refusal</th>
            </tr>
            <tr className="bg-blue-50">
              <th className="border p-1">Target</th>
              <th className="border p-1">Visited</th>
              <th className="border p-1">&lt; 1y</th>
              <th className="border p-1">1-5y</th>
              <th className="border p-1">&lt; 1y</th>
              <th className="border p-1">1-5y</th>
              {/* Field 6 sub-columns */}
              <th className="border p-1 bg-red-50">&lt; 1y</th>
              <th className="border p-1 bg-red-50">1-5y</th>
              <th className="border p-1 bg-red-50">&lt; 1y</th>
              <th className="border p-1 bg-red-50">1-5y</th>
              {/* Field 7 sub-columns */}
              <th className="border p-1 bg-green-50">&lt; 1y</th>
              <th className="border p-1 bg-green-50">&lt; 5y</th>
              <th className="border p-1 bg-green-50">&lt; 1y</th>
              <th className="border p-1 bg-green-50">1-5y</th>
              {/* Other columns */}
              <th className="border p-1">Sch</th>
              <th className="border p-1">Gst</th>
              <th className="border p-1">Str</th>
              <th className="border p-1">Total</th>
              <th className="border p-1">Vacc</th>
              <th className="border p-1">0/0</th>
              <th className="border p-1">Lock</th>
              <th className="border p-1">Rec</th>
              <th className="border p-1">Used</th>
              <th className="border p-1">Ret</th>
              <th className="border p-1">AFP</th>
              <th className="border p-1">Zero D.</th>
            </tr>
          </thead>
          <tbody>
            {perfs.map((p, idx) => (
              <tr key={idx} className="hover:bg-gray-50 border-b">
                <td className="border p-2 font-bold">{p.teamNo}</td>
                <td className="border p-2 text-left">
                  <div className="font-medium">{p.leaderName}</div>
                  <div className="text-gray-500">{p.memberName}</div>
                </td>
                <td className="border p-2">{p.targetHouseholds}</td>
                <td className="border p-2">{p.visitedHouseholds}</td>
                <td className="border p-2">{p.ompChildrenUnder1}</td>
                <td className="border p-2">{p.ompChildren1to5}</td>
                <td className="border p-2 bg-green-50">{p.vaccUnder1}</td>
                <td className="border p-2 bg-green-50">{p.vacc1to5}</td>
                {/* 6. Recorded Missed */}
                <td className="border p-2 bg-red-50/40">{p.recordedMissed?.notAvailable?.under1 || 0}</td>
                <td className="border p-2 bg-red-50/40">{p.recordedMissed?.notAvailable?.oneToFive || 0}</td>
                <td className="border p-2 bg-red-50/40">{p.recordedMissed?.refusal?.under1 || 0}</td>
                <td className="border p-2 bg-red-50/40">{p.recordedMissed?.refusal?.oneToFive || 0}</td>
                {/* 7. Covered Missed */}
                <td className="border p-2 bg-green-50/40">{p.coveredMissed?.notAvailable?.under1 || 0}</td>
                <td className="border p-2 bg-green-50/40">{p.coveredMissed?.notAvailable?.under5 || 0}</td>
                <td className="border p-2 bg-green-50/40">{p.coveredMissed?.refusal?.under1 || 0}</td>
                <td className="border p-2 bg-green-50/40">{p.coveredMissed?.refusal?.oneToFive || 0}</td>
                {/* 8 - 17 */}
                <td className="border p-2">{p.schoolVaccinated}</td>
                <td className="border p-2">{p.guestVaccinated}</td>
                <td className="border p-2">{p.streetVaccinated}</td>
                <td className="border p-2">{p.mmpTotal}</td>
                <td className="border p-2 bg-green-50">{p.mmpVaccinated}</td>
                <td className="border p-2 text-red-600">{p.zeroHouses}</td>
                <td className="border p-2 text-red-600">{p.lockHouses}</td>
                <td className="border p-2">{p.vaccines?.received}</td>
                <td className="border p-2 bg-yellow-50">{p.vaccines?.used}</td>
                <td className="border p-2">{p.vaccines?.returned}</td>
                <td className="border p-2">{p.afpCases}</td>
                <td className="border p-2">{p.zeroDoseRI}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-blue-600 text-white font-bold">
            <tr>
              <td className="border p-2" colSpan="2">TOTALS (Area)</td>
              <td className="border p-2">{totals.targetHouseholds || 0}</td>
              <td className="border p-2">{totals.visitedHouseholds || 0}</td>
              <td className="border p-2">{totals.ompChildrenUnder1 || 0}</td>
              <td className="border p-2">{totals.ompChildren1to5 || 0}</td>
              <td className="border p-2">{totals.vaccUnder1 || 0}</td>
              <td className="border p-2">{totals.vacc1to5 || 0}</td>
              {/* Totals for 6. Recorded Missed */}
              <td className="border p-2">{totals.recordedMissed?.notAvailable?.under1 || 0}</td>
              <td className="border p-2">{totals.recordedMissed?.notAvailable?.oneToFive || 0}</td>
              <td className="border p-2">{totals.recordedMissed?.refusal?.under1 || 0}</td>
              <td className="border p-2">{totals.recordedMissed?.refusal?.oneToFive || 0}</td>
              {/* Totals for 7. Covered Missed */}
              <td className="border p-2">{totals.coveredMissed?.notAvailable?.under1 || 0}</td>
              <td className="border p-2">{totals.coveredMissed?.notAvailable?.under5 || 0}</td>
              <td className="border p-2">{totals.coveredMissed?.refusal?.under1 || 0}</td>
              <td className="border p-2">{totals.coveredMissed?.refusal?.oneToFive || 0}</td>
              {/* Totals for 8 - 17 */}
              <td className="border p-2">{totals.schoolVaccinated || 0}</td>
              <td className="border p-2">{totals.guestVaccinated || 0}</td>
              <td className="border p-2">{totals.streetVaccinated || 0}</td>
              <td className="border p-2">{totals.mmpTotal || 0}</td>
              <td className="border p-2">{totals.mmpVaccinated || 0}</td>
              <td className="border p-2">{totals.zeroHouses || 0}</td>
              <td className="border p-2">{totals.lockHouses || 0}</td>
              <td className="border p-2" colSpan="3">See Inventory Tab</td>
              <td className="border p-2">{totals.afpCases || 0}</td>
              <td className="border p-2">{totals.zeroDoseRI || 0}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Form2AMobile;
// import React from "react";

// const Form2AMobile = ({ data }) => {
//   const perfs = data.mobilePerformances || [];
//   const totals = data.aggregatedMobileTotals || {};

//   if (perfs.length === 0) {
//     return <div className="p-6 text-center text-gray-500">No Mobile Teams reported for this day.</div>;
//   }

//   return (
//     <div className="space-y-4">
//       <h3 className="text-lg font-bold text-gray-800">Section 5: Mobile Teams Daily Performance</h3>
//       <div className="overflow-x-auto pb-4 border border-gray-200 rounded-sm">
//         <table className="min-w-max w-full text-xs text-center border-collapse">
//           <thead className="bg-blue-50 text-blue-900 sticky top-0">
//             <tr>
//               <th className="border p-2" rowSpan="2">Team No</th>
//               <th className="border p-2" rowSpan="2">Members</th>
//               <th className="border p-2" colSpan="2">Households</th>
//               <th className="border p-2" colSpan="2">Target Child (OMP)</th>
//               <th className="border p-2" colSpan="2">Vaccinated HH</th>
//               <th className="border p-2" colSpan="3">Other Vaccinations</th>
//               <th className="border p-2" colSpan="2">MMP</th>
//               <th className="border p-2" colSpan="2">Houses</th>
//               <th className="border p-2" colSpan="3">Vaccines</th>
//               <th className="border p-2" colSpan="2">Cases</th>
//             </tr>
//             <tr className="bg-blue-100">
//               <th className="border p-1">Target</th>
//               <th className="border p-1">Visited</th>
//               <th className="border p-1">&lt; 1y</th>
//               <th className="border p-1">1-5y</th>
//               <th className="border p-1">&lt; 1y</th>
//               <th className="border p-1">1-5y</th>
//               <th className="border p-1">Sch</th>
//               <th className="border p-1">Gst</th>
//               <th className="border p-1">Str</th>
//               <th className="border p-1">Total</th>
//               <th className="border p-1">Vacc</th>
//               <th className="border p-1">0/0</th>
//               <th className="border p-1">Lock</th>
//               <th className="border p-1">Rec</th>
//               <th className="border p-1">Used</th>
//               <th className="border p-1">Ret</th>
//               <th className="border p-1">AFP</th>
//               <th className="border p-1">Zero D.</th>
//             </tr>
//           </thead>
//           <tbody>
//             {perfs.map((p, idx) => (
//               <tr key={idx} className="hover:bg-gray-50 border-b">
//                 <td className="border p-2 font-bold">{p.teamNo}</td>
//                 <td className="border p-2 text-left">
//                   <div className="font-medium">{p.leaderName}</div>
//                   <div className="text-gray-500">{p.memberName}</div>
//                 </td>
//                 <td className="border p-2">{p.targetHouseholds}</td>
//                 <td className="border p-2">{p.visitedHouseholds}</td>
//                 <td className="border p-2">{p.ompChildrenUnder1}</td>
//                 <td className="border p-2">{p.ompChildren1to5}</td>
//                 <td className="border p-2 bg-green-50">{p.vaccUnder1}</td>
//                 <td className="border p-2 bg-green-50">{p.vacc1to5}</td>
//                 <td className="border p-2">{p.schoolVaccinated}</td>
//                 <td className="border p-2">{p.guestVaccinated}</td>
//                 <td className="border p-2">{p.streetVaccinated}</td>
//                 <td className="border p-2">{p.mmpTotal}</td>
//                 <td className="border p-2 bg-green-50">{p.mmpVaccinated}</td>
//                 <td className="border p-2 text-red-600">{p.zeroHouses}</td>
//                 <td className="border p-2 text-red-600">{p.lockHouses}</td>
//                 <td className="border p-2">{p.vaccines?.received}</td>
//                 <td className="border p-2 bg-yellow-50">{p.vaccines?.used}</td>
//                 <td className="border p-2">{p.vaccines?.returned}</td>
//                 <td className="border p-2">{p.afpCases}</td>
//                 <td className="border p-2">{p.zeroDoseRI}</td>
//               </tr>
//             ))}
//           </tbody>
//           <tfoot className="bg-blue-600 text-white font-bold">
//             <tr>
//               <td className="border p-2" colSpan="2">TOTALS (Area)</td>
//               <td className="border p-2">{totals.targetHouseholds || 0}</td>
//               <td className="border p-2">{totals.visitedHouseholds || 0}</td>
//               <td className="border p-2">{totals.ompChildrenUnder1 || 0}</td>
//               <td className="border p-2">{totals.ompChildren1to5 || 0}</td>
//               <td className="border p-2">{totals.vaccUnder1 || 0}</td>
//               <td className="border p-2">{totals.vacc1to5 || 0}</td>
//               <td className="border p-2">{totals.schoolVaccinated || 0}</td>
//               <td className="border p-2">{totals.guestVaccinated || 0}</td>
//               <td className="border p-2">{totals.streetVaccinated || 0}</td>
//               <td className="border p-2">{totals.mmpTotal || 0}</td>
//               <td className="border p-2">{totals.mmpVaccinated || 0}</td>
//               <td className="border p-2">{totals.zeroHouses || 0}</td>
//               <td className="border p-2">{totals.lockHouses || 0}</td>
//               {/* Note: Vaccine totals are explicitly displayed in the Section 8 Inventory tab, so we can leave these empty or calculate them here */}
//               <td className="border p-2" colSpan="3">See Inventory Tab</td>
//               <td className="border p-2">{totals.afpCases || 0}</td>
//               <td className="border p-2">{totals.zeroDoseRI || 0}</td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Form2AMobile;