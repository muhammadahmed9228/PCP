import { useTranslation } from "react-i18next";

const TallySheetSnapshot = ({ snapshot, day }) => {
  const { t } = useTranslation();
  if (!snapshot || !snapshot.campaignName) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <strong className="block font-semibold mb-1">{t("snapshotMissing")}</strong>
        {t("snapshotRequired", { day: day || "N/A" })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-bold text-slate-900">
          {t("autoSnapshot")}
        </h3>
        <span className="w-fit rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800">
          {t("ompCloned")}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
        {/* Campaign & UCI */}
        <div className="space-y-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">
          <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wide border-b pb-1 text-gray-500">
            {t("campaignAdministration")}
          </h4>
          <p><strong>{t("campaign")}:</strong> {snapshot.campaignName}</p>
          <p><strong>{t("sia")}:</strong> {snapshot.sia}</p>
          <p><strong>{t("uci")}:</strong> {snapshot.uciName} ({snapshot.uciNo})</p>
          <p className="text-xs text-gray-500">
            {snapshot.province} • {snapshot.district} • {snapshot.tehsil}
          </p>
        </div>

        {/* AIC & Area */}
        <div className="space-y-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">
          <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wide border-b pb-1 text-gray-500">
            {t("areaSupervision")}
          </h4>
          <p><strong>{t("uc")}:</strong> {snapshot.ucName} ({snapshot.ucNo})</p>
          <p><strong>{t("area")}:</strong> {snapshot.areaName} ({snapshot.areaNo})</p>
          <p><strong>{t("aic")}:</strong> {snapshot.aicName} ({snapshot.aicNo})</p>
        </div>

        {/* Route & Team */}
        <div className="space-y-1.5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950 shadow-sm">
          <h4 className="font-semibold text-blue-900 text-xs uppercase tracking-wide border-b border-blue-200 pb-1">
            {t("routeTeam")}
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
