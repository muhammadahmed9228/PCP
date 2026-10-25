import React from "react";

const OmpSnapshot = ({ data }) => {
  if (!data) return null;

  const leader = data.teamLeader || {};
  const member = data.teamMember || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 0: Operational & Area Snapshot */}
        <div className="bg-gray-50 p-4 border rounded shadow-sm space-y-3">
          <h4 className="font-semibold text-gray-800 border-b pb-2">
            Section 0: Campaign, Area & Route Details
          </h4>
          <ul className="text-sm space-y-2 text-gray-700">
            <li><strong>Campaign:</strong> {data.campaignName || "N/A"}</li>
            <li><strong>SIA Name:</strong> {data.sia || "N/A"}</li>
            <li><strong>Day:</strong> Day {data.campaignDay || "N/A"}</li>
            <li className="pt-1 border-t"><strong>District / Tehsil:</strong> {data.district || "N/A"} / {data.tehsil || "N/A"}</li>
            <li><strong>UC:</strong> {data.ucName || "N/A"} ({data.ucNumber || "N/A"})</li>
            <li><strong>Area:</strong> {data.areaName || "N/A"} ({data.areaNo || "N/A"})</li>
            <li className="pt-1 border-t text-blue-900 font-medium">
              <strong>Assigned Route:</strong> Route {data.routeNo || "N/A"} — {data.routeName || "N/A"}
            </li>
          </ul>
        </div>

        {/* Section 1: Team & Personnel Snapshot */}
        <div className="bg-blue-50 p-4 border border-blue-200 rounded shadow-sm space-y-3">
          <h4 className="font-semibold text-blue-900 border-b border-blue-200 pb-2">
            Section 1: Mobile Team Personnel
          </h4>
          <div className="text-sm text-gray-800 font-bold">
            Team Number: <span className="text-blue-700">{data.teamNo || "N/A"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-100">
            <div className="bg-white p-3 rounded border border-blue-100">
              <span className="text-xs uppercase font-bold text-gray-500 block mb-1">Team Leader</span>
              <p className="font-semibold text-gray-900">{leader.name || "N/A"}</p>
              <p className="text-xs text-gray-600">Role: {leader.position || "N/A"}</p>
              <p className="text-xs text-gray-600">CNIC: {leader.cnic || "N/A"}</p>
              {leader.states?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {leader.states.map((s, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold">{s}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-3 rounded border border-blue-100">
              <span className="text-xs uppercase font-bold text-gray-500 block mb-1">Team Member</span>
              <p className="font-semibold text-gray-900">{member.name || "N/A"}</p>
              <p className="text-xs text-gray-600">Role: {member.position || "N/A"}</p>
              <p className="text-xs text-gray-600">CNIC: {member.cnic || "N/A"}</p>
              {member.states?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {member.states.map((s, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmpSnapshot;
