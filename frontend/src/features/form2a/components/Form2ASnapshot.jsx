import React from "react";

const Form2ASnapshot = ({ data }) => {
  if (!data) return null;
  const { snapshot, teamCounts } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Sections 1 & 2 */}
        <div className="bg-gray-50 p-4 border rounded shadow-sm">
          <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Campaign & Personnel</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li><strong>Campaign:</strong> {snapshot.campaignName}</li>
            <li><strong>SID:</strong> {snapshot.sia}</li>
            <li><strong>Day:</strong> {data.campaignDay}</li>
            <li className="pt-2"><strong>UCI:</strong> {snapshot.uciName} ({snapshot.uciNo})</li>
            <li><strong>AIC:</strong> {snapshot.aicName} ({snapshot.aicNo})</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="bg-gray-50 p-4 border rounded shadow-sm">
          <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Area Information</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li><strong>Province:</strong> {snapshot.province}</li>
            <li><strong>District:</strong> {snapshot.district}</li>
            <li><strong>Tehsil/Town:</strong> {snapshot.tehsil}</li>
            <li><strong>UC:</strong> {snapshot.ucName} ({snapshot.ucNo})</li>
            <li><strong>Area:</strong> {snapshot.areaName} ({snapshot.areaNo})</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="bg-blue-50 p-4 border border-blue-200 rounded shadow-sm">
          <h3 className="font-semibold text-blue-900 border-b border-blue-200 pb-2 mb-3">Teams Reported Today</h3>
          <div className="grid grid-cols-3 gap-2 text-center mt-4">
            <div className="bg-white p-2 rounded shadow-sm">
              <span className="block text-2xl font-bold text-blue-700">{teamCounts.totalMobile}</span>
              <span className="text-xs text-gray-600 font-medium">Mobile</span>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <span className="block text-2xl font-bold text-blue-700">{teamCounts.totalFixed}</span>
              <span className="text-xs text-gray-600 font-medium">Fixed</span>
            </div>
            <div className="bg-white p-2 rounded shadow-sm">
              <span className="block text-2xl font-bold text-blue-700">{teamCounts.totalTransit}</span>
              <span className="text-xs text-gray-600 font-medium">Transit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form2ASnapshot;