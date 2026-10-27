import { useTranslation } from "react-i18next";

const OmpSnapshot = ({ data }) => {
  const { t } = useTranslation();
  if (!data) return null;

  const leader = data.teamLeader || {};
  const member = data.teamMember || {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Section 0: Operational & Area Snapshot */}
        <div className="bg-gray-50 p-4 border rounded shadow-sm space-y-3">
          <h4 className="font-semibold text-gray-800 border-b pb-2">
            {t("ompSnapshotSection0")}
          </h4>
          <ul className="text-sm space-y-2 text-gray-700">
            <li><strong>{t("campaign")}:</strong> {data.campaignName || t("notAvailableShort")}</li>
            <li><strong>{t("teamSiaName")}:</strong> {data.sia || t("notAvailableShort")}</li>
            <li><strong>{t("day")}:</strong> {data.campaignDay ? t("geoDay", { day: data.campaignDay }) : t("notAvailableShort")}</li>
            <li className="pt-1 border-t"><strong>{t("districtTehsil")}:</strong> {data.district || t("notAvailableShort")} / {data.tehsil || t("notAvailableShort")}</li>
            <li><strong>{t("uc")}:</strong> {data.ucName || t("notAvailableShort")} ({data.ucNumber || t("notAvailableShort")})</li>
            <li><strong>{t("area")}:</strong> {data.areaName || t("notAvailableShort")} ({data.areaNo || t("notAvailableShort")})</li>
            <li className="pt-1 border-t text-blue-900 font-medium">
              <strong>{t("assignedRoute")}:</strong> {t("route")} {data.routeNo || t("notAvailableShort")} — {data.routeName || t("notAvailableShort")}
            </li>
          </ul>
        </div>

        {/* Section 1: Team & Personnel Snapshot */}
        <div className="bg-blue-50 p-4 border border-blue-200 rounded shadow-sm space-y-3">
          <h4 className="font-semibold text-blue-900 border-b border-blue-200 pb-2">
            {t("ompSnapshotSection1")}
          </h4>
          <div className="text-sm text-gray-800 font-bold">
            {t("teamNumber")}: <span className="text-blue-700">{data.teamNo || t("notAvailableShort")}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-100">
            <div className="bg-white p-3 rounded border border-blue-100">
              <span className="text-xs uppercase font-bold text-gray-500 block mb-1">{t("teamLeader")}</span>
              <p className="font-semibold text-gray-900">{leader.name || t("notAvailableShort")}</p>
              <p className="text-xs text-gray-600">{t("role")}: {leader.position || t("notAvailableShort")}</p>
              <p className="text-xs text-gray-600">{t("cnic")}: {leader.cnic || t("notAvailableShort")}</p>
              {leader.states?.length > 0 && (
                <div className="flex gap-1 mt-1">
                  {leader.states.map((s, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold">{s}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-3 rounded border border-blue-100">
              <span className="text-xs uppercase font-bold text-gray-500 block mb-1">{t("teamMember")}</span>
              <p className="font-semibold text-gray-900">{member.name || t("notAvailableShort")}</p>
              <p className="text-xs text-gray-600">{t("role")}: {member.position || t("notAvailableShort")}</p>
              <p className="text-xs text-gray-600">{t("cnic")}: {member.cnic || t("notAvailableShort")}</p>
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
