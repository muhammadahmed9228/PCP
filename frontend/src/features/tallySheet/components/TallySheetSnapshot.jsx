import React from "react";

const TallySheetSnapshot = ({ snapshot, day }) => {
  if (!snapshot || !snapshot.campaignName) {
    return (
      <div className="bg-amber-50 border border-amber-200 p-4 rounded text-amber-900 text-sm">
        <strong className="block font-semibold mb-1">Sections 1-4 Snapshot Missing:</strong>
        A Finalized OMP is required for this Mobile Team on Day {day || "N/A"} to auto-populate the snapshot. Please ensure your AIC has created and finalized the OMP.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-bold text-gray-800 text-base">
          Sections 1-4: Auto-Populated Snapshot (from Finalized OMP)
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 bg-green-100 text-green-800 rounded">
          OMP Cloned
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Campaign & UCI */}
        <div className="bg-gray-50 p-3.5 border rounded shadow-sm text-sm space-y-1.5 text-gray-700">
          <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wide border-b pb-1 text-gray-500">
            Campaign & Administration
          </h4>
          <p><strong>Campaign:</strong> {snapshot.campaignName}</p>
          <p><strong>SIA:</strong> {snapshot.sia}</p>
          <p><strong>UCI:</strong> {snapshot.uciName} ({snapshot.uciNo})</p>
          <p className="text-xs text-gray-500">
            {snapshot.province} • {snapshot.district} • {snapshot.tehsil}
          </p>
        </div>

        {/* AIC & Area */}
        <div className="bg-gray-50 p-3.5 border rounded shadow-sm text-sm space-y-1.5 text-gray-700">
          <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wide border-b pb-1 text-gray-500">
            Area & Supervision
          </h4>
          <p><strong>UC:</strong> {snapshot.ucName} ({snapshot.ucNo})</p>
          <p><strong>Area:</strong> {snapshot.areaName} ({snapshot.areaNo})</p>
          <p><strong>AIC:</strong> {snapshot.aicName} ({snapshot.aicNo})</p>
        </div>

        {/* Route & Team */}
        <div className="bg-blue-50 p-3.5 border border-blue-200 rounded shadow-sm text-sm space-y-1.5 text-blue-950">
          <h4 className="font-semibold text-blue-900 text-xs uppercase tracking-wide border-b border-blue-200 pb-1">
            Route & Team
          </h4>
          <p><strong>Route:</strong> Route {snapshot.routeNo} — {snapshot.routeName}</p>
          <p><strong>Team No:</strong> {snapshot.teamNo}</p>
          <p className="pt-1 text-xs text-blue-900">
            <strong>Leader:</strong> {snapshot.teamLeaderName || "N/A"} | <strong>Member:</strong> {snapshot.teamMemberName || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TallySheetSnapshot;
