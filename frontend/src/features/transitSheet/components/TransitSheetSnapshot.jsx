import { useTranslation } from "react-i18next";

const TransitSheetSnapshot = ({ snapshot, day }) => {
  const { t } = useTranslation();
  if (!snapshot || !snapshot.campaignName) {
    return (
      <div className="bg-amber-50 border border-amber-200 p-4 rounded text-amber-900 text-sm">
        <strong className="block font-semibold mb-1">{t("transitSnapshotPreview")}</strong>
        {t("selectValidTransitPoint")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-bold text-gray-800 text-base">
          {t("transitAutoSnapshot")}
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-800 rounded">
          {t("transitPointSnapshot")}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Campaign & UCI */}
        <div className="bg-gray-50 p-3.5 border rounded shadow-sm text-sm space-y-1.5 text-gray-700">
          <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wide border-b pb-1 text-gray-500">
            {t("campaignAdministration")}
          </h4>
          <p><strong>{t("campaign")}:</strong> {snapshot.campaignName}</p>
          <p><strong>{t("sia")}:</strong> {snapshot.sia || "N/A"}</p>
          <p><strong>{t("day")}:</strong> {t("day")} {day || "N/A"}</p>
          <p><strong>{t("uci")}:</strong> {snapshot.uciName} ({snapshot.uciNo})</p>
          <p className="text-xs text-gray-500">
            {snapshot.province} • {snapshot.district} • {snapshot.tehsil}
          </p>
        </div>

        {/* AIC & Area */}
        <div className="bg-gray-50 p-3.5 border rounded shadow-sm text-sm space-y-1.5 text-gray-700">
          <h4 className="font-semibold text-gray-900 text-xs uppercase tracking-wide border-b pb-1 text-gray-500">
            {t("areaSupervision")}
          </h4>
          <p><strong>{t("uc")}:</strong> {snapshot.ucName} ({snapshot.ucNo})</p>
          <p><strong>{t("area")}:</strong> {snapshot.areaName} ({snapshot.areaNo})</p>
          <p><strong>{t("aic")}:</strong> {snapshot.aicName} ({snapshot.aicNo})</p>
        </div>

        {/* Point & Team */}
        <div className="bg-amber-50 p-3.5 border border-amber-200 rounded shadow-sm text-sm space-y-1.5 text-amber-950">
          <h4 className="font-semibold text-amber-900 text-xs uppercase tracking-wide border-b border-amber-200 pb-1">
            {t("transitPointTeam")}
          </h4>
          <p><strong>Point:</strong> {snapshot.transitPointNumber} — {snapshot.transitPointName}</p>
          <p><strong>Team No:</strong> {snapshot.teamNo}</p>
          <p className="pt-1 text-xs text-amber-900">
            <strong>Leader:</strong> {snapshot.teamLeaderName || "N/A"} | <strong>Member:</strong> {snapshot.teamMemberName || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransitSheetSnapshot;
