import React from "react";

const AmpSnapshot = ({ data }) => {
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Section 1: Campaign & SIA */}
        <div className="bg-gray-50 p-4 border rounded shadow-sm">
          <h4 className="font-semibold text-gray-800 border-b pb-2 mb-3">
            Section 1: Campaign & Area
          </h4>
          <ul className="text-sm space-y-2 text-gray-700">
            <li><strong>Campaign Name:</strong> {data.campaignName || "N/A"}</li>
            <li><strong>SIA Name:</strong> {data.sia || "N/A"}</li>
            <li><strong>Area Number:</strong> {data.areaNo || "N/A"}</li>
            <li><strong>Area Name:</strong> {data.areaName || "N/A"}</li>
          </ul>
        </div>

        {/* Section 2: Administrative Geography */}
        <div className="bg-gray-50 p-4 border rounded shadow-sm">
          <h4 className="font-semibold text-gray-800 border-b pb-2 mb-3">
            Section 2: Location & UC Details
          </h4>
          <ul className="text-sm space-y-2 text-gray-700">
            <li><strong>District:</strong> {data.district || "N/A"}</li>
            <li><strong>Tehsil/Town:</strong> {data.tehsil || "N/A"}</li>
            <li><strong>UC Name:</strong> {data.ucName || "N/A"}</li>
            <li><strong>UC Number:</strong> {data.ucNumber || "N/A"}</li>
            <li className="pt-1 border-t text-xs text-gray-500">
              <strong>UCI:</strong> {data.uciName || "N/A"} ({data.uciNo || "N/A"})
            </li>
          </ul>
        </div>

        {/* Section 3: AIC Snapshot Info */}
        <div className="bg-blue-50 p-4 border border-blue-200 rounded shadow-sm">
          <h4 className="font-semibold text-blue-900 border-b border-blue-200 pb-2 mb-3">
            Section 3: AIC Personnel Details
          </h4>
          <ul className="text-sm space-y-2 text-blue-950">
            <li><strong>AIC Name:</strong> {data.aicName || "N/A"}</li>
            <li><strong>Phone Number:</strong> {data.aicPhoneNo || "N/A"}</li>
            <li><strong>Gender:</strong> {data.aicGender || "N/A"}</li>
            <li><strong>Govt Employee:</strong> {data.isGovtEmployee ? "Yes" : "No"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AmpSnapshot;
