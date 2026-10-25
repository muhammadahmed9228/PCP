import React from "react";

const AicSummaryTable = ({ title, rows = [], totals = {}, headerBg = "bg-indigo-50", footerBg = "bg-indigo-800" }) => {
  if (rows.length === 0) {
    return (
      <div className="p-4 text-gray-500 italic border rounded bg-gray-50">
        No records available for {title}.
      </div>
    );
  }

  const renderCells = (r, isTotal = false) => (
    <>
      <td className="border p-2 font-bold">{isTotal ? "-" : r.aicNo}</td>
      <td className="border p-2 text-left font-medium whitespace-nowrap">
        {r.aicName}
        {!isTotal && r.areaName && <span className="block text-xs text-gray-500">{r.areaName}</span>}
      </td>
      {/* 3. Vaccinated Children */}
      <td className="border p-2 font-bold bg-green-50/40">{r.vaccinatedChildren || 0}</td>
      {/* 4. Vaccine Doses Record */}
      <td className="border p-2">{r.vaccines?.received || 0}</td>
      <td className="border p-2">{r.vaccines?.used || 0}</td>
      <td className="border p-2">{r.vaccines?.returned || 0}</td>
      {/* 5. Vitamin A Capsules */}
      <td className="border p-2">{r.vitaminA?.received?.red || 0}</td>
      <td className="border p-2">{r.vitaminA?.received?.blue || 0}</td>
      <td className="border p-2">{r.vitaminA?.used?.red || 0}</td>
      <td className="border p-2">{r.vitaminA?.used?.blue || 0}</td>
      <td className="border p-2">{r.vitaminA?.returned?.red || 0}</td>
      <td className="border p-2">{r.vitaminA?.returned?.blue || 0}</td>
      {/* 6. Finger Markers */}
      <td className="border p-2">{r.markers?.received || 0}</td>
      <td className="border p-2">{r.markers?.used || 0}</td>
      <td className="border p-2">{r.markers?.returned || 0}</td>
      {/* 7 & 8. AFP & Zero Dose RI */}
      <td className="border p-2">{r.afpCases || 0}</td>
      <td className="border p-2">{r.zeroDoseRI || 0}</td>
    </>
  );

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-800">{title}</h3>
      <div className="overflow-x-auto border rounded">
        <table className="min-w-max w-full text-xs text-center border-collapse">
          <thead className={headerBg}>
            <tr>
              <th className="border p-2" rowSpan="3">1. AIC No</th>
              <th className="border p-2" rowSpan="3">2. AIC Name</th>
              <th className="border p-2" rowSpan="3">3. Children Vaccinated</th>
              <th className="border p-2" colSpan="3">4. Vaccine Doses Record</th>
              <th className="border p-2" colSpan="6">5. Vitamin A Capsules</th>
              <th className="border p-2" colSpan="3">6. Finger Markers</th>
              <th className="border p-2" rowSpan="3">7. AFP Cases</th>
              <th className="border p-2" rowSpan="3">8. Zero Dose RI</th>
            </tr>
            <tr>
              <th className="border p-1" rowSpan="2">4.1 Rec</th>
              <th className="border p-1" rowSpan="2">4.2 Used</th>
              <th className="border p-1" rowSpan="2">4.3 Ret</th>
              <th className="border p-1" colSpan="2">Received</th>
              <th className="border p-1" colSpan="2">Used</th>
              <th className="border p-1" colSpan="2">Returned</th>
              <th className="border p-1" rowSpan="2">Rec</th>
              <th className="border p-1" rowSpan="2">Used</th>
              <th className="border p-1" rowSpan="2">Ret</th>
            </tr>
            <tr>
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
                {renderCells(r, false)}
              </tr>
            ))}
          </tbody>
          <tfoot 
            className={`${footerBg} text-white font-bold`}
            style={{ backgroundColor: footerBg.includes("teal") ? "#115e59" : "#3730a3", color: "#ffffff" }}
          >
            <tr>{renderCells(totals, true)}</tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

const Form2BFixedTransit = ({ data }) => {
  return (
    <div className="space-y-8">
      <AicSummaryTable
        title="Section 6: Fixed Teams Daily Performance (All AICs)"
        rows={data?.aicFixedPerformances}
        totals={data?.ucFixedTotals}
        headerBg="bg-indigo-50 text-indigo-900"
        footerBg="bg-indigo-800"
      />

      <AicSummaryTable
        title="Section 7: Transit Teams Daily Performance (All AICs)"
        rows={data?.aicTransitPerformances}
        totals={data?.ucTransitTotals}
        headerBg="bg-teal-50 text-teal-900"
        footerBg="bg-teal-800"
      />
    </div>
  );
};

export default Form2BFixedTransit;