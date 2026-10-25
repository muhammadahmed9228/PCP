import React from "react";

const Form2BSnapshot = ({ data }) => {
  if (!data) return null;
  const { snapshot = {}, reportingSummary = {} } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sections 1 & 2: Campaign & UCI Info */}
        <div className="bg-gray-50 p-4 border rounded shadow-sm">
          <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">
            Sections 1 & 2: Campaign & UCI Info
          </h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li><strong>Campaign Name:</strong> {snapshot.campaignName}</li>
            <li><strong>SIA:</strong> {snapshot.sia}</li>
            <li><strong>Campaign Day:</strong> Day {data.campaignDay}</li>
            <li className="pt-2 border-t"><strong>UCI Name:</strong> {snapshot.uciName}</li>
            <li><strong>UCI Number:</strong> {snapshot.uciNo}</li>
          </ul>
        </div>

        {/* Section 3: UC / Area Information */}
        <div className="bg-gray-50 p-4 border rounded shadow-sm">
          <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">
            Section 3: UC Geography
          </h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li><strong>Province:</strong> {snapshot.province}</li>
            <li><strong>District/Agency:</strong> {snapshot.district}</li>
            <li><strong>Tehsil/Town:</strong> {snapshot.tehsil}</li>
            <li><strong>UC Name:</strong> {snapshot.ucName}</li>
            <li><strong>UC Number:</strong> {snapshot.ucNo}</li>
          </ul>
        </div>

        {/* Section 4: AICs & Field Teams Detail */}
        <div className="bg-blue-50 p-4 border border-blue-200 rounded shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 border-b border-blue-200 pb-2 mb-3">
              Section 4: AICs & Field Teams Detail
            </h3>
            <div className="flex justify-between items-center bg-white px-3 py-2 rounded border mb-3">
              <span className="text-sm font-medium text-gray-700">Total AICs Reported:</span>
              <span className="text-xl font-black text-blue-800">{reportingSummary.totalAicsReported || 0}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white p-2 rounded border">
                <span className="block text-xl font-bold text-blue-700">{reportingSummary.totalMobileTeams || 0}</span>
                <span className="text-xs text-gray-600">Mobile</span>
              </div>
              <div className="bg-white p-2 rounded border">
                <span className="block text-xl font-bold text-indigo-700">{reportingSummary.totalFixedTeams || 0}</span>
                <span className="text-xs text-gray-600">Fixed</span>
              </div>
              <div className="bg-white p-2 rounded border">
                <span className="block text-xl font-bold text-teal-700">{reportingSummary.totalTransitTeams || 0}</span>
                <span className="text-xs text-gray-600">Transit</span>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-blue-700 text-white px-3 py-2 rounded flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Field Teams Reported</span>
            <span className="text-2xl font-black">{reportingSummary.totalFieldTeamsReported || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form2BSnapshot;