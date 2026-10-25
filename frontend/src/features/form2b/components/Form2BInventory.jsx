import React from "react";

const Form2BInventory = ({ data }) => {
  const inv = data?.dailyInventorySummary;
  if (!inv) return null;

  const { byTeamType = {}, grandTotalVaccines = {}, grandTotalMarkers = {} } = inv;

  const teamRows = [
    { label: "1.1 Mobile Teams (All AICs)", key: "mobile" },
    { label: "1.2 Fixed Teams (All AICs)", key: "fixed" },
    { label: "1.3 Transit Teams (All AICs)", key: "transit" }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">
        Section 8: Daily Inventory Summary (UC Level)
      </h3>

      {/* 1. Breakdown Table by Team Type */}
      <div className="border rounded shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm text-center border-collapse">
          <thead className="bg-gray-100 text-gray-800">
            <tr>
              <th className="border p-3 text-left" rowSpan="2">Team Category</th>
              <th className="border p-2 bg-yellow-50" colSpan="3">Vaccines (Doses)</th>
              <th className="border p-2 bg-blue-50" colSpan="3">Finger Markers</th>
            </tr>
            <tr>
              <th className="border p-2 bg-yellow-50/60">Received</th>
              <th className="border p-2 bg-yellow-50/60">Used</th>
              <th className="border p-2 bg-yellow-50/60">Returned</th>
              <th className="border p-2 bg-blue-50/60">Received</th>
              <th className="border p-2 bg-blue-50/60">Used</th>
              <th className="border p-2 bg-blue-50/60">Returned</th>
            </tr>
          </thead>
          <tbody>
            {teamRows.map((row) => {
              const teamData = byTeamType[row.key] || {};
              return (
                <tr key={row.key} className="hover:bg-gray-50">
                  <td className="border p-3 text-left font-semibold">{row.label}</td>
                  <td className="border p-2">{teamData.vaccines?.received || 0}</td>
                  <td className="border p-2 font-medium">{teamData.vaccines?.used || 0}</td>
                  <td className="border p-2">{teamData.vaccines?.returned || 0}</td>
                  <td className="border p-2">{teamData.markers?.received || 0}</td>
                  <td className="border p-2 font-medium">{teamData.markers?.used || 0}</td>
                  <td className="border p-2">{teamData.markers?.returned || 0}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-800 text-white font-bold text-base">
            <tr>
              <td className="border p-3 text-left">DAILY GRAND TOTAL (ALL AICs)</td>
              <td className="border p-2 text-yellow-300">{grandTotalVaccines.received || 0}</td>
              <td className="border p-2 text-yellow-300">{grandTotalVaccines.used || 0}</td>
              <td className="border p-2 text-yellow-300">{grandTotalVaccines.returned || 0}</td>
              <td className="border p-2 text-blue-300">{grandTotalMarkers.received || 0}</td>
              <td className="border p-2 text-blue-300">{grandTotalMarkers.used || 0}</td>
              <td className="border p-2 text-blue-300">{grandTotalMarkers.returned || 0}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 2 & 3. Highlighted Grand Total Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
          <h4 className="font-bold text-yellow-900 mb-3 border-b border-yellow-200 pb-2">
            2. Daily Grand Total: Vaccines
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white p-3 rounded border">
              <span className="text-xs text-gray-500 block">Received</span>
              <span className="text-2xl font-black text-gray-800">{grandTotalVaccines.received || 0}</span>
            </div>
            <div className="bg-white p-3 rounded border">
              <span className="text-xs text-gray-500 block">Used</span>
              <span className="text-2xl font-black text-green-700">{grandTotalVaccines.used || 0}</span>
            </div>
            <div className="bg-white p-3 rounded border">
              <span className="text-xs text-gray-500 block">Returned</span>
              <span className="text-2xl font-black text-blue-700">{grandTotalVaccines.returned || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
          <h4 className="font-bold text-blue-900 mb-3 border-b border-blue-200 pb-2">
            3. Daily Grand Total: Finger Markers
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white p-3 rounded border">
              <span className="text-xs text-gray-500 block">Received</span>
              <span className="text-2xl font-black text-gray-800">{grandTotalMarkers.received || 0}</span>
            </div>
            <div className="bg-white p-3 rounded border">
              <span className="text-xs text-gray-500 block">Used</span>
              <span className="text-2xl font-black text-green-700">{grandTotalMarkers.used || 0}</span>
            </div>
            <div className="bg-white p-3 rounded border">
              <span className="text-xs text-gray-500 block">Returned</span>
              <span className="text-2xl font-black text-blue-700">{grandTotalMarkers.returned || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form2BInventory;